import "server-only";
import { prisma } from "@/lib/prisma";

export async function getEventsInRange(start: Date, end: Date) {
  return prisma.event.findMany({
    where: {
      OR: [
        { startsAt: { gte: start, lte: end } },
        { endsAt: { gte: start, lte: end } },
        { AND: [{ startsAt: { lte: start } }, { endsAt: { gte: end } }] },
      ],
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

export async function getUpcomingEvents(from: Date, take = 5) {
  return prisma.event.findMany({
    where: { startsAt: { gte: from } },
    orderBy: { startsAt: "asc" },
    take,
  });
}
