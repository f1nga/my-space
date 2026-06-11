"use client";

import { Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoriaObjectiu, EstatObjectiu } from "@/lib/types";
import {
  CATEGORIA_OBJECTIU_LABELS,
  ESTAT_OBJECTIU_LABELS,
  ESTATS_OBJECTIU,
} from "@/lib/types";
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
                  ? "rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
                  : "rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
              }
            >
              {estat === "TOTS"
                ? "Tots"
                : ESTAT_OBJECTIU_LABELS[estat as EstatObjectiu]}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          Afegir objectiu
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCategoria("TOTES")}
          className={
            filterCategoria === "TOTES"
              ? "rounded-lg bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)]"
              : "rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
          }
        >
          Totes
        </button>
        {(Object.keys(CATEGORIA_OBJECTIU_LABELS) as CategoriaObjectiu[]).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategoria(cat)}
              className={
                filterCategoria === cat
                  ? "rounded-lg bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)]"
                  : "rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
              }
            >
              {CATEGORIA_OBJECTIU_LABELS[cat]}
            </button>
          ),
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Cap objectiu encara"
          description="Crea la teva primera fita personal i comença a fer seguiment del progrés."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden />
              Afegir objectiu
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
