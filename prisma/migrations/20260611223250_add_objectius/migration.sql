-- CreateTable
CREATE TABLE "Objectiu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT,
    "dataInici" DATETIME NOT NULL,
    "dataFinal" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "estat" TEXT NOT NULL DEFAULT 'EN_PROGRES',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SubObjectiu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titol" TEXT NOT NULL,
    "completat" BOOLEAN NOT NULL DEFAULT false,
    "objectiuId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubObjectiu_objectiuId_fkey" FOREIGN KEY ("objectiuId") REFERENCES "Objectiu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Objectiu_estat_idx" ON "Objectiu"("estat");

-- CreateIndex
CREATE INDEX "Objectiu_categoria_idx" ON "Objectiu"("categoria");

-- CreateIndex
CREATE INDEX "SubObjectiu_objectiuId_idx" ON "SubObjectiu"("objectiuId");
