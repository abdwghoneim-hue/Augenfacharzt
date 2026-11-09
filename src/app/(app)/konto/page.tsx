import Link from "next/link";
import { requireApprovedUser } from "@/lib/guards";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { UserStatusBadge, Badge } from "@/components/ui/Badge";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { ThemeSelector } from "@/components/account/ThemeSelector";

export default async function KontoPage() {
  const user = await requireApprovedUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mein Konto</h1>
      </div>

      <Card>
        <CardTitle>{user.username}</CardTitle>
        <CardDescription>{user.email ?? "Keine E-Mail-Adresse hinterlegt"}</CardDescription>
        <div className="mt-2 flex gap-2">
          <UserStatusBadge status={user.status} />
          {user.role === "ADMIN" && <Badge tone="accent">Administrator</Badge>}
        </div>
      </Card>

      {/* Visual Identity / Theme Switcher */}
      <Card>
        <CardTitle>Erscheinungsbild & Visuelle Identität</CardTitle>
        <CardDescription>
          Wählen Sie zwischen drei maßgeschneiderten Design-Systemen: Cursor Atelier, Auros Liquid Abyss oder Discord Cosmic.
        </CardDescription>
        <div className="mt-4">
          <ThemeSelector />
        </div>
      </Card>

      <Card>
        <CardTitle>Passwort ändern</CardTitle>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </Card>

      <Card>
        <CardTitle>Meine Daten</CardTitle>
        <CardDescription>
          Laden Sie eine Kopie Ihrer gespeicherten Lerndaten herunter. Mehr dazu in unserem{" "}
          <Link href="/datenschutz" className="text-accent hover:underline">
            Datenschutzhinweis
          </Link>
          .
        </CardDescription>
        <a
          href="/konto/export"
          className="mt-4 inline-flex items-center rounded-[var(--radius-button)] border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:opacity-90 transition-opacity"
        >
          Meine Daten exportieren (JSON)
        </a>
      </Card>

      <Card className="border-danger/30">
        <CardTitle className="text-danger">Konto löschen</CardTitle>
        <CardDescription>Diese Aktion kann nicht rückgängig gemacht werden.</CardDescription>
        <div className="mt-4">
          <DeleteAccountForm username={user.username} />
        </div>
      </Card>
    </div>
  );
}
