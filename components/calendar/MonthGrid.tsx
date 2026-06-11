import {
  buildMonthGrid,
  dayKey,
  groupItemsByDay,
  weekdayHeaders,
  type CalendarItem,
} from "@/lib/calendar";
import { DayCell } from "./DayCell";

interface MonthGridProps {
  date: Date;
  items: CalendarItem[];
}

export function MonthGrid({ date, items }: MonthGridProps) {
  const days = buildMonthGrid(date);
  const grouped = groupItemsByDay(items);
  const headers = weekdayHeaders();

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-3">
      <div className="mb-2 grid grid-cols-7 gap-2 px-1">
        {headers.map((label) => (
          <span
            key={label}
            className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <DayCell
            key={dayKey(day)}
            day={day}
            currentMonth={date}
            items={grouped.get(dayKey(day)) ?? []}
          />
        ))}
      </div>
    </div>
  );
}
