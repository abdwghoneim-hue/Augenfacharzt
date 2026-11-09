import Link from "next/link";
import { requireApprovedUser } from "@/lib/guards";
import { getDueReviewIds, getBookmarkedQuestions } from "@/lib/reviews";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { deleteMyProgressAction } from "@/app/actions/progress";

export default async function WiederholungenPage() {
  const user = await requireApprovedUser();
  const [dueIds, bookmarks] = await Promise.all([
    getDueReviewIds(user.id),
    getBookmarkedQuestions(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Wiederholung
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Meine Wiederholungen</h1>
        <p className="mt-1 text-sm text-muted-secondary">
          Fragen, die anhand Ihrer Selbsteinschätzung erneut fällig sind, priorisiert nach
          Schwierigkeit.
        </p>
      </div>

      <Card className="flex items-center justify-between border-foreground/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-medium">Spaced Repetition</span>
          </div>
          <CardTitle className="text-lg mt-1">{dueIds.length} fällige Fragen</CardTitle>
          <CardDescription>Berechnet nach der Zeitspanne Ihrer letzten Selbsteinschätzung.</CardDescription>
        </div>
        {dueIds.length > 0 && (
          <Link href="/wiederholungen/sitzung">
            <Button type="button" variant="primary">Wiederholung starten →</Button>
          </Link>
        )}
      </Card>

      <Card>
        <CardTitle>Gemerkte Fragen ({bookmarks.length})</CardTitle>
        <CardDescription>Manuell markierte Fragen zur gesonderten Nachbereitung.</CardDescription>
        <ul className="mt-4 divide-y divide-border/60">
          {bookmarks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-normal text-foreground leading-relaxed">{b.question.originalText.slice(0, 140)}</p>
                <p className="font-mono text-xs text-muted mt-0.5">
                  {b.question.specialties.map((s) => s.specialty.name).join(", ") || "—"}
                </p>
              </div>
              <form action={deleteMyProgressAction}>
                <input type="hidden" name="questionId" value={b.questionId} />
                <Button type="submit" variant="ghost" size="sm">
                  Zurücksetzen
                </Button>
              </form>
            </li>
          ))}
          {bookmarks.length === 0 && (
            <li className="py-6 text-center text-sm text-muted">Keine gemerkten Fragen vorhanden.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
