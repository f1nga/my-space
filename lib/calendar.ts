import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday as isTodayFn,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ca } from "date-fns/locale";

export type CalendarView = "month" | "week";

const WEEK_OPTS = { weekStartsOn: 1 as const, locale: ca };

export function parseDateParam(raw: string | undefined): Date {
  if (!raw) return startOfDay(new Date());
  const parsed = parseISO(raw);
  return Number.isNaN(parsed.getTime()) ? startOfDay(new Date()) : parsed;
}

export function parseViewParam(raw: string | undefined): CalendarView {
  return raw === "week" ? "week" : "month";
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMonthRange(date: Date) {
  const start = startOfWeek(startOfMonth(date), WEEK_OPTS);
  const end = endOfWeek(endOfMonth(date), WEEK_OPTS);
  return { start, end };
}

export function getWeekRange(date: Date) {
  const start = startOfWeek(date, WEEK_OPTS);
  const end = endOfWeek(date, WEEK_OPTS);
  return { start, end };
}

export function buildMonthGrid(date: Date): Date[] {
  const { start, end } = getMonthRange(date);
  const days: Date[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function buildWeekGrid(date: Date): Date[] {
  const { start } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function weekdayHeaders(): string[] {
  const start = startOfWeek(new Date(), WEEK_OPTS);
  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(start, index), "EEE", { locale: ca }),
  );
}

export function previousDate(date: Date, view: CalendarView): Date {
  return view === "month" ? subMonths(date, 1) : subWeeks(date, 1);
}

export function nextDate(date: Date, view: CalendarView): Date {
  return view === "month" ? addMonths(date, 1) : addWeeks(date, 1);
}

export function formatRangeTitle(date: Date, view: CalendarView): string {
  if (view === "month") {
    return format(date, "LLLL yyyy", { locale: ca }).replace(/^./, (c) =>
      c.toUpperCase(),
    );
  }
  const { start, end } = getWeekRange(date);
  return `${format(start, "d MMM", { locale: ca })} – ${format(end, "d MMM yyyy", { locale: ca })}`;
}

export function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export interface CalendarItem {
  id: string;
  kind: "event" | "task";
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  color: string | null;
}

export function groupItemsByDay(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const key = dayKey(item.startsAt);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return map;
}

export const calendarUtils = {
  isSameDay,
  isSameMonth,
  isToday: isTodayFn,
};
