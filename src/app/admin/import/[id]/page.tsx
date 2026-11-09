import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ContentStatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { markBatchReviewedAction } from "@/app/actions/import";

export default async function ImportBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await prisma.importBatch.findUnique({
    where: { id },
    include: {
      questions: {
        include: { specialties: { include: { specialty: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!batch) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/import" className="text-sm text-accent hover:underline">
          ← Alle Importe
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">{batch.fileName}</h1>
        <p className="mt-1 text-sm text-muted">
          {batch.fileType} · hochgeladen am {new Date(batch.uploadedAt).toLocaleString("de-DE")}
        </p>
      </div>

      {batch.errorMessage && (
        <Alert tone={batch.status === "FAILED" ? "danger" : "warning"}>{batch.errorMessage}</Alert>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>{batch.questions.length} erkannte Fragen</CardTitle>
          <CardDescription>
            Jede Frage einzeln prüfen, Fachgebiet zuordnen und freigeben, bevor sie für Lernende
            sichtbar wird.
          </CardDescription>
        </div>
        {batch.status !== "REVIEWED" && (
          <form action={markBatchReviewedAction}>
            <input type="hidden" name="id" value={batch.id} />
            <Button type="submit" variant="secondary">
              Import als geprüft markieren
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <ul className="divide-y divide-border">
          {batch.questions.map((q) => (
            <li key={q.id} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <Link href={`/admin/fragen/${q.id}`} className="text-sm text-foreground hover:text-accent">
                  {q.originalText.slice(0, 140)}
                  {q.originalText.length > 140 ? "…" : ""}
                </Link>
                <p className="text-xs text-muted">
                  {q.pageReference ?? ""}{" "}
                  {q.specialties.length > 0
                    ? `· ${q.specialties.map((s) => s.specialty.name).join(", ")}`
                    : "· Kein Fachgebiet zugeordnet"}
                </p>
              </div>
              {q.specialties.length === 0 && <Badge tone="warning">Fachgebiet fehlt</Badge>}
              <ContentStatusBadge status={q.status} />
            </li>
          ))}
          {batch.questions.length === 0 && (
            <li className="py-6 text-center text-sm text-muted">
              Keine Fragen automatisch erkannt. Bitte den Rohtext unten prüfen und Fragen bei Bedarf
              manuell anlegen.
            </li>
          )}
        </ul>
      </Card>

      {batch.rawText && (
        <Card>
          <CardTitle>Extrahierter Rohtext</CardTitle>
          <CardDescription>Zur manuellen Kontrolle, insbesondere bei nicht erkannten Fragen.</CardDescription>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-[var(--radius-button)] border border-border bg-surface-recessed p-4 text-xs text-foreground font-mono">
            {batch.rawText}
          </pre>
        </Card>
      )}
    </div>
  );
}
