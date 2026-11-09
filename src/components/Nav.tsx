import Link from "next/link";
import Image from "next/image";
import type { UserModel as User } from "@/generated/prisma/models";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";

const USER_LINKS = [
  { href: "/", label: "Übersicht" },
  { href: "/lernen", label: "Lernmodus" },
  { href: "/pruefung", label: "Prüfungssimulation" },
  { href: "/bildfragen", label: "Bildfragen" },
  { href: "/wiederholungen", label: "Meine Wiederholungen" },
  { href: "/fortschritt", label: "Lernfortschritt" },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Admin-Übersicht" },
  { href: "/admin/fragen", label: "Fragenverwaltung" },
  { href: "/admin/import", label: "Dokumente hochladen" },
  { href: "/admin/freigabe", label: "Inhaltsfreigabe" },
  { href: "/admin/benutzer", label: "Benutzerverwaltung" },
  { href: "/admin/fachgebiete", label: "Fachgebiete" },
];

export function Nav({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/branding/daog-eye-mark.png"
            alt="Deutsch-Arabische Ophthalmologische Gesellschaft"
            width={33}
            height={18}
            className="opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="text-sm font-medium tracking-tight text-foreground">AugenFacharzt</span>
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1">
          {USER_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          {user.role === "ADMIN" && (
            <>
              <span className="text-border select-none">/</span>
              {ADMIN_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} tone="admin">
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/konto" className="text-xs text-muted transition-colors hover:text-foreground">
            {user.username}
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" size="sm">
              Abmelden
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
