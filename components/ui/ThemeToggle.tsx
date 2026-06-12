"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Canviar tema"
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-muted",
          className,
        )}
        disabled
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Canviar a mode clar" : "Canviar a mode fosc"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
