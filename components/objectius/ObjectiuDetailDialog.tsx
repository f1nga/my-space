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

  function handleDeleteSub(id: string, titol: string) {
    confirm({
      title: "Eliminar subtasca",
      description: `Vols eliminar la subtasca «${titol}»? Aquesta acció no es pot desfer.`,
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
      setSubError("Cal un títol per a la subtasca.");
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
      setSubError("Escriu un títol per a la subtasca.");
      return;
    }
    if (objectiu.subtasques.length >= 20) {
      setSubError("Màxim 20 subtasques per objectiu.");
      return;
    }

    startTransition(async () => {
      const result = await createSubObjectiu({
        objectiuId: objectiu.id,
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

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-text-subtle">
            Subtasques
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
                      aria-label="Editar títol de la subtasca"
                      className="min-w-0 flex-1 rounded-xl border-accent"
                    />
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleSaveEditSub(sub.id)}
                      aria-label="Desar subtasca"
                      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={cancelEditSub}
                      aria-label="Cancel·lar edició"
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
                  ? "Encara no hi ha subtasques. Si n'afegeixes, l'objectiu tornarà a estar en progrés."
                  : "Encara no hi ha subtasques. Afegeix-ne per calcular el progrés automàticament, o fes servir el control manual."}
              </p>
              {!isCompleted ? (
                <>
                  <label
                    htmlFor="detail-progress"
                    className="text-xs font-medium text-text-muted"
                  >
                    Progrés manual ({progress}%)
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
                placeholder="Nova subtasca..."
                className="min-w-0 flex-1"
              />
              <Button type="submit" size="sm" disabled={pending}>
                <Plus className="h-4 w-4" aria-hidden />
                Afegir
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
    <ConfirmDialogHost dialogProps={dialogProps} />
    </>
  );
}
