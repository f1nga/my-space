"use client";

import {
  buildMonthGrid,
  parseCalendarItems,
  weekdayHeaders,
  type SerializedCalendarItem,
} from "@/lib/calendar";
import {
  buildMonthEventSegments,
  chunkMonthIntoWeeks,
  getWeekHiddenSegmentCount,
  getWeekLaneCount,
  getWeekVisibleSegments,
  groupAllItemsByDay,
  groupDayCellItemsByDay,
} from "@/lib/calendar-layout";
import { EventDialogsController } from "./EventDialogsController";
import { MonthWeekRow } from "./MonthWeekRow";

interface MonthGridProps {
  date: Date;
  items: SerializedCalendarItem[];
}

export function MonthGrid({ date, items }: MonthGridProps) {
  const parsedItems = parseCalendarItems(items);
  const days = buildMonthGrid(date);
  const weeks = chunkMonthIntoWeeks(days);
  const segments = buildMonthEventSegments(parsedItems, days);
  const groupedCellItems = groupDayCellItemsByDay(parsedItems);
  const allItemsByDay = groupAllItemsByDay(parsedItems);
  const headers = weekdayHeaders();

  return (
    <EventDialogsController>
      {({ openCreate, openDetail }) => (
        <div className="rounded-2xl border border-border bg-bg-elevated/40 p-3">
          <div className="mb-2 grid grid-cols-7 gap-2 px-1">
            {headers.map((label) => (
              <span
                key={label}
                className="text-[11px] font-medium uppercase tracking-wider text-text-subtle"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="space-y-2" role="grid">
            {weeks.map((weekDays, weekIndex) => {
              const laneCount = getWeekLaneCount(segments, weekIndex);
              const weekSegments = getWeekVisibleSegments(segments, weekIndex);
              const hiddenCount = getWeekHiddenSegmentCount(segments, weekIndex);

              return (
                <MonthWeekRow
                  key={weekIndex}
                  weekDays={weekDays}
                  currentMonth={date}
                  groupedCellItems={groupedCellItems}
                  allItemsByDay={allItemsByDay}
                  segments={weekSegments}
                  hiddenSegmentCount={hiddenCount}
                  laneCount={laneCount}
                  onCreate={openCreate}
                  onEventClick={openDetail}
                />
              );
            })}
          </div>
        </div>
      )}
    </EventDialogsController>
  );
}
