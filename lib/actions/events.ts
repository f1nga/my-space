"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { eventCreateSchema, eventUpdateSchema } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: unknown, fallback: string): ActionResult {
  if (error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: fallback };
}

export async function createEvent(input: unknown): Promise<ActionResult> {
  try {
    const data = eventCreateSchema.parse(input);
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startsAt: data.startsAt,
        endsAt: data.endsAt ?? null,
        allDay: data.allDay,
        color: data.color ?? null,
      },
    });
    revalidatePath("/calendar");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut crear l'esdeveniment");
  }
}

export async function updateEvent(input: unknown): Promise<ActionResult> {
  try {
    const data = eventUpdateSchema.parse(input);
    const { id, ...rest } = data;
    await prisma.event.update({
      where: { id },
      data: {
        ...(rest.title !== undefined && { title: rest.title }),
        ...(rest.description !== undefined && {
          description: rest.description ?? null,
        }),
        ...(rest.startsAt !== undefined && { startsAt: rest.startsAt }),
        ...(rest.endsAt !== undefined && { endsAt: rest.endsAt ?? null }),
        ...(rest.allDay !== undefined && { allDay: rest.allDay }),
        ...(rest.color !== undefined && { color: rest.color ?? null }),
      },
    });
    revalidatePath("/calendar");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut actualitzar l'esdeveniment");
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    if (!id) throw new Error("Identificador requerit");
    await prisma.event.delete({ where: { id } });
    revalidatePath("/calendar");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(error, "No s'ha pogut eliminar l'esdeveniment");
  }
}
