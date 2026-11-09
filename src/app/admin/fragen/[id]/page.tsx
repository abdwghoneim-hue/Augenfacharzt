import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { urlFor } from "@/lib/storage";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ContentStatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { AnswerForm } from "@/components/admin/AnswerForm";
import { ClinicalCaseForm } from "@/components/admin/ClinicalCaseForm";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { StatusControl } from "@/components/admin/StatusControl";
import { deleteQuestionAction, deleteQuestionImageAction, deleteClinicalCaseAction } from "@/app/actions/questions";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [question, specialties] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      include: {
        specialties: true,
        answers: true,
        images: true,
        clinicalCase: { include: { followUps: { orderBy: { order: "asc" } } } },
        importBatch: true,
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!question) notFound();

  const originalAnswer = question.answers.find((a) => a.type === "ORIGINAL");
  const modelAnswer = question.answers.find((a) => a.type === "MODEL");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Frage bearbeiten</h1>
          <div className="mt-2 flex items-center gap-2">
            <ContentStatusBadge status={question.status} />
            <Badge tone="neutral">{question.sourceType === "IMPORT" ? "Import" : "Manuell"}</Badge>
          </div>
        </div>
        <StatusControl entityType="Question" id={question.id} status={question.status} />
      </div>

      {question.sourceType === "IMPORT" && (
        <Card className="bg-accent-soft/40">
          <CardDescription>
            Quelle: {question.sourceFile ?? "unbekannt"}
            {question.pageReference ? ` · Referenz: ${question.pageReference}` : ""}
            {question.importDate
              ? ` · Importiert am ${new Date(question.importDate).toLocaleDateString("de-DE")}`
              : ""}
          </CardDescription>
        </Card>
      )}

      <Card>
        <CardTitle>Fragetext &amp; Fachgebiete</CardTitle>
        <div className="mt-4">
          <QuestionForm
            id={question.id}
            originalText={question.originalText}
            specialties={specialties}
            selectedSpecialtyIds={question.specialties.map((s) => s.specialtyId)}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Originalantwort</CardTitle>
          <CardDescription>Die ursprünglich vorliegende Antwort, unverändert.</CardDescription>
          <div className="mt-4">
            <AnswerForm questionId={question.id} type="ORIGINAL" initialText={originalAnswer?.text} />
          </div>
        </Card>
        <Card>
          <CardTitle>Freigegebene Musterantwort</CardTitle>
          <CardDescription>Wird Lernenden nach Beantwortung angezeigt.</CardDescription>
          <div className="mt-4">
            <AnswerForm questionId={question.id} type="MODEL" initialText={modelAnswer?.text} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Klinischer Fall &amp; Prüfer-Nachfragen</CardTitle>
            <CardDescription>
              Optional: erweitertes Szenario zur Originalfrage, zur Nutzung in der
              Prüfungssimulation. Generierte Inhalte sind als Übungsmaterial zu kennzeichnen und
              erfinden keine authentischen Patientendaten.
            </CardDescription>
          </div>
          {question.clinicalCase && (
            <StatusControl
              entityType="ClinicalCase"
              id={question.clinicalCase.id}
              status={question.clinicalCase.status}
            />
          )}
        </div>
        <div className="mt-4">
          <ClinicalCaseForm
            questionId={question.id}
            scenarioText={question.clinicalCase?.scenarioText}
            followUps={question.clinicalCase?.followUps.map((f) => f.text)}
          />
          {question.clinicalCase && (
            <form action={deleteClinicalCaseAction} className="mt-3">
              <input type="hidden" name="id" value={question.clinicalCase.id} />
              <input type="hidden" name="questionId" value={question.id} />
              <Button type="submit" variant="ghost" size="sm" className="text-danger">
                Klinischen Fall entfernen
              </Button>
            </form>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Bilder</CardTitle>
        <CardDescription>
          Bilder werden erst nach Freigabe (Status „Veröffentlicht&quot;) für Lernende sichtbar.
        </CardDescription>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {question.images.map((img) => (
            <div key={img.id} className="rounded-md border border-border p-3">
              <div className="relative mb-2 aspect-video overflow-hidden rounded-[var(--radius-button)] bg-surface-elevated">
                <Image src={urlFor(img.filePath)} alt={img.caption ?? ""} fill className="object-contain" unoptimized />
              </div>
              <p className="text-xs text-muted">{img.caption || "Keine Beschreibung"}</p>
              <p className="text-xs text-muted">Quelle: {img.source || "—"}</p>
              <div className="mt-2">
                <StatusControl entityType="QuestionImage" id={img.id} status={img.status} />
              </div>
              <form action={deleteQuestionImageAction} className="mt-2">
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="questionId" value={question.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-danger">
                  Entfernen
                </Button>
              </form>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ImageUploadForm questionId={question.id} />
        </div>
      </Card>

      <Card className="border-danger/30">
        <CardTitle className="text-danger">Frage löschen</CardTitle>
        <CardDescription>
          Entfernt die Frage dauerhaft inklusive Antworten, Fall und Bilder.
        </CardDescription>
        <form action={deleteQuestionAction} className="mt-4">
          <input type="hidden" name="id" value={question.id} />
          <Button type="submit" variant="danger">
            Endgültig löschen
          </Button>
        </form>
      </Card>
    </div>
  );
}
