"use client";

import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  completeObjectiu,
  toggleSubObjectiu,
  updateObjectiuProgress,
} from "@/lib/actions/objectius";
import { CATEGORIA_STYLES, timeLabel } from "@/lib/objectius";
import {
  CATEGORIA_OBJECTIU_LABELS,
  ESTAT_OBJECTIU_LABELS,
} from "@/lib/types";
import { cn, formatDateCa } from "@/lib/utils";
import type { ObjectiuView } from "./types";

interface ObjectiuDetailDialogProps {
  open: boolean;
  onClose: () => void;
  objectiu: ObjectiuView | null;
}

export function ObjectiuDetailDialog({
  open,
  onClose,
  objectiu,
}: ObjectiuDetailDialogProps) {
  const [pending, startTransition] = useTransition();
  const [localProgress, setLocalProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!objectiu) return null;

  const styles = CATEGORIA_STYLES[objectiu.categoria];
  const isCompleted = objectiu.estat === "COMPLETAT";
  const hasSubtasques = objectiu.subtasques.length > 0;
  const progress = hasSubtasques ? objectiu.progress : localProgress || objectiu.progress;

  function handleComplete() {
    startTransition(async () => {
      const result = await completeObjectiu(objectiu!.id);
      if (result.ok) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    });
  }

  function handleToggleSub(id: string, completat: boolean) {
    startTransition(async () => {
      await toggleSubObjectiu({ id, completat: !completat });
    });
  }

  function handleProgressChange(value: number) {
    setLocalProgress(value);
    startTransition(async () => {
      await updateObjectiuProgress(objectiu!.id, value);
      if (value >= 100) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={objectiu.titol}
      description={objectiu.descripcio ?? undefined}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
              styles.badge,
            )}
          >
            {CATEGORIA_OBJECTIU_LABELS[objectiu.categoria]}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {ESTAT_OBJECTIU_LABELS[objectiu.estat]}
          </span>
          <span className="text-xs text-[var(--color-text-subtle)]">
            {timeLabel(new Date(objectiu.dataFinal), objectiu.estat)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--color-text-muted)]">
              Progrés global
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              {progress}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                styles.bar,
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-[var(--color-text-subtle)]">
          {formatDateCa(new Date(objectiu.dataInici), {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          —{" "}
          {formatDateCa(new Date(objectiu.dataFinal), {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {hasSubtasques ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              Subtasques
            </p>
            <ul className="space-y-2">
              {objectiu.subtasques.map((sub) => (
                <li key={sub.id}>
                  <button
                    type="button"
                    disabled={pending || isCompleted}
                    onClick={() => handleToggleSub(sub.id, sub.completat)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-left text-sm transition-colors",
                      sub.completat
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]",
                    )}
                  >
                    {sub.completat ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
                    )}
                    <span
                      className={cn(sub.completat && "line-through opacity-80")}
                    >
                      {sub.titol}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="detail-progress"
              className="text-xs font-medium text-[var(--color-text-muted)]"
            >
              Actualitza el progrés manualment
            </label>
            <input
              id="detail-progress"
              type="range"
              min={0}
              max={100}
              defaultValue={objectiu.progress}
              disabled={pending || isCompleted}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
          </div>
        )}

        {!isCompleted ? (
          <Button
            type="button"
            className="w-full"
            disabled={pending}
            onClick={handleComplete}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Marcar com a completat
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--color-accent)]">
            <PartyPopper className="h-4 w-4" aria-hidden />
            Objectiu assolit!
          </div>
        )}

        {showCelebration ? (
          <div
            className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
            aria-hidden
          >
            <div className="scale-110 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)] px-8 py-6 text-center shadow-[var(--shadow-pop)]">
              <PartyPopper className="mx-auto h-10 w-10 text-[var(--color-accent)]" />
              <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                Enhorabona!
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
