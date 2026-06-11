"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/board", label: "Tauler", icon: KanbanSquare },
  { href: "/calendar", label: "Calendari", icon: CalendarDays },
  { href: "/notes", label: "Notes", icon: StickyNote },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegacio principal"
      className="fixed inset-y-0 left-0 z-30 flex w-16 md:w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)]"
    >
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-3 md:px-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="hidden text-base font-semibold tracking-tight md:inline">
          My Space
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-2 md:p-3">
        {NAV.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "md:justify-start justify-center",
                isActive
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-[var(--color-accent)]" : "text-current",
                )}
                aria-hidden
              />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-[var(--color-border)] p-4 text-xs text-[var(--color-text-subtle)] md:block">
        <p className="font-medium text-[var(--color-text-muted)]">My Space</p>
        <p>Productivitat personal</p>
      </div>
    </aside>
  );
}
