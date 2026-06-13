"use client";

import { Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n/client";
import type { CategoriaObjectiu, EstatObjectiu } from "@/lib/types";
import { CATEGORIES_OBJECTIU, ESTATS_OBJECTIU } from "@/lib/types";
import { ObjectiuCard } from "./ObjectiuCard";
import { ObjectiuDetailDialog } from "./ObjectiuDetailDialog";
import { ObjectiuFormDialog } from "./ObjectiuFormDialog";
import { ObjectiusStats } from "./ObjectiusStats";
import type { ObjectiuView, ObjectiusStatsView } from "./types";

interface ObjectiusClientProps {
  initial: ObjectiuView[];
  stats: ObjectiusStatsView;
}

type FilterEstat = "TOTS" | EstatObjectiu;

export function ObjectiusClient({ initial, stats }: ObjectiusClientProps) {
  const { t } = useI18n();
  const [objectius, setObjectius] = useState(initial);
  const [trackedInitial, setTrackedInitial] = useState(initial);
  const [filterEstat, setFilterEstat] = useState<FilterEstat>("TOTS");
  const [filterCategoria, setFilterCategoria] = useState<
    CategoriaObjectiu | "TOTES"
  >("TOTES");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ObjectiuView | null>(null);

  if (trackedInitial !== initial) {
    setTrackedInitial(initial);
    setObjectius(initial);
    if (selected) {
      const updated = initial.find((o) => o.id === selected.id);
      if (updated) setSelected(updated);
    }
  }

  const filtered = useMemo(() => {
    return objectius.filter((o) => {
      if (filterEstat !== "TOTS" && o.estat !== filterEstat) return false;
      if (filterCategoria !== "TOTES" && o.categoria !== filterCategoria) {
        return false;
      }
      return true;
    });
  }, [objectius, filterEstat, filterCategoria]);

  function openCreate() {
    setSelected(null);
    setFormOpen(true);
  }

  function openEdit(objectiu: ObjectiuView) {
    setSelected(objectiu);
    setFormOpen(true);
  }

  function openDetail(objectiu: ObjectiuView) {
    setSelected(objectiu);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-8">
      <ObjectiusStats stats={stats} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["TOTS", ...ESTATS_OBJECTIU] as FilterEstat[]).map((estat) => (
            <button
              key={estat}
              type="button"
              onClick={() => setFilterEstat(estat)}
              className={
                filterEstat === estat
                  ? "rounded-full cursor-pointer bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
                  : "rounded-full cursor-pointer border border-border px-3 py-1 text-xs font-medium text-text-muted hover:bg-surface"
              }
            >
              {estat === "TOTS"
                ? t("objectiveStatus.TOTS")
                : t(`objectiveStatus.${estat}` as `objectiveStatus.${EstatObjectiu}`)}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={openCreate} className="cursor-pointer">
          <Plus className="h-4 w-4" aria-hidden />
          {t("objectives.addObjective")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCategoria("TOTES")}
          className={
            filterCategoria === "TOTES"
              ? "rounded-lg cursor-pointer bg-surface px-2.5 py-1 text-xs font-medium text-text"
              : "rounded-lg cursor-pointer px-2.5 py-1 text-xs text-text-muted hover:bg-surface"
          }
        >
          {t("common.allFeminine")}
        </button>
        {CATEGORIES_OBJECTIU.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategoria(cat)}
            className={
              filterCategoria === cat
                ? "rounded-lg cursor-pointer bg-surface px-2.5 py-1 text-xs font-medium text-text"
                : "rounded-lg cursor-pointer px-2.5 py-1 text-xs text-text-muted hover:bg-surface"
            }
          >
            {t(`category.${cat}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title={t("objectives.noObjectives")}
          description={t("objectives.noObjectivesDescription")}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden />
              {t("objectives.addObjective")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((objectiu) => (
            <ObjectiuCard
              key={objectiu.id}
              objectiu={objectiu}
              onEdit={openEdit}
              onOpen={openDetail}
            />
          ))}
        </div>
      )}

      <ObjectiuFormDialog
        key={selected?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        objectiu={selected}
      />

      <ObjectiuDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        objectiu={selected}
      />
    </div>
  );
}
