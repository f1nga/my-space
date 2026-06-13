"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { createTask, updateTask } from "@/lib/actions/tasks";
import { TASK_STATUS_LABELS, TASK_STATUSES } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import type { BoardTask, BoardView } from "./types";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task?: BoardTask | null;
  boards?: BoardView[];
  initialStatus?: TaskStatus;
  initialBoardId?: string;
}

function toDateTimeInput(value: Date | null): string {
  if (!value) return "";
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export function TaskFormDialog({
  open,
  onClose,
  task,
  boards = [],
  initialStatus,
  initialBoardId,
}: TaskFormDialogProps) {
  const editing = Boolean(task);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? initialStatus ?? "todo",
  );
  const [boardId, setBoardId] = useState(
    task?.boardId ?? initialBoardId ?? boards[0]?.id ?? "",
  );
  const [dueDate, setDueDate] = useState(toDateTimeInput(task?.dueDate ?? null));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      boardId,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    if (!payload.title) {
      setError("Cal un titol per a la tasca.");
      return;
    }
    if (!payload.boardId) {
      setError("Cal seleccionar un tauler.");
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateTask({ id: task!.id, ...payload })
        : await createTask(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Editar tasca" : "Nova tasca"}
      description={
        editing
          ? "Actualitza els camps de la tasca seleccionada."
          : "Afegeix-la a la columna que prefereixis."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="task-title"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            Titol
          </label>
          <Input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            required
            maxLength={200}
            placeholder="Per exemple, revisar correus"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="task-description"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            Descripcio (opcional)
          </label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={2000}
            className="resize-none"
            placeholder="Notes addicionals"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="task-status"
              className="text-xs font-medium text-[var(--color-text-muted)]"
            >
              Estat
            </label>
            <Select
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {TASK_STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="task-board"
              className="text-xs font-medium text-[var(--color-text-muted)]"
            >
              Tauler
            </label>
            <Select
              id="task-board"
              value={boardId}
              onChange={(event) => setBoardId(event.target.value)}
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="task-due"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            Venciment (opcional)
          </label>
          <Input
            id="task-due"
            type="datetime-local"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]"
          >
            {error}
          </p>
        ) : null}

        <footer className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            Cancel·lar
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Desant…" : editing ? "Desar canvis" : "Crear tasca"}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
