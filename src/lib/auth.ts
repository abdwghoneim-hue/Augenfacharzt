import "server-only";
import { randomBytes, createHash } from "crypto";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserModel as User } from "@/generated/prisma/models";

const SESSION_COOKIE = "af_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: string, rememberMe: boolean = true) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const ttl = rememberMe ? SESSION_TTL_MS : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttl);

  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  try {
    const h = await headers();
    userAgent = h.get("user-agent") ?? undefined;
    ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  } catch {
    // headers() unavailable outside a request scope (e.g. seed scripts) — fine to skip.
  }

  await prisma.session.create({
    data: { userId, tokenHash, expiresAt, userAgent, ipAddress },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { expires: expiresAt } : {}),
  });

  return token;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyAllSessionsForUser(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

/** Resolves the current session's user from the request cookie. Returns null if absent/expired. */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

/** Throws-free guard for use in Server Actions / route handlers. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") {
    throw new Error("NOT_AUTHENTICATED");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("NOT_AUTHORIZED");
  }
  return user;
}

// ---------- Password reset ----------

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  return token;
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return record.userId;
}

// ---------- Simple in-memory brute-force limiter ----------
// NOTE: per-process memory only. Fine for a single Stage 1 instance; swap for
// Redis/Upstash if the app ever runs multiple instances behind a load balancer.

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}
