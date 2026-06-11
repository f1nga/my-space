import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
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
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ca } from "date-fns/locale";

export type CalendarView = "month" | "week" | "day";

export const HOUR_HEIGHT_PX = 48;
export const MIN_EVENT_HEIGHT_PX = 24;
export const MINUTES_PER_DAY = 24 * 60;

const WEEK_OPTS = { weekStartsOn: 1 as const, locale: ca };

export function parseDateParam(raw: string | undefined): Date {
  if (!raw) return startOfDay(new Date());
  const parsed = parseISO(raw);
  return Number.isNaN(parsed.getTime()) ? startOfDay(new Date()) : parsed;
}

export function parseViewParam(raw: string | undefined): CalendarView {
  if (raw === "week") return "week";
  if (raw === "day") return "day";
  return "month";
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

export function getDayRange(date: Date) {
  const start = startOfDay(date);
  const end = endOfDay(date);
  return { start, end };
}

export function getRangeForView(date: Date, view: CalendarView) {
  if (view === "month") return getMonthRange(date);
  if (view === "week") return getWeekRange(date);
  return getDayRange(date);
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
  if (view === "month") return subMonths(date, 1);
  if (view === "week") return subWeeks(date, 1);
  return subDays(date, 1);
}

export function nextDate(date: Date, view: CalendarView): Date {
  if (view === "month") return addMonths(date, 1);
  if (view === "week") return addWeeks(date, 1);
  return addDays(date, 1);
}

export function formatRangeTitle(date: Date, view: CalendarView): string {
  if (view === "month") {
    return format(date, "LLLL yyyy", { locale: ca }).replace(/^./, (c) =>
      c.toUpperCase(),
    );
  }
  if (view === "day") {
    return format(date, "EEEE d MMMM yyyy", { locale: ca }).replace(/^./, (c) =>
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
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  color: string | null;
}

export interface SerializedCalendarItem {
  id: string;
  kind: "event" | "task";
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  color: string | null;
}

export function parseCalendarItem(item: SerializedCalendarItem): CalendarItem {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    description: item.description,
    startsAt: new Date(item.startsAt),
    endsAt: item.endsAt ? new Date(item.endsAt) : null,
    allDay: item.allDay,
    color: item.color,
  };
}

export function parseCalendarItems(
  items: SerializedCalendarItem[],
): CalendarItem[] {
  return items.map(parseCalendarItem);
}

export function groupItemsByDay(
  items: CalendarItem[],
): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const key = dayKey(item.startsAt);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }
  return map;
}

export function minutesFromStartOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export interface EventLayout {
  topPx: number;
  heightPx: number;
}

export function eventLayout(
  item: CalendarItem,
  day?: Date,
): EventLayout {
  const dayStart = day ? startOfDay(day) : startOfDay(item.startsAt);
  const dayEnd = endOfDay(dayStart);

  const start = item.startsAt < dayStart ? dayStart : item.startsAt;
  const end =
    item.endsAt && item.endsAt > dayStart
      ? item.endsAt > dayEnd
        ? dayEnd
        : item.endsAt
      : new Date(start.getTime() + 60 * 60 * 1000);

  const startMinutes = minutesFromStartOfDay(start);
  const endMinutes = Math.max(
    startMinutes + 30,
    minutesFromStartOfDay(end),
  );

  const topPx = (startMinutes / MINUTES_PER_DAY) * HOUR_HEIGHT_PX * 24;
  const heightPx = Math.max(
    MIN_EVENT_HEIGHT_PX,
    ((endMinutes - startMinutes) / MINUTES_PER_DAY) * HOUR_HEIGHT_PX * 24,
  );

  return { topPx, heightPx };
}

export function splitAllDayAndTimed(items: CalendarItem[]): {
  allDay: CalendarItem[];
  timed: CalendarItem[];
} {
  const allDay: CalendarItem[] = [];
  const timed: CalendarItem[] = [];

  for (const item of items) {
    if (item.allDay || item.kind === "task") {
      allDay.push(item);
    } else {
      timed.push(item);
    }
  }

  return { allDay, timed };
}

export function snapToNearestHalfHour(date: Date): Date {
  const snapped = new Date(date);
  const minutes = snapped.getMinutes();
  const rounded = minutes < 15 ? 0 : minutes < 45 ? 30 : 60;
  if (rounded === 60) {
    snapped.setHours(snapped.getHours() + 1, 0, 0, 0);
  } else {
    snapped.setMinutes(rounded, 0, 0);
  }
  return snapped;
}

export const calendarUtils = {
  isSameDay,
  isSameMonth,
  isToday: isTodayFn,
};
