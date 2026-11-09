"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createPasswordResetToken,
  createSession,
  consumePasswordResetToken,
  destroyCurrentSession,
  hashPassword,
  isRateLimited,
  verifyPassword,
} from "@/lib/auth";

export type ActionState = { error?: string; success?: string } | null;

async function clientKey(suffix: string) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    return `${ip}:${suffix}`;
  } catch {
    return suffix;
  }
}

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Der Benutzername muss mindestens 3 Zeichen lang sein.")
  .max(32, "Der Benutzername darf höchstens 32 Zeichen lang sein.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Nur Buchstaben, Zahlen, Punkt, Bindestrich und Unterstrich erlaubt.");

const passwordSchema = z
  .string()
  .min(10, "Das Passwort muss mindestens 10 Zeichen lang sein.")
  .max(128, "Das Passwort ist zu lang.");

const registerSchema = z
  .object({
    username: usernameSchema,
    email: z.union([z.literal(""), z.string().trim().email("Ungültige E-Mail-Adresse.")]),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const settings = await prisma.registrationSettings.findUnique({ where: { id: 1 } });
  if (settings && !settings.registrationOpen) {
    return { error: "Die Registrierung ist derzeit geschlossen. Bitte wenden Sie sich an den Administrator." };
  }

  const { username, password } = parsed.data;
  const email = parsed.data.email === "" ? null : parsed.data.email;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, ...(email ? [{ email }] : [])] },
  });
  if (existing) {
    return { error: "Benutzername oder E-Mail-Adresse wird bereits verwendet." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { username, email, passwordHash, role: "USER", status: "PENDING" },
  });

  redirect("/pending?registered=1");
}

const loginSchema = z.object({
  username: z.string().trim().min(1, "Bitte Benutzernamen eingeben."),
  password: z.string().min(1, "Bitte Passwort eingeben."),
  next: z.string().optional(),
  remember: z.string().optional(),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
    remember: formData.get("remember") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const { username, password, next, remember } = parsed.data;

  const key = await clientKey(`login:${username.toLowerCase()}`);
  if (isRateLimited(key)) {
    return { error: "Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten und versuchen Sie es erneut." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Ungültiger Benutzername oder Passwort." };
  }

  if (user.status !== "APPROVED") {
    const messages: Record<string, string> = {
      PENDING: "Ihr Konto wartet noch auf die Freischaltung durch den Administrator.",
      REJECTED: "Ihre Registrierung wurde abgelehnt. Bitte wenden Sie sich an den Administrator.",
      SUSPENDED: "Ihr Konto wurde gesperrt. Bitte wenden Sie sich an den Administrator.",
    };
    return { error: messages[user.status] ?? "Ihr Konto hat noch keinen Zugriff." };
  }

  const shouldRemember = remember === "on" || remember === "true" || remember === "1";
  await createSession(user.id, shouldRemember);
  redirect(next && next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}

const requestResetSchema = z.object({
  email: z.string().trim().email("Ungültige E-Mail-Adresse."),
});

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestResetSchema.safeParse({ email: formData.get("email") });
  const generic: ActionState = {
    success:
      "Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine Anleitung zum Zurücksetzen vorbereitet.",
  };
  if (!parsed.success) return generic;

  const key = await clientKey(`reset:${parsed.data.email.toLowerCase()}`);
  if (isRateLimited(key)) return generic;

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = await createPasswordResetToken(user.id);
    // Stage 1: no email provider configured — the reset link is logged
    // server-side so an administrator can relay it manually. Wire up
    // SMTP/Resend (see README) to send this automatically instead.
    console.log(
      `[password-reset] Kein E-Mail-Versand konfiguriert. Link für ${user.username}: ` +
        `/passwort-zuruecksetzen/${token}`,
    );
  }
  return generic;
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const userId = await consumePasswordResetToken(parsed.data.token);
  if (!userId) {
    return { error: "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await prisma.session.deleteMany({ where: { userId } });

  redirect("/login?reset=1");
}
