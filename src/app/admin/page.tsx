import Link from "next/link";
import { Users, FileQuestion, ImageIcon, FileUp, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminDashboardPage() {
  const [
    pendingUsers,
    questionsInReview,
    imagesInReview,
    recentBatches,
    publishedCount,
    draftCount,
  ] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.question.count({ where: { status: { not: "PUBLISHED" } } }),
    prisma.questionImage.count({ where: { status: { not: "PUBLISHED" } } }),
    prisma.importBatch.findMany({ orderBy: { uploadedAt: "desc" }, take: 5 }),
    prisma.question.count({ where: { status: "PUBLISHED" } }),
    prisma.question.count({ where: { status: "DRAFT" } }),
  ]);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Administration / Übersicht
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Administrator-Übersicht</h1>
        <p className="mt-1 text-sm text-muted-secondary">Status der Inhaltsverwaltung und Registrierungen auf einen Blick.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/benutzer">
          <Card className="h-full cursor-pointer hover:border-foreground/20 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Registrierungen</span>
              <div className="rounded-[3px] bg-warning-soft p-1.5 text-warning">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-normal tracking-tight text-foreground">{pendingUsers}</p>
            <p className="mt-1 text-xs text-muted">Ausstehende Freischaltungen</p>
          </Card>
        </Link>
        <Link href="/admin/freigabe">
          <Card className="h-full cursor-pointer hover:border-foreground/20 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Fragenprüfung</span>
              <div className="rounded-[3px] bg-accent-soft p-1.5 text-accent">
                <FileQuestion className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-normal tracking-tight text-foreground">{questionsInReview}</p>
            <p className="mt-1 text-xs text-muted">Fragen zur Prüfung</p>
          </Card>
        </Link>
        <Link href="/admin/freigabe">
          <Card className="h-full cursor-pointer hover:border-foreground/20 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Bilderfreigabe</span>
              <div className="rounded-[3px] bg-secondary-soft p-1.5 text-secondary">
                <ImageIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-normal tracking-tight text-foreground">{imagesInReview}</p>
            <p className="mt-1 text-xs text-muted">Bilder zur Freigabe</p>
          </Card>
        </Link>
        <Link href="/admin/fragen">
          <Card className="h-full cursor-pointer hover:border-foreground/20 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Katalog</span>
              <div className="rounded-[3px] bg-success-soft p-1.5 text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-normal tracking-tight text-foreground">
              {publishedCount} <span className="text-base text-muted">/ {draftCount}</span>
            </p>
            <p className="mt-1 text-xs text-muted">Veröffentlicht / Entwurf</p>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Zuletzt importierte Dokumente</CardTitle>
            <CardDescription>Die letzten 5 Dateiimporte im System.</CardDescription>
          </div>
          <div className="rounded-[3px] bg-surface-elevated p-2 text-foreground">
            <FileUp className="h-4 w-4" />
          </div>
        </div>
        {recentBatches.length > 0 ? (
          <ul className="mt-4 divide-y divide-border/60">
            {recentBatches.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <Link href={`/admin/import/${b.id}`} className="text-sm font-normal text-foreground hover:text-accent">
                  {b.fileName}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge tone={b.status === "REVIEWED" ? "success" : b.status === "FAILED" ? "danger" : "warning"}>
                    {b.status}
                  </Badge>
                  <span className="font-mono text-xs text-muted">
                    {new Date(b.uploadedAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Noch keine Dokumente importiert.</p>
        )}
      </Card>
    </div>
  );
}
