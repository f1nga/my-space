import "server-only";
import { PrismaClient } from "@prisma/client";

// Singleton cachejat a globalThis per evitar fuites de connexions en hot-reload.
// Es l'unic punt d'acces al ORM: facilita migrar a Supabase/PostgreSQL nomes
// canviant el provider i la DATABASE_URL.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
