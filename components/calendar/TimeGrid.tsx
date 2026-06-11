"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  HOUR_HEIGHT_PX,
  calendarUtils,
  type CalendarItem,
} from "@/lib/calendar";
import { EventBlock } from "./EventBlock";

const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) =>
  hour.toString().padStart(2, "0"),
);

const hourRows = (
  <div className="pointer-events-none absolute inset-0">
    {HOUR_LABELS.map((_, hour) => (
      <div
        key={hour}
        className="border-t border-[var(--color-border)]/40"
        style={{ height: HOUR_HEIGHT_PX }}
      />
    ))}
  </div>
);

interface TimeGridColumnProps {
  day: Date;
  items: CalendarItem[];
  onSlotClick: (date: Date) => void;
  onEventClick: (item: CalendarItem) => void;
  showNowIndicator?: boolean;
}

function NowIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const topPx =
    ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) *
    HOUR_HEIGHT_PX *
    24;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
      style={{ top: topPx }}
      aria-hidden
    >
      <div className="h-2 w-2 -translate-x-1 rounded-full bg-rose-500" />
      <div className="h-px flex-1 bg-rose-500/80" />
    </div>
  );
}

export function TimeGridColumn({
  day,
  items,
  onSlotClick,
  onEventClick,
  showNowIndicator = false,
}: TimeGridColumnProps) {
  const gridHeight = HOUR_HEIGHT_PX * 24;
  const isToday = calendarUtils.isToday(day);

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = (y / gridHeight) * 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor((totalMinutes % 60) / 30) * 30;
    const clicked = new Date(day);
    clicked.setHours(hours, minutes, 0, 0);
    onSlotClick(clicked);
  }

  return (
    <div
      className="relative cursor-pointer border-l border-[var(--color-border)]/40 first:border-l-0"
      style={{ height: gridHeight }}
      onClick={handleColumnClick}
      role="presentation"
    >
      {hourRows}
      {showNowIndicator && isToday ? <NowIndicator /> : null}
      {items.map((item) => (
        <EventBlock
          key={item.id}
          item={item}
          day={day}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
}

export function TimeGridHourLabels() {
  return (
    <div
      className="relative shrink-0"
      style={{ height: HOUR_HEIGHT_PX * 24 }}
      aria-hidden
    >
      {HOUR_LABELS.map((label, hour) => (
        <div
          key={hour}
          className="pr-2 text-right text-[10px] text-[var(--color-text-subtle)]"
          style={{ height: HOUR_HEIGHT_PX, lineHeight: `${HOUR_HEIGHT_PX}px` }}
        >
          {hour > 0 ? `${label}:00` : ""}
        </div>
      ))}
    </div>
  );
}

interface AllDayLaneProps {
  items: CalendarItem[];
  onEventClick: (item: CalendarItem) => void;
  columns?: number;
}

export function AllDayLane({
  items,
  onEventClick,
  columns = 1,
}: AllDayLaneProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-1 border-b border-[var(--color-border)]/60 py-2",
        columns === 7 ? "grid-cols-7" : "grid-cols-1",
      )}
    >
      {columns === 1 ? (
        <div className="flex flex-wrap gap-1 pl-14">
          {items.map((item) =>
            item.kind === "event" ? (
              <button
                key={item.id}
                type="button"
                onClick={() => onEventClick(item)}
                className="truncate rounded-md bg-[var(--color-accent)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent-foreground)] hover:opacity-90"
              >
                {item.title}
              </button>
            ) : (
              <span
                key={item.id}
                className="truncate rounded-md bg-[var(--color-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text)]"
              >
                {item.title}
              </span>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
