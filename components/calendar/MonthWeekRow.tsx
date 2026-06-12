"use client";

import { cn } from "@/lib/utils";
import { dayKey, type CalendarItem } from "@/lib/calendar";
import {
  MONTH_MAX_VISIBLE_LANES,
  MONTH_SPAN_LANE_HEIGHT_PX,
  type MonthEventSegment,
} from "@/lib/calendar-layout";
import { DayCell } from "./DayCell";
import { MonthEventSpan } from "./MonthEventSpan";

interface MonthWeekRowProps {
  weekDays: Date[];
  currentMonth: Date;
  groupedCellItems: Map<string, CalendarItem[]>;
  allItemsByDay: Map<string, CalendarItem[]>;
  segments: MonthEventSegment[];
  hiddenSegmentCount: number;
  laneCount: number;
  onCreate: (day: Date) => void;
  onEventClick: (item: CalendarItem) => void;
}

export function MonthWeekRow({
  weekDays,
  currentMonth,
  groupedCellItems,
  allItemsByDay,
  segments,
  hiddenSegmentCount,
  laneCount,
  onCreate,
  onEventClick,
}: MonthWeekRowProps) {
  const spanAreaHeight = laneCount * MONTH_SPAN_LANE_HEIGHT_PX;

  return (
    <div className="relative" role="row">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <DayCell
            key={dayKey(day)}
            day={day}
            currentMonth={currentMonth}
            items={groupedCellItems.get(dayKey(day)) ?? []}
            allDayItems={allItemsByDay.get(dayKey(day)) ?? []}
            spanLaneOffset={spanAreaHeight}
            onCreate={onCreate}
            onEventClick={onEventClick}
          />
        ))}
      </div>

      {laneCount > 0 ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-8 grid grid-cols-7 gap-2 px-0"
          style={{
            height: spanAreaHeight,
            gridTemplateRows: `repeat(${MONTH_MAX_VISIBLE_LANES}, ${MONTH_SPAN_LANE_HEIGHT_PX}px)`,
          }}
          aria-hidden={segments.length === 0}
        >
          {segments.map((segment) => (
            <MonthEventSpan
              key={segment.segmentKey}
              segment={segment}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      ) : null}

      {hiddenSegmentCount > 0 ? (
        <p
          className={cn(
            "mt-1 px-1 text-[10px] text-text-subtle",
            laneCount > 0 && "absolute right-0 top-0",
          )}
          aria-label={`${hiddenSegmentCount} esdeveniments multidia ocults aquesta setmana`}
        >
          +{hiddenSegmentCount} mes
        </p>
      ) : null}
    </div>
  );
}
