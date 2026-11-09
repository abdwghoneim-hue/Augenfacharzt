"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Eye,
  RotateCcw,
  TrendingUp,
  Shield,
  ListChecks,
  UploadCloud,
  BadgeCheck,
  Users,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { UserModel as User } from "@/generated/prisma/models";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { CreatorModal } from "@/components/CreatorModal";
import { cn } from "@/lib/cn";

interface AppShellProps {
  user: User;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const USER_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/lernen", label: "Lernmodus", icon: BookOpen },
  { href: "/pruefung", label: "Prüfungssimulation", icon: GraduationCap },
  { href: "/bildfragen", label: "Bildfragen", icon: Eye },
  { href: "/wiederholungen", label: "Meine Wiederholungen", icon: RotateCcw },
  { href: "/fortschritt", label: "Lernfortschritt", icon: TrendingUp },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Admin-Übersicht", icon: Shield },
  { href: "/admin/fragen", label: "Fragenverwaltung", icon: ListChecks },
  { href: "/admin/import", label: "Dokumente hochladen", icon: UploadCloud },
  { href: "/admin/freigabe", label: "Inhaltsfreigabe", icon: BadgeCheck },
  { href: "/admin/benutzer", label: "Benutzerverwaltung", icon: Users },
  { href: "/admin/fachgebiete", label: "Fachgebiete", icon: Layers },
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);

  // Read saved collapsed state from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("af_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore in private browsing
    }
  }, []);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("af_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Find active label for breadcrumbs
  const allItems = [...USER_NAV_ITEMS, ...(user.role === "ADMIN" ? ADMIN_NAV_ITEMS : [])];
  const activeItem = allItems.find((item) => isLinkActive(item.href)) || {
    label: pathname === "/konto" ? "Mein Konto" : "Dashboard",
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-selection selection:text-foreground">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR (Responsive, Collapsible, Themed)
          ========================================================================= */}
      <aside
        aria-label="Hauptnavigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out select-none",
          // Width based on collapsed state on desktop
          collapsed ? "lg:w-16" : "lg:w-64",
          // Drawer behavior on mobile screens
          mobileOpen
            ? "translate-x-0 w-72 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Header: Logo & Collapse Button */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-3.5 transition-all",
            collapsed ? "lg:justify-center" : "justify-between",
          )}
        >
          <Link
            href="/"
            className={cn(
              "group flex items-center gap-3 overflow-hidden rounded-[var(--radius-button)] py-1.5 transition-opacity hover:opacity-100",
              collapsed ? "lg:justify-center" : "",
            )}
            title="AugenFacharzt – Mündliche Prüfung"
          >
            <div className="shrink-0 flex items-center justify-center">
              <Image
                src="/branding/daog-eye-mark.png"
                alt="Deutsch-Arabische Ophthalmologische Gesellschaft"
                width={32}
                height={18}
                priority
                className="opacity-95 transition-transform group-hover:scale-105"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="block truncate text-sm font-medium tracking-tight text-foreground">
                  AugenFacharzt
                </span>
                <span className="block truncate text-[10px] font-mono uppercase tracking-wider text-muted">
                  Mündliche Prüfung
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Seitenleiste ausklappen (Strg+B)" : "Seitenleiste einklappen (Strg+B)"}
            aria-label={collapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
            className={cn(
              "hidden h-8 w-8 items-center justify-center rounded-[var(--radius-button)] text-muted transition-colors hover:bg-surface-elevated hover:text-foreground cursor-pointer lg:flex shrink-0",
              collapsed ? "hidden" : "flex",
            )}
          >
            <PanelLeftClose className="size-4" />
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Menü schließen"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] text-muted transition-colors hover:bg-surface-elevated hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
          {/* Section: LERNEN */}
          <div className="mb-6">
            {!collapsed && (
              <p className="px-2.5 mb-2 text-[10px] font-mono font-medium uppercase tracking-wider text-muted">
                Lernbereich
              </p>
            )}
            <nav className="flex flex-col gap-1">
              {USER_NAV_ITEMS.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-[var(--radius-button)] py-2 text-xs transition-all duration-150 cursor-pointer",
                      collapsed ? "justify-center px-0 h-10" : "px-2.5",
                      active
                        ? "bg-surface-elevated font-medium text-foreground shadow-xs"
                        : "text-muted hover:bg-surface-elevated/60 hover:text-foreground",
                    )}
                  >
                    {/* Active Accent Indicator Bar */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-accent transition-all" />
                    )}
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform group-hover:scale-105",
                        active ? "text-accent" : "text-muted group-hover:text-foreground",
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section: VERWALTUNG (Admins only) */}
          {user.role === "ADMIN" && (
            <div className="mb-6 pt-3 border-t border-border/50">
              {!collapsed && (
                <div className="flex items-center justify-between px-2.5 mb-2">
                  <p className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted">
                    Verwaltung
                  </p>
                  <span className="text-[9px] font-mono uppercase bg-accent-soft text-accent px-1.5 py-0.5 rounded-[var(--radius-badge)]">
                    Admin
                  </span>
                </div>
              )}
              <nav className="flex flex-col gap-1">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-[var(--radius-button)] py-2 text-xs transition-all duration-150 cursor-pointer",
                        collapsed ? "justify-center px-0 h-10" : "px-2.5",
                        active
                          ? "bg-surface-elevated font-medium text-foreground shadow-xs"
                          : "text-muted hover:bg-surface-elevated/60 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-accent transition-all" />
                      )}
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover:scale-105",
                          active ? "text-accent" : "text-muted group-hover:text-foreground",
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Medical Direction & User Profile */}
        <div className="shrink-0 border-t border-border p-2.5 space-y-2">
          {/* Creator Attribution Card (High Contrast & Clear) */}
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCreatorModalOpen(true)}
              title="Medizinisches Konzept & Design: Dr. Abdelhamid Ghunaim"
              aria-label="Dr. Abdelhamid Ghunaim"
              className="group mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-surface-elevated/70 p-1 transition-all hover:scale-105 hover:border-accent hover:bg-surface-elevated hover:shadow-sm cursor-pointer"
            >
              <div className="relative size-10 overflow-hidden rounded-lg border border-accent/40 bg-[#07131e] shadow-xs transition-transform group-hover:scale-105">
                <Image
                  src="/branding/dr-ghunaim-emblem-sharp.png"
                  alt="Dr. Abdelhamid Ghunaim"
                  fill
                  sizes="40px"
                  priority
                  className="object-cover"
                />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCreatorModalOpen(true)}
              className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-elevated/70 p-2.5 text-left transition-all hover:border-accent hover:bg-surface-elevated hover:shadow-sm cursor-pointer"
            >
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-accent/40 bg-[#07131e] shadow-xs transition-transform group-hover:scale-105">
                <Image
                  src="/branding/dr-ghunaim-emblem-sharp.png"
                  alt="Dr. Abdelhamid Ghunaim"
                  fill
                  sizes="44px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-accent">
                    Dr. Abdelhamid Ghunaim
                  </span>
                  <Sparkles className="size-3 text-accent shrink-0" />
                </div>
                <p className="truncate text-[10px] text-muted font-medium">
                  Medizinisches Konzept & Design
                </p>
              </div>
            </button>
          )}

          {/* User Account / Profile Card */}
          <div
            className={cn(
              "flex items-center rounded-[var(--radius-button)] bg-surface-elevated/50 p-2 transition-colors",
              collapsed ? "justify-center px-0" : "justify-between gap-2",
            )}
          >
            <Link
              href="/konto"
              title={user.email ? `${user.username} (${user.email})` : user.username}
              className={cn(
                "flex items-center gap-2.5 min-w-0 transition-colors hover:text-accent cursor-pointer",
                collapsed ? "justify-center" : "",
              )}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-medium text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground leading-tight">
                    {user.username}
                  </p>
                  <p className="truncate text-[10px] text-muted">
                    {user.role === "ADMIN" ? "Administrator" : "Kandidat"}
                  </p>
                </div>
              )}
            </Link>

            {!collapsed && (
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Abmelden"
                  aria-label="Abmelden"
                  className="flex size-7 items-center justify-center rounded-[var(--radius-button)] text-muted transition-colors hover:bg-surface-elevated hover:text-danger cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION LAYOUT (Top Bar + Main Content Area + Footer)
          ========================================================================= */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0",
          collapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        {/* Sticky Top Bar Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Navigation öffnen"
              className="flex size-8 items-center justify-center rounded-[var(--radius-button)] border border-border text-muted transition-colors hover:bg-surface-elevated hover:text-foreground lg:hidden"
            >
              <Menu className="size-4" />
            </button>

            {/* Desktop Quick Toggle Button (only shown when sidebar is collapsed to avoid duplicate buttons) */}
            {collapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                title="Seitenleiste ausklappen (Strg+B)"
                aria-label="Seitenleiste ausklappen"
                className="hidden size-8 items-center justify-center rounded-[var(--radius-button)] border border-border text-muted transition-colors hover:bg-surface-elevated hover:text-foreground cursor-pointer lg:flex"
              >
                <PanelLeftOpen className="size-4 text-accent" />
              </button>
            )}

            {/* Breadcrumb Path */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
              <span className="font-medium text-foreground">AugenFacharzt</span>
              <ChevronRight className="size-3.5 text-border shrink-0" />
              <span className="truncate text-foreground/80 font-normal">{activeItem.label}</span>
            </nav>
          </div>

          {/* Top Bar Right: Theme Toggle & Quick Account Link */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/konto"
              className="flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-surface-elevated/40 px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <UserIcon className="size-3.5" />
              <span className="hidden sm:inline">{user.username}</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="animate-fade-in flex-1 px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>

      {/* Creator Profile Modal */}
      <CreatorModal open={creatorModalOpen} onClose={() => setCreatorModalOpen(false)} />
    </div>
  );
}
