"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LearnQuestion } from "@/lib/learning";
import { rateQuestionAction, setBookmarkAction } from "@/app/actions/progress";
import { Card, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MicInput } from "@/components/MicInput";
import { Citations } from "@/components/Citations";

const IMAGE_PROMPTS = [
  "Beschreiben Sie den Befund.",
  "Was ist Ihre Verdachtsdiagnose?",
  "Welche Differenzialdiagnosen kommen infrage?",
  "Welche weiteren Untersuchungen würden Sie durchführen?",
  "Wie würden Sie den Patienten behandeln?",
];

export function LearnSession({
  questions,
  title,
  mode = "lernen",
}: {
  questions: LearnQuestion[];
  title: string;
  mode?: "lernen" | "bildfragen";
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answer, setAnswer] = useState("");

  const question = questions[index];

  function goNext() {
    setIndex((i) => Math.min(i + 1, questions.length - 1));
    setRevealed(false);
    setBookmarked(false);
    setAnswer("");
  }

  async function rate(confidence: "SICHER" | "TEILWEISE" | "NICHT_GEWUSST") {
    if (!question) return;
    setSaving(true);
    await rateQuestionAction({ questionId: question.id, confidence });
    setSaving(false);
    goNext();
  }

  async function toggleBookmark() {
    if (!question) return;
    const next = !bookmarked;
    setBookmarked(next);
    await setBookmarkAction({ questionId: question.id, bookmarked: next });
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardDescription>
          In diesem Bereich sind noch keine veröffentlichten Fragen vorhanden.
        </CardDescription>
        <Link href="/lernen" className="mt-4 inline-block text-xs font-medium text-accent hover:underline">
          ← Zurück zur Fachgebietsauswahl
        </Link>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardDescription>Sie haben alle Fragen in dieser Auswahl bearbeitet.</CardDescription>
        <Link href="/lernen" className="mt-4 inline-block text-xs font-medium text-accent hover:underline">
          ← Zurück zur Fachgebietsauswahl
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-medium">Lernsitzung</span>
          <h1 className="text-xl font-normal tracking-tight text-foreground sm:text-2xl">{title}</h1>
        </div>
        <span className="font-mono text-xs text-muted">
          {index + 1} / {questions.length}
        </span>
      </div>

      <Card key={question.id} className="animate-fade-in-up">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {question.specialties.map((s) => (
            <Badge key={s} tone="neutral">
              {s}
            </Badge>
          ))}
        </div>
        <p className="text-lg leading-relaxed text-foreground font-normal tracking-[-0.015em]">
          {question.originalText}
        </p>

        {question.images.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {question.images.map((img, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-[4px] border border-border bg-surface-elevated">
                <Image src={img.url} alt={img.caption ?? ""} fill className="object-contain" unoptimized />
              </div>
            ))}
          </div>
        )}

        {mode === "bildfragen" && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-secondary">
            {IMAGE_PROMPTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {!revealed && (
          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-wider font-medium text-muted">
              Ihre Antwort (optional, zur eigenen Übung)
            </p>
            <MicInput name="answer" value={answer} onChange={setAnswer} rows={4} />
          </div>
        )}

        {revealed && (
          <div className="animate-fade-in-up mt-6 rounded-[4px] border border-border bg-surface-elevated p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs uppercase tracking-wider font-medium text-forest">
                Musterantwort
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {question.modelAnswer ?? "Für diese Frage liegt noch keine Musterantwort vor."}
            </p>
            <Citations citations={question.citations} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
          {!revealed ? (
            <Button type="button" variant="primary" onClick={() => setRevealed(true)}>
              Antwort anzeigen
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="forest" disabled={saving} onClick={() => rate("SICHER")}>
                ✓ Sicher
              </Button>
              <Button type="button" variant="amber" disabled={saving} onClick={() => rate("TEILWEISE")}>
                ~ Teilweise sicher
              </Button>
              <Button type="button" variant="danger" disabled={saving} onClick={() => rate("NICHT_GEWUSST")}>
                ✕ Nicht gewusst
              </Button>
            </div>
          )}
          <Button type="button" variant="ghost" onClick={toggleBookmark}>
            {bookmarked ? "★ Gemerkt" : "☆ Merken"}
          </Button>
          <Button type="button" variant="secondary" onClick={goNext} className="ml-auto">
            Nächste Frage →
          </Button>
        </div>
      </Card>
    </div>
  );
}
