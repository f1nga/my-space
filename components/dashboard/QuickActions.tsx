"use client";

import { useState } from "react";
import { CalendarPlus, FilePlus, ListPlus } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TaskFormDialog } from "@/components/board/TaskFormDialog";
import { EventFormDialog } from "@/components/calendar/EventFormDialog";
import type { BoardView } from "@/components/board/types";
import { createNote } from "@/lib/actions/notes";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

interface QuickActionsProps {
  boards: BoardView[];
}

export function QuickActions({ boards }: QuickActionsProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [taskOpen, setTaskOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  async function handleNewNote() {
    const result = await createNote({
      title: t("dashboard.defaultNoteTitle"),
      content: "",
      pinned: false,
    });
    if (result.ok) router.push(`/notes/${result.data.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.quickActions")}</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => setTaskOpen(true)}>
          <ListPlus className="h-4 w-4" aria-hidden /> {t("dashboard.newTask")}
        </Button>
        <Button variant="secondary" onClick={() => setEventOpen(true)}>
          <CalendarPlus className="h-4 w-4" aria-hidden />{" "}
          {t("dashboard.newEvent")}
        </Button>
        <Button variant="secondary" onClick={handleNewNote}>
          <FilePlus className="h-4 w-4" aria-hidden /> {t("dashboard.newNote")}
        </Button>
      </CardBody>

      <TaskFormDialog
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        boards={boards}
      />
      <EventFormDialog open={eventOpen} onClose={() => setEventOpen(false)} />
    </Card>
  );
}
