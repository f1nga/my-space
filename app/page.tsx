import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatDateCa } from "@/lib/utils";

export const dynamic = "force-dynamic";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 13) return "Bon dia";
  if (hour < 20) return "Bona tarda";
  return "Bona nit";
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const today = capitalize(formatDateCa(new Date()));

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow={today}
        title={greeting()}
        description="Resum del que tens entre mans avui."
      />
      <section className="flex-1 space-y-6 px-6 py-8 md:px-10">
        <StatsCards
          counts={data.counts}
          notes={data.totals.notes}
          upcomingEvents={data.totals.upcomingEvents}
        />

        <QuickActions />

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
