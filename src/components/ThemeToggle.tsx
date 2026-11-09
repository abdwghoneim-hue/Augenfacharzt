"use client";

import { useTheme, type VisualIdentity } from "@/lib/themeStore";
import { cn } from "@/lib/cn";

export type { VisualIdentity };

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();

  return (
    <div
      role="group"
      aria-label="Erscheinungsbild wählen"
      className={cn(
        "inline-flex h-7 items-center rounded-[var(--radius-button)] border border-border bg-surface-elevated/60 p-0.5 text-xs select-none transition-colors",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("cursor")}
        aria-pressed={theme === "cursor"}
        title="Cursor-Identität: Warmes Pergament & Elfenbein (Atelier)"
        className={cn(
          "flex h-full items-center gap-1.5 rounded-[calc(var(--radius-button)-2px)] px-2.5 text-xs transition-all cursor-pointer",
          theme === "cursor"
            ? "bg-surface font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            : "text-muted hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-transform",
            theme === "cursor" ? "bg-[#f54e00] scale-110" : "bg-muted/60",
          )}
        />
        <span>Cursor</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("auros")}
        aria-pressed={theme === "auros"}
        title="Auros-Identität: Liquid Abyss Dunkelmodus & Biolumineszenz"
        className={cn(
          "flex h-full items-center gap-1.5 rounded-[calc(var(--radius-button)-2px)] px-2.5 text-xs transition-all cursor-pointer",
          theme === "auros"
            ? "bg-surface font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            : "text-muted hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-transform",
            theme === "auros"
              ? "bg-[#00a89d] shadow-[0_0_6px_#00a89d] scale-110"
              : "bg-muted/60",
          )}
        />
        <span>Auros</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("discord")}
        aria-pressed={theme === "discord"}
        title="Discord-Identität: Cosmic Dark & Blurple (#5865f2)"
        className={cn(
          "flex h-full items-center gap-1.5 rounded-[calc(var(--radius-button)-2px)] px-2.5 text-xs transition-all cursor-pointer",
          theme === "discord"
            ? "bg-surface font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
            : "text-muted hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-transform",
            theme === "discord"
              ? "bg-[#5865f2] shadow-[0_0_6px_#5865f2] scale-110"
              : "bg-muted/60",
          )}
        />
        <span>Discord</span>
      </button>
    </div>
  );
}
