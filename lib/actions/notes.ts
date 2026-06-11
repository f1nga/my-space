"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { noteCreateSchema, noteUpdateSchema } from "@/lib/types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function fail<T>(error: unknown, fallback: string): ActionResult<T> {
  if (error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: fallback };
}

export async function createNote(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = noteCreateSchema.parse(input);
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        pinned: data.pinned,
      },
    });
    revalidatePath("/notes");
    revalidatePath("/");
    return { ok: true, data: { id: note.id } };
  } catch (error) {
    return fail(error, "No s'ha pogut crear la nota");
  }
}

export async function updateNote(input: unknown): Promise<ActionResult> {
  try {
    const data = noteUpdateSchema.parse(input);
    const { id, ...rest } = data;
    await prisma.note.update({
      where: { id },
      data: {
        ...(rest.title !== undefined && { title: rest.title }),
        ...(rest.content !== undefined && { content: rest.content }),
        ...(rest.pinned !== undefined && { pinned: rest.pinned }),
      },
    });
    revalidatePath("/notes");
    revalidatePath(`/notes/${id}`);
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut actualitzar la nota");
  }
}

export async function deleteNote(id: string): Promise<ActionResult> {
  try {
    if (!id) throw new Error("Identificador requerit");
    await prisma.note.delete({ where: { id } });
    revalidatePath("/notes");
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut eliminar la nota");
  }
}

export async function togglePinNote(id: string): Promise<ActionResult> {
  try {
    const current = await prisma.note.findUnique({ where: { id } });
    if (!current) throw new Error("Nota no trobada");
    await prisma.note.update({
      where: { id },
      data: { pinned: !current.pinned },
    });
    revalidatePath("/notes");
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(error, "No s'ha pogut canviar l'estat de fixat");
  }
}
