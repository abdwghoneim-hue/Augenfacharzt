import Link from "next/link";
import { BookOpen, ClipboardList, TrendingUp, RotateCcw, Image as ImageIcon, RefreshCw, ArrowRight } from "lucide-react";
import { requireApprovedUser } from "@/lib/guards";
import { getHomeStats, getSpecialtyOverview, getRecentActivity } from "@/lib/stats";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CONFIDENCE_LABELS: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  SICHER: { label: "Sicher", tone: "success" },
  TEILWEISE: { label: "Teilweise sicher", tone: "warning" },
  NICHT_GEWUSST: { label: "Nicht gewusst", tone: "danger" },
};

export default async function HomePage() {
  const user = await requireApprovedUser();
  const stats = await getHomeStats(user.id);
  const specialties = await getSpecialtyOverview(user.id);
  const recent = await getRecentActivity(user.id);
  const overallPercent =
    stats.totalPublished > 0 ? Math.round((stats.reviewed / stats.totalPublished) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Editorial Welcome Header */}
      <div className="animate-fade-in-up rounded-[4px] border border-border bg-surface p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-medium">Facharztprüfung</span>
              <span className="text-border">/</span>
              <span className="font-mono text-xs text-muted">Vorbereitungsplattform</span>
            </div>
            <h1 className="text-2xl font-normal tracking-[-0.025em] text-foreground sm:text-3xl">
              Willkommen, {user.username}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-secondary">
              Mündliche Facharztprüfung Augenheilkunde — {stats.reviewed} von {stats.totalPublished}{" "}
              Fragen bearbeitet ({overallPercent}% Lernfortschritt).
            </p>
          </div>
          <Link href="/lernen">
            <Button type="button" variant="primary" size="lg" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Lernen fortsetzen
              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList className="h-4 w-4 text-muted" />}
          label="Gesamtfragen"
          value={stats.totalPublished}
          subtext="Im Fragenkatalog"
          delay={0}
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4 text-muted" />}
          label="Bearbeitete Fragen"
          value={stats.reviewed}
          subtext={`${stats.totalPublished - stats.reviewed} noch offen`}
          delay={60}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-forest" />}
          label="Lernfortschritt"
          value={`${overallPercent}%`}
          subtext="Gesamtabdeckung"
          delay={120}
        />
        <StatCard
          icon={<RotateCcw className="h-4 w-4 text-accent" />}
          label="Zur Wiederholung"
          value={stats.dueCount}
          subtext="Fällige Wiederholungen"
          delay={180}
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-xs uppercase tracking-widest font-medium text-muted">
          Schnellzugriff
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/lernen" icon={<BookOpen className="h-4 w-4" />} label="Lernmodus starten" />
          <QuickAction href="/pruefung" icon={<ClipboardList className="h-4 w-4" />} label="Prüfung simulieren" />
          <QuickAction href="/bildfragen" icon={<ImageIcon className="h-4 w-4" />} label="Bildfragen üben" />
          <QuickAction href="/wiederholungen" icon={<RefreshCw className="h-4 w-4" />} label="Fehler wiederholen" />
        </div>
      </div>

      {/* Specialty overview */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest font-medium text-muted">
            Fachgebiete ({specialties.filter((s) => s.total > 0).length})
          </h2>
          <Link href="/lernen" className="text-xs text-accent hover:underline">
            Alle anzeigen →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties
            .filter((s) => s.total > 0)
            .map((s, i) => {
              const Icon = getSpecialtyIcon(s.slug);
              return (
                <Link key={s.id} href={`/lernen/sitzung?specialty=${s.id}`}>
                  <Card
                    className="animate-fade-in-up h-full cursor-pointer hover:border-foreground/20 hover:shadow-sm"
                    style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-[3px] bg-surface-elevated p-2 text-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs text-muted">{s.percent}%</span>
                    </div>
                    <p className="mt-3 text-sm font-medium tracking-tight text-foreground">{s.name}</p>
                    <p className="text-xs text-muted">{s.total} Fragen</p>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-[2px] bg-surface-elevated">
                      <div
                        className="h-full rounded-[2px] bg-foreground transition-all duration-500"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>

      {stats.weakTopics.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardTitle>Schwachstellen</CardTitle>
          <CardDescription>
            Fachgebiete mit den meisten als „nicht gewusst&quot; markierten Fragen.
          </CardDescription>
          <ul className="mt-4 divide-y divide-border/60">
            {stats.weakTopics.map((topic) => (
              <li key={topic.name} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{topic.name}</span>
                <Badge tone="danger">{topic.count} Fragen</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recent activity */}
      <Card className="animate-fade-in-up">
        <CardTitle>Zuletzt bearbeitet</CardTitle>
        <CardDescription>Setzen Sie dort fort, wo Sie aufgehört haben.</CardDescription>
        {recent.length > 0 ? (
          <ul className="mt-4 divide-y divide-border/60">
            {recent.map((item) => {
              const confidence = item.confidence ? CONFIDENCE_LABELS[item.confidence] : null;
              return (
                <li key={item.questionId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-normal text-foreground">{item.questionText}</p>
                    <p className="text-xs text-muted font-mono">{item.specialtyNames.join(", ") || "—"}</p>
                  </div>
                  {confidence && <Badge tone={confidence.tone}>{confidence.label}</Badge>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Noch keine Aktivität — starten Sie mit dem Lernmodus, um loszulegen.
          </p>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
  delay: number;
}) {
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-muted">{label}</span>
        <div className="rounded-[3px] bg-surface-elevated p-1.5">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-normal tracking-tight text-foreground">{value}</p>
      {subtext && <p className="mt-1 text-xs text-muted">{subtext}</p>}
    </Card>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <Card className="flex h-full cursor-pointer items-center gap-3 p-4 hover:border-foreground/20 hover:shadow-sm">
        <div className="rounded-[3px] bg-surface-elevated p-2 text-foreground">{icon}</div>
        <span className="text-sm font-normal tracking-tight text-foreground">{label}</span>
      </Card>
    </Link>
  );
}
