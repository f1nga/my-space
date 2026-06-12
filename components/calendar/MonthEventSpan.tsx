"use client";

import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/calendar";
import { getEventVisualRange } from "@/lib/calendar-layout";
import type { MonthEventSegment } from "@/lib/calendar-layout";
import type { EventColor } from "@/lib/types";
import { EVENT_COLOR_CLASSES } from "./eventColors";

interface MonthEventSpanProps {
  segment: MonthEventSegment;
  onEventClick: (item: CalendarItem) => void;
}

function colorClass(color: string | null): string {
  const colors = EVENT_COLOR_CLASSES as Record<EventColor, string>;
  if (color && color in colors) {
    return colors[color as EventColor];
  }
  return colors.emerald;
}

function formatSpanLabel(item: CalendarItem): string {
  const { start, end } = getEventVisualRange(item);
  const startLabel = format(start, "d MMM", { locale: ca });
  const endLabel = format(end, "d MMM", { locale: ca });
  if (startLabel === endLabel) {
    return `Esdeveniment: ${item.title}, ${startLabel}`;
  }
  return `Esdeveniment: ${item.title}, del ${startLabel} al ${endLabel}`;
}

export function MonthEventSpan({ segment, onEventClick }: MonthEventSpanProps) {
  const { item, startColumn, span, lane, continuesFromPreviousWeek, continuesToNextWeek } =
    segment;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(item);
      }}
      style={{
        gridColumn: `${startColumn} / span ${span}`,
        gridRow: lane + 1,
      }}
      className={cn(
        "pointer-events-auto z-10 mx-0.5 truncate px-1.5 py-0.5 text-left text-[11px] font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        colorClass(item.color),
        continuesFromPreviousWeek ? "rounded-l-none" : "rounded-l-md",
        continuesToNextWeek ? "rounded-r-none" : "rounded-r-md",
        !continuesFromPreviousWeek && !continuesToNextWeek && "rounded-md",
        continuesFromPreviousWeek &&
          "border-l-2 border-accent-foreground/30 pl-1",
        continuesToNextWeek && "border-r-2 border-accent-foreground/30 pr-1",
      )}
      aria-label={formatSpanLabel(item)}
      title={item.title}
    >
      {item.title}
    </button>
  );
}
