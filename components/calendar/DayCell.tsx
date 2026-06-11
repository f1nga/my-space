"use client";

import { useState } from "react";
import { cn, formatTimeCa } from "@/lib/utils";
import { calendarUtils, type CalendarItem } from "@/lib/calendar";
import { EVENT_COLOR_CLASSES, EventDialog } from "./EventDialog";
import type { EventColor } from "@/lib/types";

interface DayCellProps {
  day: Date;
  currentMonth: Date;
  items: CalendarItem[];
}

function colorClass(color: string | null): string {
  const colors = EVENT_COLOR_CLASSES as Record<EventColor, string>;
  if (color && color in colors) {
    return colors[color as EventColor];
  }
  return colors.emerald;
}

export function DayCell({ day, currentMonth, items }: DayCellProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarItem | null>(null);
  const isOutsideMonth = !calendarUtils.isSameMonth(day, currentMonth);
  const isToday = calendarUtils.isToday(day);
  const visible = items.slice(0, 3);
  const overflow = items.length - visible.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className={cn(
          "group flex h-full min-h-[110px] flex-col gap-1 rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-bg-elevated)]/40 p-2 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]",
          isOutsideMonth && "opacity-50",
        )}
        aria-label={`Crear esdeveniment el ${day.toLocaleDateString("ca-ES")}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
              isToday
                ? "bg-[var(--color-accent)] text-zinc-950"
                : "text-[var(--color-text-muted)]",
            )}
          >
            {day.getDate()}
          </span>
        </div>
        <div className="space-y-1">
          {visible.map((item) => (
            <span
              key={item.id}
              onClick={(event) => {
                event.stopPropagation();
                if (item.kind === "event") setEditing(item);
              }}
              role={item.kind === "event" ? "button" : undefined}
              className={cn(
                "block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white",
                item.kind === "task" && "bg-zinc-700 text-zinc-100",
                item.kind === "event" && colorClass(item.color),
              )}
              title={item.title}
            >
              {!item.allDay && item.kind === "event"
                ? `${formatTimeCa(item.startsAt)} ${item.title}`
                : item.title}
            </span>
          ))}
          {overflow > 0 ? (
            <span className="text-[10px] text-[var(--color-text-subtle)]">
              +{overflow} mes
            </span>
          ) : null}
        </div>
      </button>

      <EventDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultStart={day}
      />
      <EventDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        event={
          editing
            ? {
                id: editing.id,
                title: editing.title,
                startsAt: editing.startsAt,
                endsAt: editing.endsAt,
                allDay: editing.allDay,
                color: editing.color,
              }
            : null
        }
      />
    </>
  );
}
