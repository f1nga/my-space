import Link from "next/link";
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
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

export function StatsCards({ counts, notes, upcomingEvents }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat
        href="/board"
        label="Per fer"
        value={counts.todo}
        helper="Tasques pendents"
        icon={Loader2}
        tone="muted"
      />
      <Stat
        href="/board"
        label="En proces"
        value={counts.doing}
        helper="Tasques actives"
        icon={Loader2}
        tone="warning"
      />
      <Stat
        href="/board"
        label="Fet"
        value={counts.done}
        helper="Tasques completades"
        icon={CheckCircle2}
        tone="accent"
      />
    </div>
  );
}
