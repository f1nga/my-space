-- Crear taula Board
CREATE TABLE "Board" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Tauler per defecte
INSERT INTO "Board" ("id", "name", "position", "createdAt", "updatedAt")
VALUES ('board_general', 'General', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Migrar Task: afegir boardId i eliminar camp board (string)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "boardId" TEXT NOT NULL,
    "position" REAL NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Task" ("id", "title", "description", "status", "boardId", "position", "dueDate", "createdAt", "updatedAt")
SELECT "id", "title", "description", "status", 'board_general', "position", "dueDate", "createdAt", "updatedAt"
FROM "Task";

DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";

CREATE INDEX "Task_status_position_idx" ON "Task"("status", "position");
CREATE INDEX "Task_boardId_idx" ON "Task"("boardId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
