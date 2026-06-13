"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  taskCreateSchema,
  taskMoveSchema,
  taskUpdateSchema,
} from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: unknown, fallback: string): ActionResult {
  if (error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: fallback };
}

/**
 * Calcula una nova posicio inicial per a una columna buida o per afegir al final.
 * Estil Trello: utilitzem inserció per punt mig (`(prev + next) / 2`) per
 * permetre reordenar sense actualitzar la resta de files.
 */
async function nextPositionForStatus(status: string): Promise<number> {
  const last = await prisma.task.findFirst({
    where: { status },
    orderBy: { position: "desc" },
  });
  return (last?.position ?? 0) + 1024;
}

export async function createTask(input: unknown): Promise<ActionResult> {
  try {
    const data = taskCreateSchema.parse(input);
    const position = await nextPositionForStatus(data.status);
    await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.status,
        boardId: data.boardId,
        dueDate: data.dueDate ?? null,
        position,
      },
    });
    revalidatePath("/board");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut crear la tasca");
  }
}

export async function updateTask(input: unknown): Promise<ActionResult> {
  try {
    const data = taskUpdateSchema.parse(input);
    const { id, ...rest } = data;
    await prisma.task.update({
      where: { id },
      data: {
        ...(rest.title !== undefined && { title: rest.title }),
        ...(rest.description !== undefined && {
          description: rest.description ?? null,
        }),
        ...(rest.status !== undefined && { status: rest.status }),
        ...(rest.boardId !== undefined && { boardId: rest.boardId }),
        ...(rest.dueDate !== undefined && { dueDate: rest.dueDate ?? null }),
      },
    });
    revalidatePath("/board");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut actualitzar la tasca");
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    if (!id) throw new Error("Identificador requerit");
    await prisma.task.delete({ where: { id } });
    revalidatePath("/board");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut eliminar la tasca");
  }
}

export async function moveTask(input: unknown): Promise<ActionResult> {
  try {
    const data = taskMoveSchema.parse(input);
    await prisma.task.update({
      where: { id: data.id },
      data: { status: data.status, position: data.position },
    });
    revalidatePath("/board");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut moure la tasca");
  }
}
