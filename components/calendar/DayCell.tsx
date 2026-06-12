"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { calendarUtils, toISODate, type CalendarItem } from "@/lib/calendar";
import { CalendarItemChip } from "./CalendarItemChip";
import { DayItemsPopover } from "./DayItemsPopover";

const MAX_VISIBLE = 3;

interface DayCellProps {
  day: Date;
  currentMonth: Date;
  items: CalendarItem[];
  onCreate: (day: Date) => void;
  onEventClick: (item: CalendarItem) => void;
}

export function DayCell({
  day,
  currentMonth,
  items,
  onCreate,
  onEventClick,
}: DayCellProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const isOutsideMonth = !calendarUtils.isSameMonth(day, currentMonth);
  const isToday = calendarUtils.isToday(day);
  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - visible.length;

  function handleCellClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    onCreate(day);
  }

  return (
    <>
      <div
        role="gridcell"
        onClick={handleCellClick}
        className={cn(
            "group relative flex h-full min-h-[110px] cursor-pointer flex-col gap-1 rounded-xl border border-border/60 bg-bg-elevated/40 p-2 transition-colors hover:border-border-strong hover:bg-bg-elevated",
          isOutsideMonth && "opacity-50",
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            href={`/calendar?view=day&date=${toISODate(day)}`}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isToday
                ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                : "text-text-muted",
            )}
            aria-label={`Veure dia ${day.toLocaleDateString("ca-ES")}`}
          >
            {day.getDate()}
          </Link>
          <button
            type="button"
            onClick={() => onCreate(day)}
            className="grid h-6 w-6 place-items-center rounded-md text-text-subtle opacity-0 transition-all hover:bg-surface hover:text-text focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover:opacity-100 group-focus-within:opacity-100"
            aria-label={`Crear esdeveniment el ${day.toLocaleDateString("ca-ES")}`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
        <div className="space-y-1">
          {visible.map((item) => (
            <CalendarItemChip
              key={item.id}
              item={item}
              onEventClick={onEventClick}
            />
          ))}
          {overflow > 0 ? (
            <button
              type="button"
              onClick={() => setOverflowOpen(true)}
              className="text-[10px] text-text-subtle transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
              aria-label={`${overflow} elements mes aquest dia`}
            >
              +{overflow} mes
            </button>
          ) : null}
        </div>
      </div>

      <DayItemsPopover
        open={overflowOpen}
        onClose={() => setOverflowOpen(false)}
        day={day}
        items={items}
        onEventClick={onEventClick}
      />
    </>
  );
}
