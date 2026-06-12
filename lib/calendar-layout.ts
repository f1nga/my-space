import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { dayKey, type CalendarItem } from "@/lib/calendar";

export const MONTH_SPAN_LANE_HEIGHT_PX = 20;
export const MONTH_MAX_VISIBLE_LANES = 3;

/** Visual inclusive calendar-day range for month spanning. */
export function getEventVisualRange(item: CalendarItem): {
  start: Date;
  end: Date;
} {
  const start = startOfDay(item.startsAt);

  if (!item.endsAt) {
    return { start, end: start };
  }

  const endDay = startOfDay(item.endsAt);

  if (item.allDay) {
    // All-day date inputs: end day is inclusive when after start.
    const end = endDay.getTime() >= start.getTime() ? endDay : start;
    return { start, end };
  }

  // Timed: span every calendar day from start through end (inclusive).
  const end =
    endDay.getTime() >= start.getTime() ? endDay : startOfDay(item.startsAt);
  return { start, end };
}

export function isMultiDayEvent(item: CalendarItem): boolean {
  if (item.kind !== "event") return false;
  const { start, end } = getEventVisualRange(item);
  return differenceInCalendarDays(end, start) > 0;
}

export function chunkMonthIntoWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export interface MonthEventSegment {
  item: CalendarItem;
  weekIndex: number;
  startColumn: number;
  span: number;
  lane: number;
  continuesFromPreviousWeek: boolean;
  continuesToNextWeek: boolean;
  segmentKey: string;
}

interface RawSegment {
  item: CalendarItem;
  weekIndex: number;
  startColumn: number;
  span: number;
  continuesFromPreviousWeek: boolean;
  continuesToNextWeek: boolean;
}

function dayIndexInWeek(day: Date, week: Date[]): number {
  const key = dayKey(day);
  return week.findIndex((d) => dayKey(d) === key);
}

function assignLanes(segments: RawSegment[]): MonthEventSegment[] {
  const laneEndColumns: number[] = [];
  const result: MonthEventSegment[] = [];

  const sorted = [...segments].sort(
    (a, b) => a.startColumn - b.startColumn || b.span - a.span,
  );

  for (const seg of sorted) {
    let lane = 0;
    while (lane < laneEndColumns.length) {
      const laneEndCol = laneEndColumns[lane];
      if (seg.startColumn > laneEndCol) break;
      lane++;
    }
    laneEndColumns[lane] = seg.startColumn + seg.span - 1;

    result.push({
      ...seg,
      lane,
      segmentKey: `${seg.item.id}-w${seg.weekIndex}`,
    });
  }

  return result;
}

export function buildMonthEventSegments(
  items: CalendarItem[],
  days: Date[],
): MonthEventSegment[] {
  const weeks = chunkMonthIntoWeeks(days);
  const multiDayEvents = items.filter(isMultiDayEvent);
  const raw: RawSegment[] = [];

  for (const item of multiDayEvents) {
    const { start: visualStart, end: visualEnd } = getEventVisualRange(item);

    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const week = weeks[weekIndex];
      const weekStart = startOfDay(week[0]);
      const weekEnd = startOfDay(week[6]);

      if (visualEnd < weekStart || visualStart > weekEnd) continue;

      const segmentStart = isBefore(visualStart, weekStart)
        ? weekStart
        : visualStart;
      const segmentEnd = isBefore(weekEnd, visualEnd) ? weekEnd : visualEnd;

      const startIdx = dayIndexInWeek(segmentStart, week);
      const endIdx = dayIndexInWeek(segmentEnd, week);
      if (startIdx < 0 || endIdx < 0) continue;

      raw.push({
        item,
        weekIndex,
        startColumn: startIdx + 1,
        span: endIdx - startIdx + 1,
        continuesFromPreviousWeek: visualStart < weekStart,
        continuesToNextWeek: visualEnd > weekEnd,
      });
    }
  }

  const byWeek = new Map<number, RawSegment[]>();
  for (const seg of raw) {
    const list = byWeek.get(seg.weekIndex);
    if (list) list.push(seg);
    else byWeek.set(seg.weekIndex, [seg]);
  }

  const assigned: MonthEventSegment[] = [];
  for (const [, weekSegs] of byWeek) {
    assigned.push(...assignLanes(weekSegs));
  }

  return assigned.sort(
    (a, b) => a.weekIndex - b.weekIndex || a.lane - b.lane,
  );
}

export function getWeekLaneCount(
  segments: MonthEventSegment[],
  weekIndex: number,
): number {
  const weekSegs = segments.filter((s) => s.weekIndex === weekIndex);
  if (weekSegs.length === 0) return 0;
  return Math.min(
    MONTH_MAX_VISIBLE_LANES,
    Math.max(...weekSegs.map((s) => s.lane)) + 1,
  );
}

export function getWeekVisibleSegments(
  segments: MonthEventSegment[],
  weekIndex: number,
): MonthEventSegment[] {
  return segments.filter(
    (s) => s.weekIndex === weekIndex && s.lane < MONTH_MAX_VISIBLE_LANES,
  );
}

export function getWeekHiddenSegmentCount(
  segments: MonthEventSegment[],
  weekIndex: number,
): number {
  return segments.filter(
    (s) => s.weekIndex === weekIndex && s.lane >= MONTH_MAX_VISIBLE_LANES,
  ).length;
}

/** Items shown as chips inside day cells (not multi-day span bars). */
export function filterDayCellItems(items: CalendarItem[]): CalendarItem[] {
  return items.filter((item) => !isMultiDayEvent(item));
}

export function groupDayCellItemsByDay(
  items: CalendarItem[],
): Map<string, CalendarItem[]> {
  const cellItems = filterDayCellItems(items);
  const map = new Map<string, CalendarItem[]>();
  for (const item of cellItems) {
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

/** All items touching a calendar day (for overflow popover). */
export function groupAllItemsByDay(
  items: CalendarItem[],
): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();

  for (const item of items) {
    const { start, end } =
      item.kind === "event" && isMultiDayEvent(item)
        ? getEventVisualRange(item)
        : { start: startOfDay(item.startsAt), end: startOfDay(item.startsAt) };

    let cursor = start;
    while (cursor <= end) {
      const key = dayKey(cursor);
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
      cursor = addDays(cursor, 1);
    }
  }

  for (const [, list] of map) {
    list.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }
  return map;
}

export function itemsForDayIncludingSpans(
  items: CalendarItem[],
  day: Date,
): CalendarItem[] {
  const key = dayKey(day);
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return items.filter((item) => {
    if (item.kind === "task") {
      return dayKey(item.startsAt) === key;
    }
    const { start, end } = getEventVisualRange(item);
    return start <= dayEnd && end >= dayStart;
  });
}
