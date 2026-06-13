"use client";

import { cn, formatTime } from "@/lib/utils";
import type { CalendarItem } from "@/lib/calendar";
import { eventLayout } from "@/lib/calendar";
import type { EventColor } from "@/lib/types";
import { useI18n } from "@/lib/i18n/client";
import { EVENT_COLOR_CLASSES } from "./eventColors";

interface EventBlockProps {
  item: CalendarItem;
  day: Date;
  onClick: (item: CalendarItem) => void;
}

function colorClass(color: string | null): string {
  const colors = EVENT_COLOR_CLASSES as Record<EventColor, string>;
  if (color && color in colors) {
    return colors[color as EventColor];
  }
  return colors.emerald;
}

export function EventBlock({ item, day, onClick }: EventBlockProps) {
  const { t, intlLocale } = useI18n();
  const { topPx, heightPx } = eventLayout(item, day);
  const startTime = formatTime(item.startsAt, intlLocale);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      className={cn(
        "absolute left-0.5 right-0.5 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        colorClass(item.color),
      )}
      style={{ top: topPx, height: heightPx, minHeight: 24 }}
      aria-label={t("calendar.eventAria", { title: item.title, time: startTime })}
      title={item.title}
    >
      <span className="block truncate font-semibold">{item.title}</span>
      {heightPx >= 36 ? (
        <span className="block truncate opacity-90">
          {startTime}
          {item.endsAt
            ? ` – ${formatTime(item.endsAt, intlLocale)}`
            : ""}
        </span>
      ) : null}
    </button>
  );
}
