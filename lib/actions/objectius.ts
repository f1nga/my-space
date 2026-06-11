"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncObjectiuProgress } from "@/lib/data/objectius";
import {
  objectiuCreateSchema,
  objectiuUpdateSchema,
  subObjectiuCreateSchema,
  subObjectiuToggleSchema,
} from "@/lib/types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function fail<T>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: fallback };
}

function revalidateObjectius() {
  revalidatePath("/objectius");
  revalidatePath("/");
}

export async function createObjectiu(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = objectiuCreateSchema.parse(input);
    const objectiu = await prisma.objectiu.create({
      data: {
        titol: data.titol,
        descripcio: data.descripcio ?? null,
        dataInici: data.dataInici,
        dataFinal: data.dataFinal,
        categoria: data.categoria,
        progress: data.subtasques.length > 0 ? 0 : data.progress,
        subtasques: {
          create: data.subtasques.map((s) => ({ titol: s.titol })),
        },
      },
    });

    if (data.subtasques.length > 0) {
      await syncObjectiuProgress(objectiu.id);
    }

    revalidateObjectius();
    return { ok: true, data: { id: objectiu.id } };
  } catch (error) {
    return fail(error, "No s'ha pogut crear l'objectiu");
  }
}

export async function updateObjectiu(input: unknown): Promise<ActionResult> {
  try {
    const data = objectiuUpdateSchema.parse(input);
    const { id, ...rest } = data;

    await prisma.objectiu.update({
      where: { id },
      data: {
        ...(rest.titol !== undefined && { titol: rest.titol }),
        ...(rest.descripcio !== undefined && {
          descripcio: rest.descripcio ?? null,
        }),
        ...(rest.dataInici !== undefined && { dataInici: rest.dataInici }),
        ...(rest.dataFinal !== undefined && { dataFinal: rest.dataFinal }),
        ...(rest.categoria !== undefined && { categoria: rest.categoria }),
        ...(rest.estat !== undefined && { estat: rest.estat }),
        ...(rest.progress !== undefined && { progress: rest.progress }),
      },
    });

    revalidateObjectius();
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut actualitzar l'objectiu");
  }
}

export async function deleteObjectiu(id: string): Promise<ActionResult> {
  try {
    if (!id) throw new Error("Identificador requerit");
    await prisma.objectiu.delete({ where: { id } });
    revalidateObjectius();
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut eliminar l'objectiu");
  }
}

export async function completeObjectiu(id: string): Promise<ActionResult> {
  try {
    if (!id) throw new Error("Identificador requerit");
    await prisma.objectiu.update({
      where: { id },
      data: { estat: "COMPLETAT", progress: 100 },
    });
    await prisma.subObjectiu.updateMany({
      where: { objectiuId: id },
      data: { completat: true },
    });
    revalidateObjectius();
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut completar l'objectiu");
  }
}

export async function createSubObjectiu(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = subObjectiuCreateSchema.parse(input);
    const sub = await prisma.subObjectiu.create({
      data: {
        objectiuId: data.objectiuId,
        titol: data.titol,
      },
    });
    await syncObjectiuProgress(data.objectiuId);
    revalidateObjectius();
    return { ok: true, data: { id: sub.id } };
  } catch (error) {
    return fail(error, "No s'ha pogut afegir la subtasca");
  }
}

export async function toggleSubObjectiu(
  input: unknown,
): Promise<ActionResult> {
  try {
    const data = subObjectiuToggleSchema.parse(input);
    const sub = await prisma.subObjectiu.update({
      where: { id: data.id },
      data: { completat: data.completat },
    });
    await syncObjectiuProgress(sub.objectiuId);
    revalidateObjectius();
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut actualitzar la subtasca");
  }
}

export async function updateObjectiuProgress(
  id: string,
  progress: number,
): Promise<ActionResult> {
  try {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    const estat = clamped >= 100 ? "COMPLETAT" : "EN_PROGRES";
    await prisma.objectiu.update({
      where: { id },
      data: { progress: clamped, estat },
    });
    revalidateObjectius();
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut actualitzar el progrés");
  }
}
