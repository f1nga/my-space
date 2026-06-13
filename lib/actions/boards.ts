"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { boardCreateSchema } from "@/lib/types";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function fail(error: unknown, fallback: string): ActionResult {
  if (error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: fallback };
}

export async function createBoard(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string; position: number }>> {
  try {
    const data = boardCreateSchema.parse(input);

    const last = await prisma.board.findFirst({
      orderBy: { position: "desc" },
    });
    const position = (last?.position ?? 0) + 1024;

    const board = await prisma.board.create({
      data: { name: data.name, position },
    });

    revalidatePath("/board");
    return { ok: true, data: { id: board.id, name: board.name, position: board.position } };
  } catch (error) {
    return fail(error, "No s'ha pogut crear el tauler");
  }
}
