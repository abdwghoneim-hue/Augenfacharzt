import { cn } from "@/lib/cn";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-elevated text-foreground border border-border/60",
  accent: "bg-accent-soft text-accent border border-accent/20",
  success: "bg-success-soft text-success border border-success/20",
  warning: "bg-warning-soft text-warning border border-warning/20",
  danger: "bg-danger-soft text-danger border border-danger/20",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-normal tracking-[-0.01em] transition-colors duration-150",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

const CONTENT_STATUS_LABELS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Entwurf", tone: "neutral" },
  IN_REVIEW: { label: "Zur Prüfung", tone: "warning" },
  APPROVED: { label: "Freigegeben", tone: "accent" },
  PUBLISHED: { label: "Veröffentlicht", tone: "success" },
};

export function ContentStatusBadge({ status }: { status: string }) {
  const entry = CONTENT_STATUS_LABELS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

const USER_STATUS_LABELS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Ausstehend", tone: "warning" },
  APPROVED: { label: "Genehmigt", tone: "success" },
  REJECTED: { label: "Abgelehnt", tone: "danger" },
  SUSPENDED: { label: "Gesperrt", tone: "danger" },
};

export function UserStatusBadge({ status }: { status: string }) {
  const entry = USER_STATUS_LABELS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
