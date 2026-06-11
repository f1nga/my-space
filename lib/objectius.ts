import type { CategoriaObjectiu, EstatObjectiu } from "@/lib/types";

export type ObjectiuStats = {
  total: number;
  actius: number;
  completats: number;
  taxaCompletacio: number;
  ratxaMotivacio: number;
};

export function computeProgressFromSubtasques(
  subtasques: { completat: boolean }[],
): number {
  if (subtasques.length === 0) return 0;
  const done = subtasques.filter((s) => s.completat).length;
  return Math.round((done / subtasques.length) * 100);
}

export function daysRemaining(dataFinal: Date, now = new Date()): number {
  const end = new Date(dataFinal);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function timeLabel(dataFinal: Date, estat: EstatObjectiu): string {
  if (estat === "COMPLETAT") return "Completat";
  if (estat === "ABANDONAT") return "Abandonat";
  const days = daysRemaining(dataFinal);
  if (days < 0) return `Vençut fa ${Math.abs(days)} dies`;
  if (days === 0) return "Finalitza avui";
  if (days === 1) return "Falta 1 dia";
  return `Falten ${days} dies`;
}

export function timelineProgress(
  dataInici: Date,
  dataFinal: Date,
  now = new Date(),
): number {
  const start = dataInici.getTime();
  const end = dataFinal.getTime();
  if (end <= start) return 100;
  const elapsed = now.getTime() - start;
  const total = end - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function motivationMessage(taxaCompletacio: number, actius: number): string {
  if (actius === 0) return "Defineix el teu proper repte.";
  if (taxaCompletacio >= 80) return "Ritme imparable. Continua així!";
  if (taxaCompletacio >= 50) return "Vas per bon camí. Mantén el focus.";
  if (taxaCompletacio >= 25) return "Cada pas compta. No et aturis ara.";
  return "El viatge comença amb el primer pas.";
}

export const CATEGORIA_STYLES: Record<
  CategoriaObjectiu,
  {
    badge: string;
    bar: string;
    glow: string;
    ring: string;
  }
> = {
  FISIC: {
    badge: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    bar: "bg-[var(--color-accent)]",
    glow: "from-[var(--color-accent)]/20 to-transparent",
    ring: "ring-[var(--color-accent)]/30",
  },
  MENTAL: {
    badge: "bg-violet-500/15 text-violet-400",
    bar: "bg-violet-400",
    glow: "from-violet-500/20 to-transparent",
    ring: "ring-violet-400/30",
  },
  DINERS: {
    badge: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    bar: "bg-[var(--color-warning)]",
    glow: "from-amber-500/20 to-transparent",
    ring: "ring-amber-400/30",
  },
  TREBALL: {
    badge: "bg-sky-500/15 text-sky-400",
    bar: "bg-sky-400",
    glow: "from-sky-500/20 to-transparent",
    ring: "ring-sky-400/30",
  },
  ALTRES: {
    badge: "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
    bar: "bg-[var(--color-text-muted)]",
    glow: "from-zinc-500/15 to-transparent",
    ring: "ring-[var(--color-border-strong)]",
  },
};
