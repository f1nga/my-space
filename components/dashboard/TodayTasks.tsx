"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { updateTask } from "@/lib/actions/tasks";
import { useI18n } from "@/lib/i18n/client";
import { cn, formatTime } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
}

interface TodayTasksProps {
  today: TaskItem[];
  overdue: TaskItem[];
}

function TaskRow({ task, tone }: { task: TaskItem; tone: "today" | "overdue" }) {
  const { t, intlLocale } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface)]">
      <button
        type="button"
        aria-label={t("dashboard.markDone")}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await updateTask({ id: task.id, status: "done" });
          })
        }
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-text-subtle)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
      >
        {pending ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden />
        ) : (
          <Circle className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--color-text)]">{task.title}</p>
        {task.dueDate ? (
          <p
            className={cn(
              "text-[11px]",
              tone === "overdue"
                ? "text-[var(--color-danger)]"
                : "text-[var(--color-text-muted)]",
            )}
          >
            {tone === "overdue"
              ? t("relative.overdueLabel")
              : t("relative.today")}
            · {formatTime(task.dueDate, intlLocale)}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function TodayTasks({ today, overdue }: TodayTasksProps) {
  const { t } = useI18n();
  const hasContent = today.length + overdue.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.todayTasks")}</CardTitle>
        <Link
          href="/board"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          {t("dashboard.fullBoard")}{" "}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </CardHeader>
      <CardBody className="space-y-4">
        {!hasContent ? (
          <EmptyState
            title={t("dashboard.noTasksToday")}
            description={t("dashboard.noTasksTodayDescription")}
          />
        ) : (
          <>
            {overdue.length > 0 ? (
              <section>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-danger)]">
                  {t("dashboard.overdueSection")}
                </p>
                <ul className="space-y-1">
                  {overdue.map((task) => (
                    <TaskRow key={task.id} task={task} tone="overdue" />
                  ))}
                </ul>
              </section>
            ) : null}
            {today.length > 0 ? (
              <section>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
                  {t("dashboard.todaySection")}
                </p>
                <ul className="space-y-1">
                  {today.map((task) => (
                    <TaskRow key={task.id} task={task} tone="today" />
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </CardBody>
    </Card>
  );
}
