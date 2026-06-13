"use client";

import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { deleteObjectiu } from "@/lib/actions/objectius";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/components/ui/useConfirmDialog";
import {
  CATEGORIA_STYLES,
  timeLabel,
  timelineProgress,
} from "@/lib/objectius";
import {
  CATEGORIA_OBJECTIU_LABELS,
  ESTAT_OBJECTIU_LABELS,
} from "@/lib/types";
import { cn, formatDateCa } from "@/lib/utils";
import type { ObjectiuView } from "./types";

interface ObjectiuCardProps {
  objectiu: ObjectiuView;
  onEdit: (objectiu: ObjectiuView) => void;
  onOpen: (objectiu: ObjectiuView) => void;
}

export function ObjectiuCard({ objectiu, onEdit, onOpen }: ObjectiuCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();
  const styles = CATEGORIA_STYLES[objectiu.categoria];
  const timeProgress = timelineProgress(
    new Date(objectiu.dataInici),
    new Date(objectiu.dataFinal),
  );
  const subtasquesDone = objectiu.subtasques.filter((s) => s.completat).length;
  const isCompleted = objectiu.estat === "COMPLETAT";

  function handleCardActivate() {
    onOpen(objectiu);
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardActivate();
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardActivate}
      onKeyDown={handleCardKeyDown}
      aria-label={`Obrir detall: ${objectiu.titol}`}
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        isCompleted && "opacity-90",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
          styles.glow,
        )}
      />

      <div className="relative space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                styles.badge,
              )}
            >
              {CATEGORIA_OBJECTIU_LABELS[objectiu.categoria]}
            </span>
            <h3 className="text-base font-semibold tracking-tight text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
              {objectiu.titol}
            </h3>
            {objectiu.descripcio ? (
              <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">
                {objectiu.descripcio}
              </p>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Opcions de l'objectiu"
              aria-expanded={menuOpen}
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="cursor-pointer rounded-lg p-1.5 text-[var(--color-text-muted)] opacity-0 transition-opacity hover:bg-[var(--color-surface)] group-hover:opacity-100 focus-visible:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
            {menuOpen ? (
              <div
                className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-[var(--shadow-pop)]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(objectiu);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Editar
                </button>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                  onClick={() => {
                    setMenuOpen(false);
                    confirm({
                      title: "Eliminar objectiu",
                      description:
                        "Vols eliminar aquest objectiu? Aquesta acció no es pot desfer.",
                      onConfirm: () => deleteObjectiu(objectiu.id),
                    });
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Eliminar
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--color-text-muted)]">
              Progrés
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              {objectiu.progress}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                styles.bar,
                isCompleted && "animate-pulse",
              )}
              style={{ width: `${objectiu.progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-subtle)]">
            <span>Temps transcorregut</span>
            <span>{timeProgress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[var(--color-border)]/60">
            <div
              className="h-full rounded-full bg-[var(--color-border-strong)] transition-all duration-500"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)]/60 pt-3 text-xs">
          <span className="text-[var(--color-text-muted)]">
            {timeLabel(new Date(objectiu.dataFinal), objectiu.estat)}
          </span>
          <span className="text-[var(--color-text-subtle)]">
            {ESTAT_OBJECTIU_LABELS[objectiu.estat]}
          </span>
        </div>

        {objectiu.subtasques.length > 0 ? (
          <p className="text-xs text-[var(--color-text-subtle)]">
            {subtasquesDone} de {objectiu.subtasques.length} subtasques
          </p>
        ) : null}

        {isCompleted ? (
          <div className="flex gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent)]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Fet!
            </span>
          </div>
        ) : null}

        <p className="text-[10px] text-[var(--color-text-subtle)]">
          {formatDateCa(new Date(objectiu.dataInici), {
            day: "numeric",
            month: "short",
          })}{" "}
          —{" "}
          {formatDateCa(new Date(objectiu.dataFinal), {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <ConfirmDialogHost dialogProps={dialogProps} />
    </Card>
  );
}
