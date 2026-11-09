import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "forest" | "amber";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 active:opacity-100 disabled:opacity-50 shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-transparent font-medium",
  secondary:
    "bg-surface-elevated text-foreground border border-border hover:opacity-90 active:opacity-100 disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-elevated/70 active:bg-surface-elevated disabled:text-muted",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-100 disabled:opacity-50 border border-transparent font-medium",
  forest:
    "bg-forest text-white hover:opacity-90 active:opacity-100 disabled:opacity-50 border border-transparent font-medium",
  amber:
    "bg-secondary text-white hover:opacity-90 active:opacity-100 disabled:opacity-50 border border-transparent font-medium",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-button)] tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,opacity] duration-150 cursor-pointer select-none disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
