-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "board" TEXT NOT NULL DEFAULT 'general',
    "position" REAL NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Task" ("createdAt", "description", "dueDate", "id", "position", "status", "title", "updatedAt") SELECT "createdAt", "description", "dueDate", "id", "position", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_status_position_idx" ON "Task"("status", "position");
CREATE INDEX "Task_board_idx" ON "Task"("board");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
