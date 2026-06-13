"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/client";
import type { TaskStatus } from "@/lib/types";

interface StatsCardsProps {
  counts: Record<TaskStatus, number>;
  notes: number;
  upcomingEvents: number;
}

interface StatProps {
  href: string;
  label: string;
  value: number;
  helper: string;
  icon: typeof CheckCircle2;
  tone: "accent" | "warning" | "muted" | "violet";
}

const toneStyles: Record<StatProps["tone"], string> = {
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  muted: "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
  violet: "bg-[rgba(167,139,250,0.12)] text-violet-300",
};

function Stat({ href, label, value, helper, icon: Icon, tone }: StatProps) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-[var(--color-border-strong)]">
        <div className="flex items-center gap-4 p-5">
          <span
            className={`grid h-11 w-11 place-items-center rounded-xl ${toneStyles[tone]}`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-subtle)]">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {value}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">{helper}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function StatsCards({ counts }: StatsCardsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat
        href="/board"
        label={t("taskStatus.todo")}
        value={counts.todo}
        helper={t("dashboard.pendingTasks")}
        icon={Loader2}
        tone="muted"
      />
      <Stat
        href="/board"
        label={t("taskStatus.doing")}
        value={counts.doing}
        helper={t("dashboard.activeTasks")}
        icon={Loader2}
        tone="warning"
      />
      <Stat
        href="/board"
        label={t("taskStatus.done")}
        value={counts.done}
        helper={t("dashboard.completedTasks")}
        icon={CheckCircle2}
        tone="accent"
      />
    </div>
  );
}
