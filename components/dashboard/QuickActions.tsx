"use client";

import { useState } from "react";
import { CalendarPlus, FilePlus, ListPlus } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TaskFormDialog } from "@/components/board/TaskFormDialog";
import { EventDialog } from "@/components/calendar/EventDialog";
import { createNote } from "@/lib/actions/notes";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();
  const [taskOpen, setTaskOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  async function handleNewNote() {
    const result = await createNote({
      title: "Nota sense titol",
      content: "",
      pinned: false,
    });
    if (result.ok) router.push(`/notes/${result.data.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessos ràpids</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => setTaskOpen(true)}>
          <ListPlus className="h-4 w-4" aria-hidden /> Nova tasca
        </Button>
        <Button variant="secondary" onClick={() => setEventOpen(true)}>
          <CalendarPlus className="h-4 w-4" aria-hidden /> Nou esdeveniment
        </Button>
        <Button variant="secondary" onClick={handleNewNote}>
          <FilePlus className="h-4 w-4" aria-hidden /> Nova nota
        </Button>
      </CardBody>

      <TaskFormDialog open={taskOpen} onClose={() => setTaskOpen(false)} />
      <EventDialog open={eventOpen} onClose={() => setEventOpen(false)} />
    </Card>
  );
}
