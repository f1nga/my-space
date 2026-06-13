import { PageHeader } from "@/components/layout/PageHeader";
import { BoardClient } from "@/components/board/BoardClient";
import { getBoards } from "@/lib/data/boards";
import { getTasksGroupedByStatus } from "@/lib/data/tasks";
import { getTranslations } from "@/lib/i18n/get-dictionary";
import { TASK_STATUSES } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import type { BoardTask, BoardView, GroupedTasks } from "@/components/board/types";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [grouped, boards, t] = await Promise.all([
    getTasksGroupedByStatus(),
    getBoards(),
    getTranslations(),
  ]);

  const boardViews: BoardView[] = boards.map((board) => ({
    id: board.id,
    name: board.name,
    position: board.position,
  }));

  const initial = TASK_STATUSES.reduce<GroupedTasks>(
    (acc, status) => {
      acc[status] = grouped[status].map(
        (task): BoardTask => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: status as TaskStatus,
          boardId: task.boardId,
          boardName: task.board.name,
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
        eyebrow={t("board.eyebrow")}
        title={t("board.title")}
        description={t("board.description")}
      />
      <section className="flex-1 px-6 py-6 md:px-10">
        <BoardClient initial={initial} initialBoards={boardViews} />
      </section>
    </div>
  );
}
