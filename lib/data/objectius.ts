import "server-only";
import { prisma } from "@/lib/prisma";
import { computeProgressFromSubtasques, type ObjectiuStats } from "@/lib/objectius";
import type { CategoriaObjectiu, EstatObjectiu } from "@/lib/types";
import { CATEGORIES_OBJECTIU, ESTATS_OBJECTIU } from "@/lib/types";

export async function getObjectius() {
  return prisma.objectiu.findMany({
    include: {
      subtasques: { orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ estat: "asc" }, { dataFinal: "asc" }, { createdAt: "desc" }],
  });
}

export async function getObjectiuById(id: string) {
  return prisma.objectiu.findUnique({
    where: { id },
    include: {
      subtasques: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getObjectiusStats(): Promise<ObjectiuStats> {
  const objectius = await prisma.objectiu.findMany({
    select: { estat: true, updatedAt: true },
  });

  const total = objectius.length;
  const completats = objectius.filter((o) => o.estat === "COMPLETAT").length;
  const actius = objectius.filter((o) => o.estat === "EN_PROGRES").length;
  const taxaCompletacio =
    total > 0 ? Math.round((completats / total) * 100) : 0;

  const recentCompletions = objectius
    .filter((o) => o.estat === "COMPLETAT")
    .toSorted(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    ).length;

  return {
    total,
    actius,
    completats,
    taxaCompletacio,
    ratxaMotivacio: recentCompletions,
  };
}

export function normalizeCategoria(value: string): CategoriaObjectiu {
  return (CATEGORIES_OBJECTIU as readonly string[]).includes(value)
    ? (value as CategoriaObjectiu)
    : "ALTRES";
}

export function normalizeEstat(value: string): EstatObjectiu {
  return (ESTATS_OBJECTIU as readonly string[]).includes(value)
    ? (value as EstatObjectiu)
    : "EN_PROGRES";
}

export async function syncObjectiuProgress(objectiuId: string): Promise<number> {
  const objectiu = await prisma.objectiu.findUnique({
    where: { id: objectiuId },
    include: { subtasques: true },
  });
  if (!objectiu) return 0;

  const progress =
    objectiu.subtasques.length > 0
      ? computeProgressFromSubtasques(objectiu.subtasques)
      : objectiu.progress;

  let estat = objectiu.estat;
  if (objectiu.estat !== "ABANDONAT") {
    if (objectiu.subtasques.length > 0) {
      estat = progress >= 100 ? "COMPLETAT" : "EN_PROGRES";
    } else if (progress >= 100 && estat === "EN_PROGRES") {
      estat = "COMPLETAT";
    } else if (progress < 100 && estat === "COMPLETAT") {
      estat = "EN_PROGRES";
    }
  }

  await prisma.objectiu.update({
    where: { id: objectiuId },
    data: { progress, ...(estat !== objectiu.estat && { estat }) },
  });

  return progress;
}
