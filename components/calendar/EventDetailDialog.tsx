"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { deleteEvent } from "@/lib/actions/events";
import { cn, formatTimeCa } from "@/lib/utils";
import { EVENT_COLORS, type EventColor } from "@/lib/types";
import { EVENT_COLOR_CLASSES } from "./eventColors";
import type { EventSnapshot } from "./types";

interface EventDetailDialogProps {
  open: boolean;
  onClose: () => void;
  event: EventSnapshot | null;
  onEdit: (event: EventSnapshot) => void;
}

function normalizeColor(value: string | null): EventColor {
  if (value && (EVENT_COLORS as readonly string[]).includes(value)) {
    return value as EventColor;
  }
  return "emerald";
}

function formatEventRange(event: EventSnapshot): string {
  if (event.allDay) {
    const start = format(event.startsAt, "EEEE d MMMM yyyy", { locale: ca });
    if (
      event.endsAt &&
      event.startsAt.toDateString() !== event.endsAt.toDateString()
    ) {
      const end = format(event.endsAt, "EEEE d MMMM yyyy", { locale: ca });
      return `${start} – ${end}`;
    }
    return start;
  }

  const datePart = format(event.startsAt, "EEEE d MMMM yyyy", { locale: ca });
  const startTime = formatTimeCa(event.startsAt);
  if (event.endsAt) {
    const endTime = formatTimeCa(event.endsAt);
    return `${datePart}, ${startTime} – ${endTime}`;
  }
  return `${datePart}, ${startTime}`;
}

export function EventDetailDialog({
  open,
  onClose,
  event,
  onEdit,
}: EventDetailDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmDelete) {
      confirmRef.current?.focus();
    }
  }, [confirmDelete]);

  if (!event) return null;

  const color = normalizeColor(event.color);

  function handleClose() {
    setConfirmDelete(false);
    setError(null);
    onClose();
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteEvent(event!.id);
      if (!result.ok) {
        setError(result.error);
        setConfirmDelete(false);
        return;
      }
      handleClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={event.title}
      description="Detalls de l'esdeveniment"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-3 w-3 shrink-0 rounded-full",
              EVENT_COLOR_CLASSES[color],
            )}
            aria-hidden
          />
          <p className="text-sm text-text-muted">
            {formatEventRange(event)}
          </p>
        </div>

        {event.description ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-text-subtle">
              Descripcio
            </p>
            <p className="whitespace-pre-wrap text-sm text-text">
              {event.description}
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-text-subtle">
            Sense descripcio
          </p>
        )}

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        {confirmDelete ? (
          <p className="text-sm text-text-muted">
            Confirma eliminacio? Aquesta accio no es pot desfer.
          </p>
        ) : null}

        <footer className="flex items-center justify-between gap-2 pt-2">
          <Button
            ref={confirmRef}
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending
              ? "Eliminant…"
              : confirmDelete
                ? "Eliminar definitivament"
                : "Eliminar"}
          </Button>
          <div className="flex gap-2">
            {confirmDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
              >
                Cancel·lar
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={pending}
              >
                Tancar
              </Button>
            )}
            {!confirmDelete ? (
              <Button
                type="button"
                size="sm"
                onClick={() => onEdit(event)}
                disabled={pending}
              >
                Editar
              </Button>
            ) : null}
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
