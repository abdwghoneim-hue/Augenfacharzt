import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge, type Tone } from "@/components/ui/Badge";

// Read-only review panel for questions imported from the exam-protocol review (Phase 2).
// It only displays data; nothing here writes to the database.

export const VERIFICATION_LABELS: Record<string, { label: string; tone: Tone }> = {
  SOURCE_VERIFIED: { label: "Quellen verifiziert", tone: "success" },
  PARTIALLY_VERIFIED: { label: "Teilweise verifiziert", tone: "warning" },
  TEXTBOOK_ONLY: { label: "Nur Lehrbuchwissen", tone: "warning" },
  MANUAL_REVIEW_REQUIRED: { label: "Manuelle Prüfung zwingend", tone: "danger" },
};

export function VerificationBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const entry = VERIFICATION_LABELS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

type Correction = {
  correction_id?: string;
  original_statement?: string | null;
  corrected_statement?: string | null;
  explanation?: string | null;
  verification_status?: string | null;
  needs_specialist_review?: boolean;
};

type ReviewData = {
  secondaryTags?: string[];
  evidence?: Record<string, string[]>;
  corrections?: Correction[];
};

export type ReviewPanelQuestion = {
  canonicalCode: string | null;
  subcategory: string | null;
  verificationStatus: string | null;
  reviewNotes: string | null;
  germanVsInternational: string | null;
  controversies: string | null;
  protocolCount: number;
  reviewData: unknown;
  locations: {
    occurrenceCount: number;
    location: { name: string; bundesland: string | null; bundeslandDerived: boolean; isUnknown: boolean };
  }[];
  occurrences: {
    code: string;
    originalText: string;
    correctedText: string | null;
    sourcePages: string | null;
    protocol: {
      code: string;
      year: number | null;
      isGermanOralExam: boolean;
      location: { name: string; isUnknown: boolean };
    };
  }[];
};

export type ReviewPanelAnswer = {
  shortAnswer: string | null;
  keyPoints: string[];
  followUps: string[];
  approvedAt: Date | null;
  citations: {
    id: string;
    type: string;
    title: string;
    dateLabel: string | null;
    url: string | null;
    verified: boolean | null;
    verificationNote: string | null;
  }[];
};

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="rounded-md border border-border px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium text-foreground">{title}</summary>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground">{children}</div>
    </details>
  );
}

