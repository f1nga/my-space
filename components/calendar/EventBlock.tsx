"use client";

import { cn, formatTimeCa } from "@/lib/utils";
import type { CalendarItem } from "@/lib/calendar";
import { eventLayout } from "@/lib/calendar";
import type { EventColor } from "@/lib/types";
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
  const { topPx, heightPx } = eventLayout(item, day);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      className={cn(
        "absolute left-0.5 right-0.5 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)]",
        colorClass(item.color),
      )}
      style={{ top: topPx, height: heightPx, minHeight: 24 }}
      aria-label={`Esdeveniment: ${item.title}, ${formatTimeCa(item.startsAt)}`}
      title={item.title}
    >
      <span className="block truncate font-semibold">{item.title}</span>
      {heightPx >= 36 ? (
        <span className="block truncate opacity-90">
          {formatTimeCa(item.startsAt)}
          {item.endsAt ? ` – ${formatTimeCa(item.endsAt)}` : ""}
        </span>
      ) : null}
    </button>
  );
}
