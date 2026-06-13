import type { TaskStatus } from "@/lib/types";

export interface BoardView {
  id: string;
  name: string;
  position: number;
}

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  boardId: string;
  boardName: string;
  position: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type GroupedTasks = Record<TaskStatus, BoardTask[]>;
