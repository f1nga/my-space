"use client";

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
import { TASK_STATUSES } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import type { BoardTask, GroupedTasks } from "./types";

interface BoardClientProps {
  initial: GroupedTasks;
}

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

export function BoardClient({ initial }: BoardClientProps) {
  const [groups, setGroups] = useState<GroupedTasks>(initial);
  const [trackedInitial, setTrackedInitial] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Patro React 19: derivar estat durant el render quan canvia una prop,
  // en lloc d'utilitzar un useEffect (regla react-hooks/set-state-in-effect).
  if (trackedInitial !== initial) {
    setTrackedInitial(initial);
    setGroups(initial);
  }

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid h-[calc(100vh-12rem)] gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <Column key={status} status={status} tasks={groups[status]} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
