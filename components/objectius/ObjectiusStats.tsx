import { Card } from "@/components/ui/Card";
import { Flame, Target, Trophy } from "lucide-react";
import { motivationMessage } from "@/lib/objectius";
import type { ObjectiusStatsView } from "./types";

interface ObjectiusStatsProps {
  stats: ObjectiusStatsView;
}

function ProgressRing({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <svg
        className="-rotate-90"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        aria-hidden
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-[var(--color-text)]">
        {value}%
      </span>
    </div>
  );
}

export function ObjectiusStats({ stats }: ObjectiusStatsProps) {
  const message = motivationMessage(stats.taxaCompletacio, stats.actius);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="cursor-default overflow-hidden">
        <div className="relative p-5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Target className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-subtle)]">
                Objectius actius
              </p>
              <p className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {stats.actius}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {stats.total} en total
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="cursor-default">
        <div className="flex items-center gap-4 p-5">
          <ProgressRing value={stats.taxaCompletacio} />
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-subtle)]">
              Taxa de completació
            </p>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              {stats.completats} completats
            </p>
          </div>
        </div>
      </Card>

      <Card className="cursor-default overflow-hidden">
        <div className="relative p-5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
              <Flame className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-subtle)]">
                Motivació
              </p>
              <p className="flex items-center gap-1.5 text-lg font-semibold text-[var(--color-text)]">
                <Trophy className="h-4 w-4 text-[var(--color-warning)]" aria-hidden />
                {stats.ratxaMotivacio} fites
              </p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">
                {message}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
