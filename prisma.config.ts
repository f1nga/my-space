import { defineConfig } from "prisma/config";

export default defineConfig({
  engine: "classic",
  datasource: {
  // Relative to prisma/schema.prisma → prisma/dev.db (same as .env `file:./dev.db`)
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});