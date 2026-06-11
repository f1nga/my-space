import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { WeekView } from "@/components/calendar/WeekView";
import { getEventsInRange } from "@/lib/data/events";
import { getTasksDueBetween } from "@/lib/data/tasks";
import {
  getMonthRange,
  getWeekRange,
  parseDateParam,
  parseViewParam,
  type CalendarItem,
} from "@/lib/calendar";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{ view?: string; date?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const view = parseViewParam(params.view);
  const date = parseDateParam(params.date);
  const range = view === "month" ? getMonthRange(date) : getWeekRange(date);

  // Lectures en paral·lel (regla async-parallel).
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
          startsAt: task.dueDate as Date,
          endsAt: null,
          allDay: false,
          color: null,
        }),
      ),
  ];

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
          <MonthGrid date={date} items={items} />
        ) : (
          <WeekView date={date} items={items} />
        )}
      </section>
    </div>
  );
}
