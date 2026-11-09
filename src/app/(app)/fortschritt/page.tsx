import { requireApprovedUser } from "@/lib/guards";
import { getProgressBySpecialty, getExamHistory } from "@/lib/fortschritt";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

function Bar({ sicher, teilweise, nicht, total }: { sicher: number; teilweise: number; nicht: number; total: number }) {
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-[2px] bg-surface-elevated">
      <div className="bg-forest" style={{ width: `${pct(sicher)}%` }} />
      <div className="bg-secondary" style={{ width: `${pct(teilweise)}%` }} />
      <div className="bg-danger" style={{ width: `${pct(nicht)}%` }} />
    </div>
  );
}

export default async function FortschrittPage() {
  const user = await requireApprovedUser();
  const [bySpecialty, examHistory] = await Promise.all([
    getProgressBySpecialty(user.id),
    getExamHistory(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Analytik
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Lernfortschritt</h1>
        <p className="mt-1 text-sm text-muted-secondary">Fortschritt nach Fachgebiet und Historie der Prüfungssimulationen.</p>
      </div>

      <Card>
        <CardTitle>Fortschritt nach Fachgebiet</CardTitle>
        <CardDescription>Aufteilung nach Ihrem persönlichen Wissensstand.</CardDescription>
        <div className="mt-6 space-y-5">
          {bySpecialty.map((row) => (
            <div key={row.specialty}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-normal text-foreground">{row.specialty}</span>
                <span className="font-mono text-xs text-muted">
                  {row.reviewed} / {row.totalPublished}
                </span>
              </div>
              <Bar sicher={row.sicher} teilweise={row.teilweise} nicht={row.nichtGewusst} total={row.totalPublished} />
            </div>
          ))}
          {bySpecialty.length === 0 && (
            <p className="text-sm text-muted">Noch keine veröffentlichten Fragen vorhanden.</p>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-muted pt-4 border-t border-border/50">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-forest" /> Sicher
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-secondary" /> Teilweise sicher
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-danger" /> Nicht gewusst
          </span>
        </div>
      </Card>

      <Card>
        <CardTitle>Letzte Prüfungssimulationen</CardTitle>
        <CardDescription>Protokoll der abgeschlossenen Prüfungsläufe.</CardDescription>
        <ul className="mt-4 divide-y divide-border/60">
          {examHistory.map((session) => (
            <li key={session.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-normal text-foreground">
                {session.mode === "SPECIALTY" ? "Fachgebiet" : session.mode === "IMAGE" ? "Bildfragen" : "Gemischt"}
              </span>
              <span className="font-mono text-xs text-muted">{session._count.answers} Fragen</span>
              <span className="font-mono text-xs text-muted">
                {session.completedAt ? new Date(session.completedAt).toLocaleDateString("de-DE") : ""}
              </span>
            </li>
          ))}
          {examHistory.length === 0 && (
            <li className="py-6 text-center text-sm text-muted">
              Noch keine abgeschlossene Prüfungssimulation.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
