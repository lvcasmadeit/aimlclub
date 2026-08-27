"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  // null until mounted, since the real theme is set by the pre-paint script
  // on the client and is unknown during server render.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Read the theme the inline script already applied to <html>.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(
      document.documentElement.classList.contains("light") ? "light" : "dark",
    );
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : "Toggle color theme"
      }
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent/60 hover:text-foreground",
        className,
      )}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
