"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteTask } from "@/lib/actions/tasks";
import { cn, formatTimeCa } from "@/lib/utils";
import type { BoardTask } from "./types";
import { TaskFormDialog } from "./TaskFormDialog";

interface TaskCardProps {
  task: BoardTask;
  isOverlay?: boolean;
}

function relativeDueLabel(date: Date): { text: string; tone: "danger" | "warning" | "muted" } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = Math.round((targetDay.getTime() - today.getTime()) / 86_400_000);
  const time = formatTimeCa(target);
  if (diff < 0) return { text: `Endarrerit · ${time}`, tone: "danger" };
  if (diff === 0) return { text: `Avui · ${time}`, tone: "warning" };
  if (diff === 1) return { text: `Dema · ${time}`, tone: "muted" };
  if (diff < 7) return { text: `En ${diff} dies · ${time}`, tone: "muted" };
  return {
    text: target.toLocaleDateString("ca-ES", { day: "numeric", month: "short" }),
    tone: "muted",
  };
}

export function TaskCard({ task, isOverlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, startDelete] = useTransition();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = task.dueDate ? relativeDueLabel(task.dueDate) : null;

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-[var(--shadow-soft)]",
          "transition-shadow hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card)]",
          isDragging && "opacity-40",
          isOverlay && "shadow-[var(--shadow-pop)] ring-1 ring-[var(--color-accent-ring)]",
        )}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            aria-label="Arrossega per reordenar"
            className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-[var(--color-text-subtle)] opacity-0 transition-opacity hover:bg-[var(--color-surface)] hover:text-[var(--color-text-muted)] group-hover:opacity-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug text-[var(--color-text)]">
              {task.title}
            </p>
            {task.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                {task.description}
              </p>
            ) : null}
            {due ? (
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                  due.tone === "danger" &&
                    "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
                  due.tone === "warning" &&
                    "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
                  due.tone === "muted" &&
                    "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
                )}
              >
                <Calendar className="h-3 w-3" aria-hidden />
                {due.text}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label="Editar tasca"
              onClick={() => setEditOpen(true)}
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Eliminar tasca"
              disabled={pendingDelete}
              onClick={() => {
                if (!confirm("Vols eliminar aquesta tasca?")) return;
                startDelete(async () => {
                  await deleteTask(task.id);
                });
              }}
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </article>

      <TaskFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
      />
    </>
  );
}
