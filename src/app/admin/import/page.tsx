import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImportUploadForm } from "@/components/admin/ImportUploadForm";

const STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "warning" | "success" | "danger" }> = {
  PROCESSING: { label: "Wird verarbeitet", tone: "neutral" },
  NEEDS_REVIEW: { label: "Prüfung erforderlich", tone: "warning" },
  REVIEWED: { label: "Geprüft", tone: "success" },
  FAILED: { label: "Fehlgeschlagen", tone: "danger" },
};

export default async function ImportAdminPage() {
  const batches = await prisma.importBatch.findMany({
    orderBy: { uploadedAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Dokumentenimport
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Dokumente hochladen</h1>
        <p className="mt-1 text-sm text-muted-secondary">
          Fragensammlungen importieren (PDF, DOCX, TXT, XLSX). Erkannte Fragen werden als Entwürfe angelegt und müssen vor
          Veröffentlichung geprüft werden.
        </p>
      </div>

      <Card>
        <CardTitle>Neue Datei importieren</CardTitle>
        <CardDescription>Unterstützt werden Textprotokolle und Tabellen bis 20 MB.</CardDescription>
        <div className="mt-4">
          <ImportUploadForm />
        </div>
      </Card>

      <Card>
        <CardTitle>Bisherige Importe</CardTitle>
        <CardDescription>Historie aller verarbeiteten Fragensammlungen.</CardDescription>
        <ul className="mt-4 divide-y divide-border/60">
          {batches.map((batch) => {
            const status = STATUS_LABELS[batch.status] ?? { label: batch.status, tone: "neutral" as const };
            return (
              <li key={batch.id} className="flex items-center justify-between py-3 hover:bg-surface-elevated/30 transition-colors">
                <div>
                  <Link href={`/admin/import/${batch.id}`} className="text-sm font-normal text-foreground hover:text-accent">
                    {batch.fileName}
                  </Link>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    {batch._count.questions} Fragen erkannt ·{" "}
                    {new Date(batch.uploadedAt).toLocaleString("de-DE")}
                  </p>
                </div>
                <Badge tone={status.tone}>{status.label}</Badge>
              </li>
            );
          })}
          {batches.length === 0 && (
            <li className="py-6 text-center text-sm text-muted">Noch keine Dateien importiert.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
