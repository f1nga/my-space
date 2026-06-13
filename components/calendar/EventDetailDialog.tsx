"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { Locale as DateFnsLocale } from "date-fns";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { deleteEvent } from "@/lib/actions/events";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/components/ui/useConfirmDialog";
import { useI18n } from "@/lib/i18n/client";
import { cn, formatTime } from "@/lib/utils";
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

function formatEventRange(
  event: EventSnapshot,
  dateFnsLocale: DateFnsLocale,
  intlLocale: string,
): string {
  if (event.allDay) {
    const start = format(event.startsAt, "EEEE d MMMM yyyy", {
      locale: dateFnsLocale,
    });
    if (
      event.endsAt &&
      event.startsAt.toDateString() !== event.endsAt.toDateString()
    ) {
      const end = format(event.endsAt, "EEEE d MMMM yyyy", {
        locale: dateFnsLocale,
      });
      return `${start} – ${end}`;
    }
    return start;
  }

  const datePart = format(event.startsAt, "EEEE d MMMM yyyy", {
    locale: dateFnsLocale,
  });
  const startTime = formatTime(event.startsAt, intlLocale);
  if (event.endsAt) {
    const endTime = formatTime(event.endsAt, intlLocale);
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
  const { t, dateFnsLocale, intlLocale } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialogProps } = useConfirmDialog();

  if (!event) return null;

  const color = normalizeColor(event.color);

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleDeleteRequest() {
    confirm({
      title: t("confirm.deleteEventTitle"),
      description: t("confirm.deleteEventDescription"),
      onConfirm: async () => {
        const result = await deleteEvent(event!.id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        handleClose();
      },
    });
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        title={event.title}
        description={t("calendar.eventDetails")}
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
              {formatEventRange(event, dateFnsLocale, intlLocale)}
            </p>
          </div>

          {event.description ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-text-subtle">
                {t("common.description")}
              </p>
              <p className="whitespace-pre-wrap text-sm text-text">
                {event.description}
              </p>
            </div>
          ) : (
            <p className="text-sm italic text-text-subtle">
              {t("common.noDescription")}
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

          <footer className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteRequest}
            >
              {t("common.delete")}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                {t("common.close")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onEdit(event)}
              >
                {t("common.edit")}
              </Button>
            </div>
          </footer>
        </div>
      </Dialog>
      <ConfirmDialogHost dialogProps={dialogProps} />
    </>
  );
}
