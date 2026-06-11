"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  formatRangeTitle,
  nextDate,
  previousDate,
  toISODate,
  type CalendarView,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { EventFormDialog } from "./EventFormDialog";

interface CalendarHeaderProps {
  date: Date;
  view: CalendarView;
}

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Mes" },
  { value: "week", label: "Setmana" },
  { value: "day", label: "Dia" },
];

function buildHref(date: Date, view: CalendarView): string {
  const params = new URLSearchParams();
  params.set("view", view);
  params.set("date", toISODate(date));
  return `/calendar?${params.toString()}`;
}

export function CalendarHeader({ date, view }: CalendarHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const title = formatRangeTitle(date, view);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link
            href={buildHref(previousDate(date, view), view)}
            aria-label="Anterior"
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={buildHref(new Date(), view)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            Avui
          </Link>
          <Link
            href={buildHref(nextDate(date, view), view)}
            aria-label="Seguent"
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <h2 className="text-base font-semibold tracking-tight text-[var(--color-text)] sm:text-lg">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5"
            role="group"
            aria-label="Vista del calendari"
          >
            {VIEW_OPTIONS.map(({ value, label }) => {
              const isActive = view === value;
              return (
                <Link
                  key={value}
                  href={buildHref(date, value)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Nou
          </Button>
        </div>
      </div>

      <EventFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultStart={date}
      />
    </>
  );
}
