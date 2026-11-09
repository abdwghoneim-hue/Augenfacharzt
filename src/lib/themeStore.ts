"use client";

import { useSyncExternalStore } from "react";

export type VisualIdentity = "cursor" | "auros" | "discord";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("af_theme_change", callback);
  return () => window.removeEventListener("af_theme_change", callback);
}

function getSnapshot(): VisualIdentity {
  if (typeof document === "undefined") return "cursor";
  return (
    (document.documentElement.getAttribute("data-theme") as VisualIdentity) ||
    (document.cookie.match(/(?:^|;\s*)af_theme=([^;]*)/)?.[1] as VisualIdentity) ||
    "cursor"
  );
}

function getServerSnapshot(): VisualIdentity {
  return "cursor";
}

export function useTheme(): [VisualIdentity, (theme: VisualIdentity) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = (nextTheme: VisualIdentity) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.cookie = `af_theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("af_theme", nextTheme);
    } catch {
      // ignore in private browsing
    }
    window.dispatchEvent(new CustomEvent("af_theme_change", { detail: nextTheme }));
  };

  return [theme, setTheme];
}
