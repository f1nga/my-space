"use client";

import {
  Check,
  CheckCircle2,
  Circle,
  PartyPopper,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Field";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/components/ui/useConfirmDialog";
import {
  completeObjectiu,
  createSubObjectiu,
  deleteSubObjectiu,
  toggleSubObjectiu,
  updateObjectiuProgress,
  updateSubObjectiu,
} from "@/lib/actions/objectius";
import { CATEGORIA_STYLES } from "@/lib/objectius";
import { useI18n } from "@/lib/i18n/client";
import { getTimeLabel } from "@/lib/i18n/helpers";
import { cn } from "@/lib/utils";
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
  const { t, intlLocale } = useI18n();
  const [pending, startTransition] = useTransition();
  const [localProgress, setLocalProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newSubtasca, setNewSubtasca] = useState("");
  const [subError, setSubError] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { confirm, dialogProps } = useConfirmDialog();

  useEffect(() => {
    if (!open) {
      setNewSubtasca("");
      setSubError(null);
      setEditingSubId(null);
      setEditTitle("");
    }
  }, [open]);

  if (!objectiu) return null;

  const currentObjectiu = objectiu;
  const styles = CATEGORIA_STYLES[currentObjectiu.categoria];
  const isCompleted = currentObjectiu.estat === "COMPLETAT";
  const hasSubtasques = currentObjectiu.subtasques.length > 0;
  const progress = hasSubtasques
    ? currentObjectiu.progress
    : localProgress || currentObjectiu.progress;

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

  function handleDeleteSub(id: string, titol: string) {
    confirm({
      title: t("confirm.deleteSubtaskTitle"),
      description: t("confirm.deleteSubtaskDescription"),
      onConfirm: async () => {
        setSubError(null);
        if (editingSubId === id) {
          setEditingSubId(null);
          setEditTitle("");
        }
        const result = await deleteSubObjectiu({ id });
        if (!result.ok) setSubError(result.error);
      },
    });
  }

  function startEditSub(id: string, titol: string) {
    setEditingSubId(id);
    setEditTitle(titol);
    setSubError(null);
  }

  function cancelEditSub() {
    setEditingSubId(null);
    setEditTitle("");
  }

  function handleSaveEditSub(id: string) {
    const titol = editTitle.trim();
    if (!titol) {
      setSubError(t("objectives.subtaskTitleRequired"));
      return;
    }
    setSubError(null);
    startTransition(async () => {
      const result = await updateSubObjectiu({ id, titol });
      if (!result.ok) {
        setSubError(result.error);
        return;
      }
      cancelEditSub();
    });
  }

  function handleAddSubtasca(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubError(null);

    const titol = newSubtasca.trim();
    if (!titol) {
      setSubError(t("objectives.subtaskWriteTitle"));
      return;
    }
    if (currentObjectiu.subtasques.length >= 20) {
      setSubError(t("objectives.subtaskMax"));
      return;
    }

    startTransition(async () => {
      const result = await createSubObjectiu({
        objectiuId: currentObjectiu.id,
        titol,
      });
      if (!result.ok) {
        setSubError(result.error);
        return;
      }
      setNewSubtasca("");
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
    <>
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
            {t(`category.${objectiu.categoria}`)}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {t(`objectiveStatus.${objectiu.estat}`)}
          </span>
          <span className="text-xs text-[var(--color-text-subtle)]">
            {getTimeLabel(t, new Date(objectiu.dataFinal), objectiu.estat)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--color-text-muted)]">
              {t("objectives.progress")}
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
          {new Date(objectiu.dataInici).toLocaleDateString(intlLocale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          —{" "}
          {new Date(objectiu.dataFinal).toLocaleDateString(intlLocale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-text-subtle">
            {t("objectives.subtasks")}
          </p>

          {hasSubtasques ? (
            <ul className="space-y-2">
              {objectiu.subtasques.map((sub) =>
                editingSubId === sub.id ? (
                  <li key={sub.id} className="flex gap-2">
                    <Input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveEditSub(sub.id);
                        }
                        if (e.key === "Escape") cancelEditSub();
                      }}
                      disabled={pending}
                      maxLength={200}
                      autoFocus
                      aria-label={t("objectives.editSubtaskTitle")}
                      className="min-w-0 flex-1 rounded-xl border-accent"
                    />
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleSaveEditSub(sub.id)}
                      aria-label={t("objectives.saveSubtask")}
                      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={cancelEditSub}
                      aria-label={t("objectives.cancelEdit")}
                      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ) : (
                  <li key={sub.id} className="flex gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      aria-pressed={sub.completat}
                      onClick={() => handleToggleSub(sub.id, sub.completat)}
                      className={cn(
                        "flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left text-sm transition-colors",
                        sub.completat
                          ? "bg-accent-soft text-accent"
                          : "bg-surface text-text hover:border-border-strong",
                      )}
                    >
                      {sub.completat ? (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          aria-hidden
                        />
                      ) : (
                        <Circle
                          className="h-4 w-4 shrink-0 text-text-muted"
                          aria-hidden
                        />
                      )}
                      <span
                        className={cn(
                          "truncate",
                          sub.completat && "line-through opacity-80",
                        )}
                      >
                        {sub.titol}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => startEditSub(sub.id, sub.titol)}
                      aria-label={`Editar subtasca: ${sub.titol}`}
                      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDeleteSub(sub.id, sub.titol)}
                      aria-label={`Eliminar subtasca: ${sub.titol}`}
                      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border text-text-muted transition-colors hover:border-danger/40 hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <div className="space-y-2 rounded-xl border border-dashed border-border bg-surface/50 px-3 py-3">
              <p className="text-xs text-text-muted">
                {isCompleted
                  ? t("objectives.noSubtasksCompleted")
                  : t("objectives.noSubtasks")}
              </p>
              {!isCompleted ? (
                <>
                  <label
                    htmlFor="detail-progress"
                    className="text-xs font-medium text-text-muted"
                  >
                    {t("objectives.manualProgress")} ({progress}%)
                  </label>
                  <input
                    id="detail-progress"
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={objectiu.progress}
                    disabled={pending}
                    onChange={(e) =>
                      handleProgressChange(Number(e.target.value))
                    }
                    className="w-full accent-accent"
                  />
                </>
              ) : null}
            </div>
          )}

          {isCompleted && hasSubtasques ? (
            <p className="text-xs text-text-muted">
              Pots afegir més subtasques; l&apos;objectiu deixarà d&apos;estar
              assolit fins que les completis totes.
            </p>
          ) : null}

          {objectiu.subtasques.length < 20 ? (
            <form onSubmit={handleAddSubtasca} className="flex gap-2">
              <Input
                type="text"
                value={newSubtasca}
                onChange={(e) => setNewSubtasca(e.target.value)}
                maxLength={200}
                disabled={pending}
                placeholder={t("objectives.newSubtaskPlaceholder")}
                className="min-w-0 flex-1"
              />
              <Button type="submit" size="sm" disabled={pending}>
                <Plus className="h-4 w-4" aria-hidden />
                {t("common.add")}
              </Button>
            </form>
          ) : null}

          {subError ? (
            <p className="text-sm text-danger" role="alert">
              {subError}
            </p>
          ) : null}
        </div>

        {!isCompleted ? (
          <Button
            type="button"
            className="w-full"
            disabled={pending}
            onClick={handleComplete}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {t("objectives.markCompleted")}
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--color-accent)]">
            <PartyPopper className="h-4 w-4" aria-hidden />
            {t("objectives.goalAchieved")}
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
                {t("objectives.congratulations")}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
    <ConfirmDialogHost dialogProps={dialogProps} />
    </>
  );
}
