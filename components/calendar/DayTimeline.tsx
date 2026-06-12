"use client";

import {
  splitAllDayAndTimed,
  snapToNearestHalfHour,
  parseCalendarItems,
  type CalendarItem,
  type SerializedCalendarItem,
} from "@/lib/calendar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "lucide-react";
import { EventDialogsController } from "./EventDialogsController";
import { TimeGridColumn, TimeGridHourLabels } from "./TimeGrid";
import { CalendarItemChip } from "./CalendarItemChip";

interface DayTimelineProps {
  date: Date;
  items: SerializedCalendarItem[] | CalendarItem[];
  embedded?: boolean;
}

function DayTimelineContent({
  date,
  items,
  openCreate,
  openDetail,
  embedded = false,
}: {
  date: Date;
  items: CalendarItem[];
  openCreate: (defaultStart?: Date) => void;
  openDetail: (item: CalendarItem) => void;
  embedded?: boolean;
}) {
  const { allDay, timed } = splitAllDayAndTimed(items);
  const eventCount = items.filter((i) => i.kind === "event").length;
  const taskCount = items.filter((i) => i.kind === "task").length;

  const wrapperClass = embedded
    ? ""
    : "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-3";

  return (
    <div className={wrapperClass}>
      {!embedded && items.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Cap esdeveniment aquest dia"
          description="Fes clic a una hora o usa el botó Nou per crear-ne un."
          className="mb-4 py-8"
        />
      ) : null}
      {!embedded && items.length > 0 ? (
        <p className="mb-3 text-xs text-text-subtle">
          {eventCount} esdeveniment{eventCount === 1 ? "" : "s"}
          {taskCount > 0
            ? ` · ${taskCount} tasca${taskCount === 1 ? "" : "es"}`
            : ""}
        </p>
      ) : null}

      {allDay.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1 border-b border-border/60 pb-2">
          <span className="w-full text-[10px] font-medium uppercase tracking-wider text-text-subtle">
            Tot el dia
          </span>
          {allDay.map((item) => (
            <CalendarItemChip
              key={item.id}
              item={item}
              onEventClick={openDetail}
              compact
            />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-[56px_1fr] gap-0">
        <TimeGridHourLabels />
        <TimeGridColumn
          day={date}
          items={timed.filter((i) => i.kind === "event")}
          onSlotClick={(clicked) => openCreate(snapToNearestHalfHour(clicked))}
          onEventClick={openDetail}
          showNowIndicator
        />
      </div>
    </div>
  );
}

function normalizeItems(
  items: SerializedCalendarItem[] | CalendarItem[],
): CalendarItem[] {
  if (items.length === 0) return [];
  const first = items[0];
  if (typeof first.startsAt === "string") {
    return parseCalendarItems(items as SerializedCalendarItem[]);
  }
  return items as CalendarItem[];
}

export function DayTimeline({ date, items, embedded = false }: DayTimelineProps) {
  const parsedItems = normalizeItems(items);

  if (embedded) {
    return (
      <EventDialogsController>
        {({ openCreate, openDetail }) => (
          <DayTimelineContent
            date={date}
            items={parsedItems}
            openCreate={openCreate}
            openDetail={openDetail}
            embedded
          />
        )}
      </EventDialogsController>
    );
  }

  return (
    <EventDialogsController>
      {({ openCreate, openDetail }) => (
        <DayTimelineContent
          date={date}
          items={parsedItems}
          openCreate={openCreate}
          openDetail={openDetail}
        />
      )}
    </EventDialogsController>
  );
}
