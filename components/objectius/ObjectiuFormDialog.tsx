"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { createObjectiu, updateObjectiu } from "@/lib/actions/objectius";
import { useI18n } from "@/lib/i18n/client";
import { CATEGORIES_OBJECTIU, type CategoriaObjectiu } from "@/lib/types";
import type { ObjectiuView } from "./types";

interface ObjectiuFormDialogProps {
  open: boolean;
  onClose: () => void;
  objectiu?: ObjectiuView | null;
}

function toDateInput(value: string | undefined, fallback: Date): string {
  const date = value ? new Date(value) : fallback;
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function ObjectiuFormDialog({
  open,
  onClose,
  objectiu,
}: ObjectiuFormDialogProps) {
  const { t } = useI18n();
  const editing = Boolean(objectiu);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const defaultEnd = new Date(today);
  defaultEnd.setMonth(defaultEnd.getMonth() + 1);

  const [titol, setTitol] = useState(objectiu?.titol ?? "");
  const [descripcio, setDescripcio] = useState(objectiu?.descripcio ?? "");
  const [dataInici, setDataInici] = useState(
    toDateInput(objectiu?.dataInici, today),
  );
  const [dataFinal, setDataFinal] = useState(
    toDateInput(objectiu?.dataFinal, defaultEnd),
  );
  const [categoria, setCategoria] = useState<CategoriaObjectiu>(
    objectiu?.categoria ?? "FISIC",
  );
  const [progress, setProgress] = useState(objectiu?.progress ?? 0);
  const [subtasques, setSubtasques] = useState<string[]>(
    objectiu?.subtasques.map((s) => s.titol) ?? [""],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      titol: titol.trim(),
      descripcio: descripcio.trim() || null,
      dataInici: new Date(dataInici),
      dataFinal: new Date(dataFinal),
      categoria,
      progress,
      subtasques: editing
        ? []
        : subtasques
            .map((s) => s.trim())
            .filter(Boolean)
            .map((titol) => ({ titol })),
    };

    if (!payload.titol) {
      setError(t("objectives.formTitleRequired"));
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateObjectiu({ id: objectiu!.id, ...payload })
        : await createObjectiu(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t("objectives.formEditTitle") : t("objectives.formNewTitle")}
      description={
        editing
          ? t("objectives.formEditDescriptionAlt")
          : t("objectives.formNewDescriptionAlt")
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="objectiu-titol"
            className="text-xs font-medium text-text-muted"
          >
            {t("objectives.formTitle")}
          </label>
          <Input
            id="objectiu-titol"
            type="text"
            value={titol}
            onChange={(e) => setTitol(e.target.value)}
            autoFocus
            required
            maxLength={200}
            placeholder={t("objectives.formTitlePlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="objectiu-descripcio"
            className="text-xs font-medium text-text-muted"
          >
            {t("objectives.formDescription")}
          </label>
          <Textarea
            id="objectiu-descripcio"
            value={descripcio}
            onChange={(e) => setDescripcio(e.target.value)}
            rows={3}
            maxLength={2000}
            className="resize-none"
            placeholder={t("objectives.formDescriptionPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="objectiu-inici"
              className="text-xs font-medium text-text-muted"
            >
              {t("objectives.formStartDate")}
            </label>
            <Input
              id="objectiu-inici"
              type="date"
              value={dataInici}
              onChange={(e) => setDataInici(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="objectiu-final"
              className="text-xs font-medium text-text-muted"
            >
              {t("objectives.formEndDate")}
            </label>
            <Input
              id="objectiu-final"
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="objectiu-categoria"
              className="text-xs font-medium text-text-muted"
            >
              {t("objectives.formCategory")}
            </label>
            <Select
              id="objectiu-categoria"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value as CategoriaObjectiu)
              }
            >
              {CATEGORIES_OBJECTIU.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`category.${cat}`)}
                </option>
              ))}
            </Select>
          </div>

          {editing && objectiu?.subtasques.length === 0 ? (
            <div className="space-y-1.5">
              <label
                htmlFor="objectiu-progress"
                className="text-xs font-medium text-text-muted"
              >
                {t("objectives.progressPercent", { percent: progress })}
              </label>
              <input
                id="objectiu-progress"
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          ) : null}
        </div>

        {!editing ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-muted">
                {t("objectives.subtasksOptional")}
              </p>
              <button
                type="button"
                onClick={() => setSubtasques((prev) => [...prev, ""])}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {t("common.add")}
              </button>
            </div>
            <div className="space-y-2">
              {subtasques.map((sub, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={sub}
                    onChange={(e) =>
                      setSubtasques((prev) =>
                        prev.map((item, i) =>
                          i === index ? e.target.value : item,
                        ),
                      )
                    }
                    maxLength={200}
                    placeholder={t("objectives.subtaskNumber", {
                      number: index + 1,
                    })}
                    className="flex-1"
                  />
                  {subtasques.length > 1 ? (
                    <button
                      type="button"
                      aria-label={t("objectives.deleteSubtask")}
                      onClick={() =>
                        setSubtasques((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="rounded-lg border border-border px-2 text-text-muted hover:bg-surface hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending
              ? t("common.saving")
              : editing
                ? t("common.saveChanges")
                : t("objectives.createObjective")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
