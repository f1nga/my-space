"use client";

import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import type { BoardTask, BoardView } from "./types";
import { TaskCard } from "./TaskCard";
import { TaskFormDialog } from "./TaskFormDialog";

interface ColumnProps {
  status: TaskStatus;
  tasks: BoardTask[];
  boards: BoardView[];
  defaultBoardId?: string;
}

const accentByStatus: Record<TaskStatus, string> = {
  todo: "bg-sky-500",
  doing: "bg-amber-500",
  done: "bg-[var(--color-accent)]",
};

export function Column({ status, tasks, boards, defaultBoardId }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section
      className={cn(
        "flex h-full min-w-[280px] flex-1 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 transition-colors",
        isOver && "border-[var(--color-accent-ring)] bg-[var(--color-accent-soft)]/30",
      )}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn("h-2 w-2 rounded-full", accentByStatus[status])}
          />
          <h3 className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
            {TASK_STATUS_LABELS[status]}
          </h3>
          <span className="rounded-md bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label={`Nova tasca a ${TASK_STATUS_LABELS[status]}`}
          className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 overflow-y-auto px-3 pb-3"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} boards={boards} />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-8 text-xs text-[var(--color-text-subtle)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-muted)]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Afegir tasca
          </button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Afegir tasca
          </Button>
        )}
      </div>

      <TaskFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialStatus={status}
        boards={boards}
        initialBoardId={defaultBoardId}
      />
    </section>
  );
}
