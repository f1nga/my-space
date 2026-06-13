"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n/client";
import { cn, formatTime } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  startsAt: Date;
  allDay: boolean;
  color: string | null;
}

const COLOR_DOTS: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  zinc: "bg-zinc-500",
};

export function UpcomingEvents({ events }: { events: EventItem[] }) {
  const { t, intlLocale } = useI18n();

  function relativeDay(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
    if (diff === 0) return t("relative.today");
    if (diff === 1) return t("relative.tomorrow");
    return new Date(date).toLocaleDateString(intlLocale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.upcomingEvents")}</CardTitle>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          {t("dashboard.calendarLink")}{" "}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </CardHeader>
      <CardBody>
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={t("dashboard.noUpcomingEvents")}
            description={t("dashboard.noUpcomingEventsDescription")}
          />
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface)]"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    COLOR_DOTS[event.color ?? "emerald"] ?? COLOR_DOTS.emerald,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-text)]">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {relativeDay(event.startsAt)}
                    {!event.allDay
                      ? ` · ${formatTime(event.startsAt, intlLocale)}`
                      : ` · ${t("relative.allDay")}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
