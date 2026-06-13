import "server-only";
import { prisma } from "@/lib/prisma";

export const DEFAULT_BOARD_NAME = "General";

export async function ensureDefaultBoard() {
  const existing = await prisma.board.findFirst({
    orderBy: { position: "asc" },
  });
  if (existing) return existing;

  return prisma.board.create({
    data: { name: DEFAULT_BOARD_NAME, position: 0 },
  });
}

export async function getBoards() {
  await ensureDefaultBoard();
  return prisma.board.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}
