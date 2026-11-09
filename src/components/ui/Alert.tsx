import { cn } from "@/lib/cn";

type Tone = "danger" | "success" | "warning" | "accent";

const toneClasses: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger border-danger/30",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  accent: "bg-accent-soft text-accent border-accent/30",
};

export function Alert({
  tone = "accent",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "animate-fade-in-up rounded-[var(--radius-button)] border px-4 py-3 text-sm leading-relaxed",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
