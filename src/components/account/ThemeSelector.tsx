"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/lib/themeStore";

export function ThemeSelector() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Option 1: Cursor Atelier */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setTheme("cursor")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setTheme("cursor");
          }
        }}
        className={cn(
          "group relative flex flex-col justify-between rounded-[var(--radius-card)] border p-5 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40",
          theme === "cursor"
            ? "border-accent/80 bg-surface shadow-[var(--shadow-elevated)] ring-1 ring-accent/30"
            : "border-border bg-surface hover:border-foreground/30 hover:bg-surface-elevated/40",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#f54e00]" />
              <h3 className="text-sm font-medium text-foreground">Cursor Atelier</h3>
            </div>
            {theme === "cursor" ? (
              <Badge tone="accent" className="flex items-center gap-1">
                <Check className="size-3" />
                Aktiv
              </Badge>
            ) : (
              <span className="text-xs text-muted group-hover:text-foreground">Wählen</span>
            )}
          </div>

          <p className="mt-2.5 text-xs text-muted leading-relaxed">
            Helle, redaktionelle Buchdruck-Ästhetik auf warmem Pergament-Canvas (#f7f7f4),
            präzisen Haarlinien, 4px-Radien und Akzenten in Glut-Orange und Waldgrün.
          </p>
        </div>

        {/* Visual Palette Preview */}
        <div className="mt-5 pt-3 border-t border-border/50">
          <p className="text-[10px] uppercase font-mono tracking-wider text-muted mb-2">Farbpalette</p>
          <div className="flex items-center gap-2">
            <span
              className="size-5 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: "#f7f7f4" }}
              title="Parchment Canvas (#f7f7f4)"
            />
            <span
              className="size-5 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: "#f2f1ed" }}
              title="Bone Surface (#f2f1ed)"
            />
            <span
              className="size-5 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: "#26251e" }}
              title="Ink Typography (#26251e)"
            />
            <span
              className="size-5 rounded-full shadow-xs"
              style={{ backgroundColor: "#f54e00" }}
              title="Ember Accent (#f54e00)"
            />
            <span
              className="size-5 rounded-full shadow-xs"
              style={{ backgroundColor: "#34785c" }}
              title="Forest Green (#34785c)"
            />
          </div>
        </div>
      </div>

      {/* Option 2: Auros Liquid Abyss */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setTheme("auros")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setTheme("auros");
          }
        }}
        className={cn(
          "group relative flex flex-col justify-between rounded-[var(--radius-card)] border p-5 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00a89d]/40",
          theme === "auros"
            ? "border-[#00a89d] bg-surface shadow-[0_0_20px_rgba(0,168,157,0.15)] ring-1 ring-[#00a89d]/30"
            : "border-border bg-surface hover:border-foreground/30 hover:bg-surface-elevated/40",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#00a89d] shadow-[0_0_8px_#00a89d]" />
              <h3 className="text-sm font-medium text-foreground">Auros Liquid Abyss</h3>
            </div>
            {theme === "auros" ? (
              <Badge tone="success" className="flex items-center gap-1">
                <Check className="size-3" />
                Aktiv
              </Badge>
            ) : (
              <span className="text-xs text-muted group-hover:text-foreground">Wählen</span>
            )}
          </div>

          <p className="mt-2.5 text-xs text-muted leading-relaxed">
            Dunkles kryptografisches Interface auf tiefem Ozean-Teal (#012624), schwebenden
            Kelp-Panels (#003734), reinweißer Typografie und biolumineszierendem Phosphor-Glanz (#fde9ff).
          </p>
        </div>

        {/* Visual Palette Preview */}
        <div className="mt-5 pt-3 border-t border-border/50">
          <p className="text-[10px] uppercase font-mono tracking-wider text-muted mb-2">Farbpalette</p>
          <div className="flex items-center gap-2">
            <span
              className="size-5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: "#012624" }}
              title="Liquid Abyss Canvas (#012624)"
            />
            <span
              className="size-5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: "#003734" }}
              title="Liquid Kelp Surface (#003734)"
            />
            <span
              className="size-5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: "#ffffff" }}
              title="Platinum Typography (#ffffff)"
            />
            <span
              className="size-5 rounded-full shadow-xs"
              style={{ backgroundColor: "#fde9ff" }}
              title="Lavender Phosphor (#fde9ff)"
            />
            <span
              className="size-5 rounded-full shadow-[0_0_6px_#00827c]"
              style={{ backgroundColor: "#00827c" }}
              title="Bioluminescent Teal (#00827c)"
            />
          </div>
        </div>
      </div>

      {/* Option 3: Discord Cosmic */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setTheme("discord")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setTheme("discord");
          }
        }}
        className={cn(
          "group relative flex flex-col justify-between rounded-[var(--radius-card)] border p-5 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5865f2]/40",
          theme === "discord"
            ? "border-[#5865f2] bg-surface shadow-[0_0_20px_rgba(88,101,242,0.2)] ring-1 ring-[#5865f2]/40"
            : "border-border bg-surface hover:border-foreground/30 hover:bg-surface-elevated/40",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#5865f2] shadow-[0_0_8px_#5865f2]" />
              <h3 className="text-sm font-medium text-foreground">Discord Cosmic</h3>
            </div>
            {theme === "discord" ? (
              <Badge tone="accent" className="flex items-center gap-1 bg-[#5865f2] text-white border-transparent">
                <Check className="size-3" />
                Aktiv
              </Badge>
            ) : (
              <span className="text-xs text-muted group-hover:text-foreground">Wählen</span>
            )}
          </div>

          <p className="mt-2.5 text-xs text-muted leading-relaxed">
            Atmosphärisches Dark-Theme auf Cosmic-Canvas (#1e1f22 / #2b2d31), ikonischem Blurple-Akzent
            (#5865f2), reiner weißer Typografie, Spring-Green-Highlights und 12px-Radien.
          </p>
        </div>

        {/* Visual Palette Preview */}
        <div className="mt-5 pt-3 border-t border-border/50">
          <p className="text-[10px] uppercase font-mono tracking-wider text-muted mb-2">Farbpalette</p>
          <div className="flex items-center gap-2">
            <span
              className="size-5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: "#1e1f22" }}
              title="Cosmic Canvas (#1e1f22)"
            />
            <span
              className="size-5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: "#2b2d31" }}
              title="Dark Charcoal Card (#2b2d31)"
            />
            <span
              className="size-5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: "#ffffff" }}
              title="Snow Typography (#ffffff)"
            />
            <span
              className="size-5 rounded-full shadow-[0_0_6px_#5865f2]"
              style={{ backgroundColor: "#5865f2" }}
              title="Blurple CTA (#5865f2)"
            />
            <span
              className="size-5 rounded-full shadow-xs"
              style={{ backgroundColor: "#57f287" }}
              title="Spring Green (#57f287)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
