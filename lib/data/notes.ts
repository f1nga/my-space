import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAllNotes() {
  return prisma.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getNoteById(id: string) {
  return prisma.note.findUnique({ where: { id } });
}

export async function getRecentNotes(take = 3) {
  return prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
    take,
  });
}
