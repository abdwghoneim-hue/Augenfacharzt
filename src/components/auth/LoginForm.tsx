"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && (
        <Alert tone="danger" className="mb-4">
          {state.error}
        </Alert>
      )}
      <FieldGroup>
        <Label htmlFor="username">Benutzername</Label>
        <Input id="username" name="username" autoComplete="username" required autoFocus />
      </FieldGroup>
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Passwort</Label>
          <Link href="/passwort-vergessen" className="text-xs text-accent hover:underline">
            Passwort vergessen?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FieldGroup>

      {/* Remember Me Option */}
      <div className="flex items-center justify-between py-0.5">
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none hover:text-foreground transition-colors">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            defaultChecked
            className="size-4 rounded-[var(--radius-badge)] border border-border bg-surface-recessed accent-accent cursor-pointer transition-colors"
          />
          <span>Angemeldet bleiben</span>
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Anmelden …" : "Anmelden"}
      </Button>
      <p className="mt-4 text-center text-sm text-muted">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Registrieren
        </Link>
      </p>
    </form>
  );
}
