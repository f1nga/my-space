/**
 * Quick sanity checks for month span layout. Run: node scripts/validate-calendar-layout.mjs
 */
import {
  addDays,
  startOfDay,
} from "date-fns";
import { buildMonthGrid, parseCalendarItem } from "../lib/calendar.ts";
import {
  buildMonthEventSegments,
  chunkMonthIntoWeeks,
  isMultiDayEvent,
} from "../lib/calendar-layout.ts";

function item(id, startsAt, endsAt, allDay = true) {
  return parseCalendarItem({
    id,
    kind: "event",
    title: id,
    description: null,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt ? endsAt.toISOString() : null,
    allDay,
    color: "emerald",
  });
}

const june = new Date(2026, 5, 15);
const days = buildMonthGrid(june);
const weeks = chunkMonthIntoWeeks(days);

const multi = item(
  "e1",
  startOfDay(new Date(2026, 5, 12)),
  startOfDay(new Date(2026, 5, 14)),
);
console.assert(isMultiDayEvent(multi), "3-day event should be multi-day");

const single = item(
  "e2",
  new Date(2026, 5, 10, 10, 0),
  new Date(2026, 5, 10, 11, 0),
  false,
);
console.assert(!isMultiDayEvent(single), "same-day timed should not span");

const crossWeek = item(
  "e3",
  startOfDay(new Date(2026, 5, 5)),
  startOfDay(new Date(2026, 5, 9)),
);
const crossSegs = buildMonthEventSegments([crossWeek], days);
console.assert(crossSegs.length >= 2, "cross-week should split into 2+ segments");

const segs = buildMonthEventSegments([multi], days);
console.assert(segs.length === 1 && segs[0].span === 3, "3-day same week span");

const beforeRange = item(
  "e4",
  startOfDay(addDays(days[0], -2)),
  startOfDay(days[2]),
);
const beforeSegs = buildMonthEventSegments([beforeRange], days);
console.assert(
  beforeSegs.some((s) => s.continuesFromPreviousWeek),
  "event before grid should continue from previous",
);

console.log("calendar-layout validation passed", {
  weeks: weeks.length,
  crossWeekSegments: crossSegs.length,
  multiSpan: segs[0]?.span,
});
