import { format } from "date-fns";
import { ca } from "date-fns/locale";
import {
  buildWeekGrid,
  dayKey,
  groupItemsByDay,
  type CalendarItem,
} from "@/lib/calendar";
import { DayCell } from "./DayCell";

interface WeekViewProps {
  date: Date;
  items: CalendarItem[];
}

export function WeekView({ date, items }: WeekViewProps) {
  const days = buildWeekGrid(date);
  const grouped = groupItemsByDay(items);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
        {days.map((day) => (
          <div key={dayKey(day)} className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              {format(day, "EEE d", { locale: ca })}
            </p>
            <DayCell
              day={day}
              currentMonth={date}
              items={grouped.get(dayKey(day)) ?? []}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
