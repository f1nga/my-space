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
import { useI18n } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { EventFormDialog } from "./EventFormDialog";

interface CalendarHeaderProps {
  date: Date;
  view: CalendarView;
}

const VIEW_OPTIONS: { value: CalendarView; labelKey: TranslationKey }[] = [
  { value: "month", labelKey: "calendar.viewMonth" },
  { value: "week", labelKey: "calendar.viewWeek" },
  { value: "day", labelKey: "calendar.viewDay" },
];

function buildHref(date: Date, view: CalendarView): string {
  const params = new URLSearchParams();
  params.set("view", view);
  params.set("date", toISODate(date));
  return `/calendar?${params.toString()}`;
}

export function CalendarHeader({ date, view }: CalendarHeaderProps) {
  const { t, dateFnsLocale } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const title = formatRangeTitle(date, view, dateFnsLocale);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link
            href={buildHref(previousDate(date, view), view)}
            aria-label={t("calendar.previous")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={buildHref(new Date(), view)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            {t("calendar.today")}
          </Link>
          <Link
            href={buildHref(nextDate(date, view), view)}
            aria-label={t("calendar.next")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <h2 className="text-base font-semibold tracking-tight text-text sm:text-lg">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-lg border border-border bg-surface p-0.5"
            role="group"
            aria-label={t("calendar.viewLabel")}
          >
            {VIEW_OPTIONS.map(({ value, labelKey }) => {
              const isActive = view === value;
              return (
                <Link
                  key={value}
                  href={buildHref(date, value)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-bg-elevated text-text shadow-sm"
                      : "text-text-muted hover:text-text",
                  )}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> {t("common.new")}
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
