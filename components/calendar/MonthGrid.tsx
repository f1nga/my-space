"use client";

import {
  buildMonthGrid,
  dayKey,
  groupItemsByDay,
  parseCalendarItems,
  weekdayHeaders,
  type SerializedCalendarItem,
} from "@/lib/calendar";
import { EventDialogsController } from "./EventDialogsController";
import { DayCell } from "./DayCell";

interface MonthGridProps {
  date: Date;
  items: SerializedCalendarItem[];
}

export function MonthGrid({ date, items }: MonthGridProps) {
  const parsedItems = parseCalendarItems(items);
  const days = buildMonthGrid(date);
  const grouped = groupItemsByDay(parsedItems);
  const headers = weekdayHeaders();

  return (
    <EventDialogsController>
      {({ openCreate, openDetail }) => (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-3">
         
          <div className="mb-2 grid grid-cols-7 gap-2 px-1" >
            {headers.map((label) => (
              <span
                key={label}
                className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2" role="grid">
            {days.map((day) => (
              <DayCell
                key={dayKey(day)}
                day={day}
                currentMonth={date}
                items={grouped.get(dayKey(day)) ?? []}
                onCreate={openCreate}
                onEventClick={openDetail}
              />
            ))}
          </div>
        </div>
      )}
    </EventDialogsController>
  );
}
