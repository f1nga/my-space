import { PageHeader } from "@/components/layout/PageHeader";
import { BoardClient } from "@/components/board/BoardClient";
import { getTasksGroupedByStatus } from "@/lib/data/tasks";
import { TASK_STATUSES } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import type { BoardTask, GroupedTasks } from "@/components/board/types";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const grouped = await getTasksGroupedByStatus();

  const initial = TASK_STATUSES.reduce<GroupedTasks>(
    (acc, status) => {
      acc[status] = grouped[status].map(
        (task): BoardTask => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: status as TaskStatus,
          position: task.position,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }),
      );
      return acc;
    },
    { todo: [], doing: [], done: [] },
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Tauler"
        title="Kanban"
        description="Organitza les tasques entre les columnes Per fer, En proces i Fet."
      />
      <section className="flex-1 px-6 py-6 md:px-10">
        <BoardClient initial={initial} />
      </section>
    </div>
  );
}
