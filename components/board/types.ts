import type { TaskStatus } from "@/lib/types";

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type GroupedTasks = Record<TaskStatus, BoardTask[]>;
