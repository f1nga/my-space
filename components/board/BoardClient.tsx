"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { moveTask } from "@/lib/actions/tasks";
import { useI18n } from "@/lib/i18n/client";
import { TASK_STATUSES } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BoardFormDialog } from "./BoardFormDialog";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import type { BoardTask, BoardView, GroupedTasks } from "./types";

interface BoardClientProps {
  initial: GroupedTasks;
  initialBoards: BoardView[];
}

type BoardFilter = "tots" | string;

const POSITION_STEP = 1024;

function cloneGroups(input: GroupedTasks): GroupedTasks {
  return Object.fromEntries(
    TASK_STATUSES.map((status) => [status, [...input[status]]]),
  ) as GroupedTasks;
}

function findStatusOf(groups: GroupedTasks, taskId: string): TaskStatus | null {
  for (const status of TASK_STATUSES) {
    if (groups[status].some((task) => task.id === taskId)) return status;
  }
  return null;
}

function computePosition(
  list: BoardTask[],
  insertIndex: number,
  movingId: string,
): number {
  const filtered = list.filter((task) => task.id !== movingId);
  const before = filtered[insertIndex - 1];
  const after = filtered[insertIndex];

  if (!before && !after) return POSITION_STEP;
  if (!before) return after!.position / 2;
  if (!after) return before.position + POSITION_STEP;
  return (before.position + after.position) / 2;
}

function filterGroupsByBoard(
  groups: GroupedTasks,
  boardId: BoardFilter,
): GroupedTasks {
  if (boardId === "tots") return groups;
  return Object.fromEntries(
    TASK_STATUSES.map((status) => [
      status,
      groups[status].filter((task) => task.boardId === boardId),
    ]),
  ) as GroupedTasks;
}

export function BoardClient({ initial, initialBoards }: BoardClientProps) {
  const { t } = useI18n();
  const [groups, setGroups] = useState<GroupedTasks>(initial);
  const [boards, setBoards] = useState<BoardView[]>(initialBoards);
  const [trackedInitial, setTrackedInitial] = useState(initial);
  const [trackedBoards, setTrackedBoards] = useState(initialBoards);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<BoardFilter>("tots");
  const [createBoardOpen, setCreateBoardOpen] = useState(false);

  if (trackedInitial !== initial) {
    setTrackedInitial(initial);
    setGroups(initial);
  }
  if (trackedBoards !== initialBoards) {
    setTrackedBoards(initialBoards);
    setBoards(initialBoards);
  }

  const filteredGroups = useMemo(
    () => filterGroupsByBoard(groups, activeBoard),
    [groups, activeBoard],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    for (const status of TASK_STATUSES) {
      const task = groups[status].find((entry) => entry.id === activeId);
      if (task) return task;
    }
    return null;
  }, [activeId, groups]);

  const defaultBoardId =
    activeBoard !== "tots"
      ? activeBoard
      : boards[0]?.id;

  function handleBoardCreated(board: BoardView) {
    setBoards((prev) => [...prev, board]);
    setActiveBoard(board.id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    setGroups((prev) => {
      const next = cloneGroups(prev);
      const fromStatus = findStatusOf(next, activeIdStr);
      if (!fromStatus) return prev;

      let toStatus: TaskStatus;
      let toIndex: number;

      if (overIdStr.startsWith("column-")) {
        toStatus = overIdStr.replace("column-", "") as TaskStatus;
        toIndex = next[toStatus].length;
      } else {
        const resolved = findStatusOf(next, overIdStr);
        if (!resolved) return prev;
        toStatus = resolved;
        const idx = next[toStatus].findIndex((task) => task.id === overIdStr);
        toIndex = idx < 0 ? next[toStatus].length : idx;
      }

      if (fromStatus === toStatus) return prev;

      const fromIndex = next[fromStatus].findIndex((t) => t.id === activeIdStr);
      const [moving] = next[fromStatus].splice(fromIndex, 1);
      moving.status = toStatus;
      next[toStatus].splice(toIndex, 0, moving);
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    setGroups((prev) => {
      const next = cloneGroups(prev);
      const fromStatus = findStatusOf(next, activeIdStr);
      if (!fromStatus) return prev;

      let toStatus: TaskStatus = fromStatus;
      let insertIndex = next[fromStatus].findIndex((t) => t.id === activeIdStr);

      if (overIdStr.startsWith("column-")) {
        toStatus = overIdStr.replace("column-", "") as TaskStatus;
        insertIndex = next[toStatus].filter((t) => t.id !== activeIdStr).length;
      } else if (overIdStr !== activeIdStr) {
        const overStatus = findStatusOf(next, overIdStr);
        if (overStatus) {
          toStatus = overStatus;
          insertIndex = next[toStatus].findIndex((t) => t.id === overIdStr);
        }
      }

      const fromIndex = next[fromStatus].findIndex((t) => t.id === activeIdStr);
      if (fromIndex < 0) return prev;
      const [moving] = next[fromStatus].splice(fromIndex, 1);
      const newPosition = computePosition(next[toStatus], insertIndex, moving.id);
      moving.status = toStatus;
      moving.position = newPosition;
      next[toStatus].splice(insertIndex, 0, moving);

      void moveTask({
        id: moving.id,
        status: toStatus,
        position: newPosition,
      });

      return next;
    });
  }

  return (
    <div className="space-y-5">
      <nav
        aria-label={t("board.filterLabel")}
        className="flex flex-wrap items-center gap-2"
      >
        <BoardPill
          active={activeBoard === "tots"}
          onClick={() => setActiveBoard("tots")}
          label={t("common.all")}
        />
        {boards.map((board) => (
          <BoardPill
            key={board.id}
            active={activeBoard === board.id}
            onClick={() => setActiveBoard(board.id)}
            label={board.name}
          />
        ))}
        <button
          type="button"
          onClick={() => setCreateBoardOpen(true)}
          aria-label={t("board.addBoard")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] transition-all duration-200 hover:border-[var(--color-accent-ring)] hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
      </nav>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid h-[calc(100vh-14rem)] gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={filteredGroups[status]}
              boards={boards}
              defaultBoardId={defaultBoardId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} boards={boards} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <BoardFormDialog
        open={createBoardOpen}
        onClose={() => setCreateBoardOpen(false)}
        onCreated={handleBoardCreated}
      />
    </div>
  );
}

function BoardPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
        active
          ? "bg-[var(--color-accent)] text-white shadow-[0_0_12px_var(--color-accent-ring)]"
          : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
      )}
    >
      {label}
    </button>
  );
}
