"use client";

import { format } from "date-fns";
import { ca } from "date-fns/locale";
import Link from "next/link";
import {
  buildWeekGrid,
  dayKey,
  groupItemsByDay,
  splitAllDayAndTimed,
  snapToNearestHalfHour,
  toISODate,
  parseCalendarItems,
  type CalendarItem,
  type SerializedCalendarItem,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "lucide-react";
import { EventDialogsController } from "./EventDialogsController";
import { TimeGridColumn, TimeGridHourLabels } from "./TimeGrid";
import { CalendarItemChip } from "./CalendarItemChip";
import { DayTimeline } from "./DayTimeline";

interface WeekTimeGridProps {
  date: Date;
  items: SerializedCalendarItem[];
}

function WeekDesktopGrid({
  days,
  grouped,
  openCreate,
  openDetail,
}: {
  days: Date[];
  grouped: Map<string, CalendarItem[]>;
  openCreate: (defaultStart?: Date) => void;
  openDetail: (item: CalendarItem) => void;
}) {
  const hasAnyItems = days.some(
    (day) => (grouped.get(dayKey(day)) ?? []).length > 0,
  );

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated/40 p-3">
      {!hasAnyItems ? (
        <EmptyState
          icon={Calendar}
          title="Cap esdeveniment aquesta setmana"
          description="Fes clic a una hora o usa el botó Nou per crear-ne un."
          className="mb-4 py-8"
        />
      ) : null}

      <div className="mb-2 grid grid-cols-[56px_repeat(7,1fr)] gap-0">
        <div />
        {days.map((day) => (
          <Link
            key={dayKey(day)}
            href={`/calendar?view=day&date=${toISODate(day)}`}
            className="px-1 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-text-subtle transition-colors hover:text-text"
          >
            {format(day, "EEE d", { locale: ca })}
          </Link>
        ))}
      </div>

        <div className="mb-2 grid grid-cols-[56px_repeat(7,1fr)] gap-0 border-b border-border/60 pb-2">
        <span className="pr-2 text-right text-[10px] text-text-subtle">
          Tot el dia
        </span>
        {days.map((day) => {
          const dayItems = grouped.get(dayKey(day)) ?? [];
          const { allDay } = splitAllDayAndTimed(dayItems);
          return (
            <div
              key={dayKey(day)}
              className="flex min-h-[28px] flex-wrap gap-0.5 border-l border-border/40 px-0.5 first:border-l-0"
            >
              {allDay.map((item) => (
                <CalendarItemChip
                  key={item.id}
                  item={item}
                  onEventClick={openDetail}
                  compact
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-0">
        <TimeGridHourLabels />
        {days.map((day) => {
          const dayItems = grouped.get(dayKey(day)) ?? [];
          const { timed } = splitAllDayAndTimed(dayItems);
          return (
            <TimeGridColumn
              key={dayKey(day)}
              day={day}
              items={timed.filter((i) => i.kind === "event")}
              onSlotClick={(clicked) =>
                openCreate(snapToNearestHalfHour(clicked))
              }
              onEventClick={openDetail}
              showNowIndicator
            />
          );
        })}
      </div>
    </div>
  );
}

export function WeekTimeGrid({ date, items }: WeekTimeGridProps) {
  const parsedItems = parseCalendarItems(items);
  const days = buildWeekGrid(date);
  const grouped = groupItemsByDay(parsedItems);

  return (
    <EventDialogsController>
      {({ openCreate, openDetail }) => (
        <>
          <div className="hidden md:block">
            <WeekDesktopGrid
              days={days}
              grouped={grouped}
              openCreate={openCreate}
              openDetail={openDetail}
            />
          </div>
          <div className={cn("space-y-4 md:hidden")}>
            {days.map((day) => (
              <div key={dayKey(day)}>
                <p className="mb-2 text-sm font-medium text-text">
                  {format(day, "EEEE d MMM", { locale: ca })}
                </p>
                <DayTimeline
                  date={day}
                  items={grouped.get(dayKey(day)) ?? []}
                  embedded
                />
              </div>
            ))}
          </div>
        </>
      )}
    </EventDialogsController>
  );
}
