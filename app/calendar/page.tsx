import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { WeekTimeGrid } from "@/components/calendar/WeekTimeGrid";
import { DayTimeline } from "@/components/calendar/DayTimeline";
import { getEventsInRange } from "@/lib/data/events";
import { getTasksDueBetween } from "@/lib/data/tasks";
import {
  dayKey,
  getRangeForView,
  parseDateParam,
  parseViewParam,
  type CalendarItem,
} from "@/lib/calendar";
import { serializeCalendarItems } from "@/lib/serialization";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{ view?: string; date?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const view = parseViewParam(params.view);
  const date = parseDateParam(params.date);
  const range = getRangeForView(date, view);

  const [events, tasks] = await Promise.all([
    getEventsInRange(range.start, range.end),
    getTasksDueBetween(range.start, range.end),
  ]);

  const items: CalendarItem[] = [
    ...events.map(
      (event): CalendarItem => ({
        id: event.id,
        kind: "event",
        title: event.title,
        description: event.description ?? null,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        allDay: event.allDay,
        color: event.color,
      }),
    ),
    ...tasks
      .filter((task) => task.dueDate !== null)
      .map(
        (task): CalendarItem => ({
          id: `task-${task.id}`,
          kind: "task",
          title: `📋 ${task.title}`,
          description: task.description ?? null,
          startsAt: task.dueDate as Date,
          endsAt: null,
          allDay: true,
          color: null,
        }),
      ),
  ];

  const serializedItems = serializeCalendarItems(items);

  const dayItems =
    view === "day"
      ? serializedItems.filter(
          (item) => dayKey(new Date(item.startsAt)) === dayKey(date),
        )
      : serializedItems;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Calendari"
        title="La teva agenda"
        description="Esdeveniments i tasques amb venciment en una sola vista."
      />
      <section className="flex-1 space-y-4 px-6 py-6 md:px-10">
        <CalendarHeader date={date} view={view} />
        {view === "month" ? (
          <MonthGrid date={date} items={serializedItems} />
        ) : null}
        {view === "week" ? (
          <WeekTimeGrid date={date} items={serializedItems} />
        ) : null}
        {view === "day" ? (
          <DayTimeline date={date} items={dayItems} />
        ) : null}
      </section>
    </div>
  );
}
