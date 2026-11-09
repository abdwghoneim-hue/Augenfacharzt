import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { findDuplicateQuestionIds } from "@/lib/duplicates";
import { Card } from "@/components/ui/Card";
import { ContentStatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

const STATUS_OPTIONS = ["ALLE", "DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED"] as const;

export default async function QuestionsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status && params.status !== "ALLE" ? params.status : undefined;
  const specialtyFilter = params.specialty || undefined;

  const [questions, specialties] = await Promise.all([
    prisma.question.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter as never } : {}),
        ...(specialtyFilter ? { specialties: { some: { specialtyId: specialtyFilter } } } : {}),
      },
      include: {
        specialties: { include: { specialty: true } },
        _count: { select: { images: true } },
        clinicalCase: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" } }),
  ]);

  const duplicateIds = findDuplicateQuestionIds(
    questions.map((q) => ({ id: q.id, originalText: q.originalText })),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
            Katalogverwaltung
          </div>
          <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Fragenverwaltung</h1>
          <p className="mt-1 text-sm text-muted-secondary">{questions.length} Fragen im Gesamtbestand</p>
        </div>
        <Link href="/admin/fragen/neu">
          <Button type="button" variant="primary">+ Neue Frage erfassen</Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-end gap-4" method="get">
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">Status</label>
            <Select name="status" defaultValue={params.status ?? "ALLE"} className="w-48">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALLE"
                    ? "Alle"
                    : s === "DRAFT"
                      ? "Entwurf"
                      : s === "IN_REVIEW"
                        ? "Zur Prüfung"
                        : s === "APPROVED"
                          ? "Freigegeben"
                          : "Veröffentlicht"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">Fachgebiet</label>
            <Select name="specialty" defaultValue={params.specialty ?? ""} className="w-64">
              <option value="">Alle</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Button type="submit" variant="secondary">
              Filtern
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated/60 text-left font-mono text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Frage</th>
              <th className="px-4 py-3">Fachgebiete</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quelle</th>
              <th className="px-4 py-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {questions.map((q) => (
              <tr key={q.id} className="align-top hover:bg-surface-elevated/30 transition-colors">
                <td className="max-w-md px-4 py-3.5">
                  <Link href={`/admin/fragen/${q.id}`} className="font-normal text-foreground hover:text-accent leading-relaxed">
                    {q.originalText.slice(0, 140)}
                    {q.originalText.length > 140 ? "…" : ""}
                  </Link>
                  {duplicateIds.has(q.id) && (
                    <div className="mt-1">
                      <Badge tone="warning">Mögliches Duplikat</Badge>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-xs text-muted font-mono">
                  {q.specialties.map((s) => s.specialty.name).join(", ") || "—"}
                </td>
                <td className="px-4 py-3.5">
                  <ContentStatusBadge status={q.status} />
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted">
                  {q.sourceType === "IMPORT" ? "Import" : "Manuell"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/admin/fragen/${q.id}`} className="font-mono text-xs text-accent hover:underline">
                    Bearbeiten →
                  </Link>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  Keine Fragen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
