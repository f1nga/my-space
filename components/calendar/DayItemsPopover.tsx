"use client";

import { format } from "date-fns";
import { ca } from "date-fns/locale";
import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { cn, formatTimeCa } from "@/lib/utils";
import type { CalendarItem } from "@/lib/calendar";
import { toISODate } from "@/lib/calendar";
import type { EventColor } from "@/lib/types";
import { EVENT_COLOR_CLASSES } from "./eventColors";

interface DayItemsPopoverProps {
  open: boolean;
  onClose: () => void;
  day: Date;
  items: CalendarItem[];
  onEventClick: (item: CalendarItem) => void;
}

function colorClass(color: string | null): string {
  const colors = EVENT_COLOR_CLASSES as Record<EventColor, string>;
  if (color && color in colors) {
    return colors[color as EventColor];
  }
  return colors.emerald;
}

export function DayItemsPopover({
  open,
  onClose,
  day,
  items,
  onEventClick,
}: DayItemsPopoverProps) {
  const title = format(day, "EEEE d MMMM", { locale: ca }).replace(/^./, (c) =>
    c.toUpperCase(),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={`${items.length} element${items.length === 1 ? "" : "s"} aquest dia`}
      size="sm"
    >
      <ul className="max-h-64 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id}>
            {item.kind === "event" ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEventClick(item);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                )}
                aria-label={`Esdeveniment: ${item.title}`}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    colorClass(item.color),
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">
                  {!item.allDay ? `${formatTimeCa(item.startsAt)} ` : ""}
                  {item.title}
                </span>
              </button>
            ) : (
              <Link
                href="/board"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                aria-label={`Tasca: ${item.title}`}
              >
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-[var(--color-border)] pt-3">
        <Link
          href={`/calendar?view=day&date=${toISODate(day)}`}
          className="text-xs font-medium text-[var(--color-accent)] hover:underline"
        >
          Veure dia complet
        </Link>
      </div>
    </Dialog>
  );
}