export function ReviewPanel({ question, answer }: { question: ReviewPanelQuestion; answer: ReviewPanelAnswer | undefined }) {
  if (!question.canonicalCode) return null;

  const data = (question.reviewData ?? {}) as ReviewData;
  const corrections = data.corrections ?? [];
  const specialistCount = corrections.filter((c) => c.needs_specialist_review).length;
  const citations = answer?.citations ?? [];
  const unverified = citations.filter((c) => c.verified === false);
  const knownLocations = question.locations.filter((l) => !l.location.isUnknown);

  return (
    <Card className="border-accent/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Prüfdaten aus der Protokollauswertung</CardTitle>
          <CardDescription>
            Nur Anzeige. Hier wird nichts geändert und nichts veröffentlicht.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{question.canonicalCode}</Badge>
          <VerificationBadge status={question.verificationStatus} />
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Unterthema</dt>
          <dd>{question.subcategory ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">In Protokollen</dt>
          <dd>{question.protocolCount}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Quellen</dt>
          <dd>
            {citations.length} ({unverified.length} nicht verifiziert)
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Korrekturen</dt>
          <dd>
            {corrections.length}
            {specialistCount > 0 ? ` (${specialistCount} mit Fachprüfung)` : ""}
          </dd>
        </div>
      </dl>

      {answer && !answer.approvedAt && (
        <p className="mt-4 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
          Die Musterantwort ist noch nicht freigegeben. Speichern im Formular „Freigegebene Musterantwort“
          markiert sie automatisch als freigegeben.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {question.reviewNotes && (
          <Section title="Hinweise zur Prüfung / offene Punkte" defaultOpen>
            <p className="whitespace-pre-line">{question.reviewNotes}</p>
          </Section>
        )}

        <Section title={`Prüfungsorte (${knownLocations.length} dokumentiert)`}>
          <ul className="space-y-1">
            {question.locations.map((l) => (
              <li key={l.location.name}>
                {l.location.name}
                {l.location.bundesland
                  ? ` · ${l.location.bundesland}${l.location.bundeslandDerived ? " (abgeleitet)" : ""}`
                  : ""}
                {` · ${l.occurrenceCount}×`}
              </li>
            ))}
            {question.locations.length === 0 && <li className="text-muted">Keine Zuordnung.</li>}
          </ul>
        </Section>

        <Section title={`Vorkommen in Protokollen (${question.occurrences.length})`}>
          <ul className="space-y-3">
            {question.occurrences.map((o) => (
              <li key={o.code} className="rounded-md bg-surface-elevated/60 p-3">
                <p className="font-mono text-xs text-muted">
                  {o.code} · {o.protocol.code}
                  {o.protocol.year ? ` · ${o.protocol.year}` : ""} · {o.protocol.location.name}
                  {!o.protocol.isGermanOralExam ? " · keine deutsche mündliche Prüfung (FEBO)" : ""}
                  {o.sourcePages ? ` · Seiten ${o.sourcePages}` : ""}
                </p>
                <p className="mt-1">
                  <span className="text-muted">Original: </span>
                  {o.originalText}
                </p>
                {o.correctedText && o.correctedText !== o.originalText && (
                  <p className="mt-1">
                    <span className="text-muted">Korrigiert: </span>
                    {o.correctedText}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`Quellen (${citations.length})`}>
          <ul className="space-y-2">
            {citations.map((c) => (
              <li key={c.id} className="flex flex-wrap items-start gap-2">
                <Badge tone={c.verified === true ? "success" : c.verified === false ? "danger" : "neutral"}>
                  {c.verified === true ? "Verifiziert" : c.verified === false ? "Nicht verifiziert" : "Ungeprüft"}
                </Badge>
                <div className="min-w-0 flex-1">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {c.title}
                    </a>
                  ) : (
                    <span>{c.title}</span>
                  )}
                  {c.dateLabel ? <span className="text-muted"> · {c.dateLabel}</span> : null}
                  {c.verificationNote && <p className="text-xs text-muted">{c.verificationNote}</p>}
                </div>
              </li>
            ))}
            {citations.length === 0 && <li className="text-danger">Keine Quelle hinterlegt. Manuell prüfen.</li>}
          </ul>
        </Section>

        {corrections.length > 0 && (
          <Section title={`Korrekturen gegenüber den Protokollen (${corrections.length})`}>
            <ul className="space-y-3">
              {corrections.map((c, i) => (
                <li key={c.correction_id ?? i} className="rounded-md bg-surface-elevated/60 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.correction_id && <span className="font-mono text-xs text-muted">{c.correction_id}</span>}
                    {c.needs_specialist_review && <Badge tone="danger">Fachprüfung nötig</Badge>}
                    {c.verification_status && <Badge tone="neutral">{c.verification_status}</Badge>}
                  </div>
                  {c.original_statement && (
                    <p className="mt-1">
                      <span className="text-muted">Protokoll: </span>
                      {c.original_statement}
                    </p>
                  )}
                  {c.corrected_statement && (
                    <p className="mt-1">
                      <span className="text-muted">Korrektur: </span>
                      {c.corrected_statement}
                    </p>
                  )}
                  {c.explanation && <p className="mt-1 text-xs text-muted">{c.explanation}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {(answer?.shortAnswer || (answer?.keyPoints.length ?? 0) > 0 || (answer?.followUps.length ?? 0) > 0) && (
          <Section title="Kurzantwort, Kernpunkte, Nachfragen">
            {answer?.shortAnswer && <p>{answer.shortAnswer}</p>}
            {answer && answer.keyPoints.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Kernpunkte</p>
                <ul className="list-disc space-y-1 pl-5">
                  {answer.keyPoints.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>
            )}
            {answer && answer.followUps.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Mögliche Nachfragen der Prüfer</p>
                <ul className="list-disc space-y-1 pl-5">
                  {answer.followUps.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}

        {(question.germanVsInternational || question.controversies) && (
          <Section title="Deutsche vs. internationale Praxis, Kontroversen">
            {question.germanVsInternational && <p>{question.germanVsInternational}</p>}
            {question.controversies && (
              <p>
                <span className="text-muted">Kontroversen: </span>
                {question.controversies}
              </p>
            )}
          </Section>
        )}
      </div>
    </Card>
  );
}
