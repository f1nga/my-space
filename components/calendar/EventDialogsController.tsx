"use client";

import { useCallback, useState } from "react";
import type { CalendarItem } from "@/lib/calendar";
import { EventDetailDialog } from "./EventDetailDialog";
import { EventFormDialog } from "./EventFormDialog";
import type { EventSnapshot } from "./types";

function toSnapshot(item: CalendarItem): EventSnapshot {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    allDay: item.allDay,
    color: item.color,
  };
}

interface EventDialogsControllerProps {
  children: (handlers: {
    openCreate: (defaultStart?: Date) => void;
    openDetail: (item: CalendarItem) => void;
  }) => React.ReactNode;
}

export function EventDialogsController({
  children,
}: EventDialogsControllerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultStart, setCreateDefaultStart] = useState<Date | undefined>();
  const [detailEvent, setDetailEvent] = useState<EventSnapshot | null>(null);
  const [editEvent, setEditEvent] = useState<EventSnapshot | null>(null);

  const openCreate = useCallback((defaultStart?: Date) => {
    setCreateDefaultStart(defaultStart);
    setCreateOpen(true);
  }, []);

  const openDetail = useCallback((item: CalendarItem) => {
    if (item.kind !== "event") return;
    setDetailEvent(toSnapshot(item));
  }, []);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateDefaultStart(undefined);
  }, []);

  const closeDetail = useCallback(() => setDetailEvent(null), []);

  const closeEdit = useCallback(() => setEditEvent(null), []);

  const handleEdit = useCallback((event: EventSnapshot) => {
    setDetailEvent(null);
    setEditEvent(event);
  }, []);

  return (
    <>
      {children({ openCreate, openDetail })}

      <EventFormDialog
        open={createOpen}
        onClose={closeCreate}
        defaultStart={createDefaultStart}
      />
      <EventDetailDialog
        open={Boolean(detailEvent)}
        onClose={closeDetail}
        event={detailEvent}
        onEdit={handleEdit}
      />
      <EventFormDialog
        open={Boolean(editEvent)}
        onClose={closeEdit}
        event={editEvent}
      />
    </>
  );
}
