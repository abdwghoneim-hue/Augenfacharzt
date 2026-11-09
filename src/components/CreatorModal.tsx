"use client";

import Image from "next/image";
import { X, Sparkles, Award, Eye } from "lucide-react";

interface CreatorModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatorModal({ open, onClose }: CreatorModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-2xl animate-scale-in">
        {/* Subtle Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-sky-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="text-center pt-2">
          {/* Emblem Icon: Huge, Ultra-Sharp AG + Glowing Eye */}
          <div className="relative mx-auto mb-4 flex size-28 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl" />
            <div className="relative size-28 overflow-hidden rounded-2xl border-2 border-accent/40 bg-[#07131e] shadow-2xl transition-transform hover:scale-105">
              <Image
                src="/branding/dr-ghunaim-emblem-sharp.png"
                alt="Dr. Abdelhamid Ghunaim – Logo Emblem"
                fill
                priority
                sizes="112px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-semibold text-foreground mb-2 shadow-xs">
            <Sparkles className="size-3.5 text-accent" />
            <span>Medizinisches Konzept & Plattformdesign</span>
          </div>

          {/* Doctor Name - Large, Crisp, 100% Readable Typography */}
          <h2
            id="creator-dialog-title"
            className="text-2xl font-extrabold tracking-tight text-foreground"
          >
            Dr. Abdelhamid Ghunaim
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-semibold tracking-wider text-accent uppercase">
            Ophthalmology • Facharzt für Augenheilkunde
          </p>

          {/* Bio / Description with High Contrast and Clear Font */}
          <div className="mt-5 rounded-xl border border-border bg-surface-elevated/70 p-4 text-left text-xs sm:text-sm leading-relaxed text-foreground space-y-3">
            <div className="flex items-start gap-3">
              <Eye className="size-4 sm:size-5 text-accent shrink-0 mt-0.5" />
              <p>
                Konzeption und wissenschaftliche Strukturierung der Vorbereitungsplattform für die
                mündliche <strong className="font-semibold text-foreground">Facharztprüfung Augenheilkunde</strong> in Deutschland.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Award className="size-4 sm:size-5 text-accent shrink-0 mt-0.5" />
              <p>
                Entwickelt nach den Richtlinien der Landesärztekammern und den aktuellen
                Leitlinien der <strong className="font-semibold text-foreground">Deutschen Ophthalmologischen Gesellschaft (DOG / BVA)</strong>.
              </p>
            </div>
          </div>

          {/* Action Button: Guaranteed Ultra-High Contrast in ALL Themes */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-[var(--radius-button)] bg-foreground px-5 py-3 text-sm font-bold text-background shadow-lg transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
