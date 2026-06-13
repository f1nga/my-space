import "server-only";
import { prisma } from "@/lib/prisma";
import type { TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

export type TaskRecord = Awaited<ReturnType<typeof prisma.task.findFirst>>;
export type TaskWithBoard = Awaited<
  ReturnType<
    typeof prisma.task.findMany<{ include: { board: true } }>
  >
>[number];

export async function getTasksGroupedByStatus(): Promise<
  Record<TaskStatus, TaskWithBoard[]>
> {
  const tasks = await prisma.task.findMany({
    include: { board: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const grouped: Record<TaskStatus, TaskWithBoard[]> = {
    todo: [],
    doing: [],
    done: [],
  };

  for (const task of tasks) {
    const status = (TASK_STATUSES as readonly string[]).includes(task.status)
      ? (task.status as TaskStatus)
      : "todo";
    grouped[status].push(task);
  }

  return grouped;
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({ where: { id } });
}

export async function getTasksDueBetween(start: Date, end: Date) {
  return prisma.task.findMany({
    where: { dueDate: { gte: start, lte: end } },
    orderBy: { dueDate: "asc" },
  });
}
