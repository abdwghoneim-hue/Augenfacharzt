"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function NavLink({
  href,
  children,
  tone = "default",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "default" | "admin";
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "relative py-1 text-xs font-normal tracking-[-0.01em] transition-colors duration-150",
        isActive
          ? "text-foreground font-medium"
          : tone === "admin"
            ? "text-muted hover:text-foreground"
            : "text-muted hover:text-foreground",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-[1.5px] bg-accent transition-all duration-200 ease-out",
          isActive ? "w-full opacity-100" : "w-0 opacity-0",
        )}
      />
    </Link>
  );
}
