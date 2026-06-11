import "server-only";
import { prisma } from "@/lib/prisma";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";

export async function getDashboardData() {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Tots els agregats en paral·lel (regla async-parallel).
  const [tasksByStatus, todayTasks, overdueTasks, upcomingEvents, recentNotes, totalNotes, totalEvents] =
    await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.task.findMany({
        where: {
          dueDate: { gte: startOfToday, lte: endOfToday },
          status: { not: "done" },
        },
        orderBy: [{ dueDate: "asc" }, { position: "asc" }],
        take: 6,
      }),
      prisma.task.findMany({
        where: {
          dueDate: { lt: startOfToday },
          status: { not: "done" },
        },
        orderBy: { dueDate: "asc" },
        take: 6,
      }),
      prisma.event.findMany({
        where: { startsAt: { gte: now, lte: inSevenDays } },
        orderBy: { startsAt: "asc" },
        take: 5,
      }),
      prisma.note.findMany({
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.note.count(),
      prisma.event.count({ where: { startsAt: { gte: now } } }),
    ]);

  const counts: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 };
  for (const row of tasksByStatus) {
    if ((TASK_STATUSES as readonly string[]).includes(row.status)) {
      counts[row.status as TaskStatus] = row._count._all;
    }
  }
  const totalTasks = counts.todo + counts.doing + counts.done;

  return {
    counts,
    totals: {
      tasks: totalTasks,
      notes: totalNotes,
      upcomingEvents: totalEvents,
    },
    todayTasks,
    overdueTasks,
    upcomingEvents,
    recentNotes,
  };
}
