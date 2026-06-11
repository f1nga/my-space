"use client";

import Link from "next/link";
import { cn, formatTimeCa } from "@/lib/utils";
import type { CalendarItem } from "@/lib/calendar";
import type { EventColor } from "@/lib/types";
import { EVENT_COLOR_CLASSES } from "./eventColors";

interface CalendarItemChipProps {
  item: CalendarItem;
  onEventClick?: (item: CalendarItem) => void;
  compact?: boolean;
}

function colorClass(color: string | null): string {
  const colors = EVENT_COLOR_CLASSES as Record<EventColor, string>;
  if (color && color in colors) {
    return colors[color as EventColor];
  }
  return colors.emerald;
}

export function CalendarItemChip({
  item,
  onEventClick,
  compact = false,
}: CalendarItemChipProps) {
  const label =
    item.kind === "event"
      ? `Esdeveniment: ${item.title}`
      : `Tasca: ${item.title}`;

  const content = (
    <>
      {!item.allDay && item.kind === "event" && !compact
        ? `${formatTimeCa(item.startsAt)} `
        : ""}
      {item.title}
    </>
  );

  if (item.kind === "task") {
    return (
      <Link
        href="/board"
        className={cn(
          "block truncate rounded-md bg-[var(--color-surface)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text)] transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)]",
        )}
        aria-label={label}
        title={item.title}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(item);
      }}
      className={cn(
        "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-[var(--color-accent-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)]",
        colorClass(item.color),
      )}
      aria-label={label}
      title={item.title}
    >
      {content}
    </button>
  );
}
