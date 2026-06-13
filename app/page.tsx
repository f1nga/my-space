import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getDashboardData } from "@/lib/data/dashboard";
import { getBoards } from "@/lib/data/boards";
import type { BoardView } from "@/components/board/types";
import { getLocale } from "@/lib/i18n/get-locale";
import { getTranslations } from "@/lib/i18n/get-dictionary";
import { getIntlLocaleId } from "@/lib/i18n/date-locale";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function greetingKey(hour: number): "dashboard.greetingMorning" | "dashboard.greetingAfternoon" | "dashboard.greetingEvening" {
  if (hour < 13) return "dashboard.greetingMorning";
  if (hour < 20) return "dashboard.greetingAfternoon";
  return "dashboard.greetingEvening";
}

export default async function DashboardPage() {
  const [data, boards, locale, t] = await Promise.all([
    getDashboardData(),
    getBoards(),
    getLocale(),
    getTranslations(),
  ]);
  const intlLocale = getIntlLocaleId(locale);
  const today = capitalize(formatDate(new Date(), intlLocale));
  const hour = new Date().getHours();

  const boardViews: BoardView[] = boards.map((board) => ({
    id: board.id,
    name: board.name,
    position: board.position,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow={today}
        title={t(greetingKey(hour))}
        description={t("dashboard.description")}
      />
      <section className="flex-1 space-y-6 px-6 py-8 md:px-10">
        <StatsCards
          counts={data.counts}
          notes={data.totals.notes}
          upcomingEvents={data.totals.upcomingEvents}
        />

        <QuickActions boards={boardViews} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodayTasks
              today={data.todayTasks.map((task) => ({
                id: task.id,
                title: task.title,
                status: task.status,
                dueDate: task.dueDate,
              }))}
              overdue={data.overdueTasks.map((task) => ({
                id: task.id,
                title: task.title,
                status: task.status,
                dueDate: task.dueDate,
              }))}
            />
          </div>
          <UpcomingEvents
            events={data.upcomingEvents.map((event) => ({
              id: event.id,
              title: event.title,
              startsAt: event.startsAt,
              allDay: event.allDay,
              color: event.color,
            }))}
          />
        </div>

        <RecentNotes
          notes={data.recentNotes.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            updatedAt: note.updatedAt,
          }))}
        />
      </section>
    </div>
  );
}
