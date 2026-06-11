"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { createEvent, updateEvent } from "@/lib/actions/events";
import { EVENT_COLORS, type EventColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { COLOR_LABELS, EVENT_COLOR_CLASSES } from "./eventColors";
import type { EventSnapshot } from "./types";

interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  event?: EventSnapshot | null;
  defaultStart?: Date;
}

function toLocalInput(date: Date | null, allDay = false): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60000;
  const iso = new Date(date.getTime() - offset).toISOString();
  return allDay ? iso.slice(0, 10) : iso.slice(0, 16);
}

function normalizeColor(value: string | null): EventColor {
  if (value && (EVENT_COLORS as readonly string[]).includes(value)) {
    return value as EventColor;
  }
  return "emerald";
}

function EventFormContent({
  event,
  defaultStart,
  onClose,
}: {
  event?: EventSnapshot | null;
  defaultStart?: Date;
  onClose: () => void;
}) {
  const editing = Boolean(event);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startsAt, setStartsAt] = useState(
    toLocalInput(event?.startsAt ?? defaultStart ?? new Date(), event?.allDay),
  );
  const [endsAt, setEndsAt] = useState(
    toLocalInput(event?.endsAt ?? null, event?.allDay),
  );
  const [color, setColor] = useState<EventColor>(
    normalizeColor(event?.color ?? null),
  );

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Cal un titol per a l'esdeveniment.");
      return;
    }
    if (!startsAt) {
      setError("Cal una data d'inici.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      allDay,
      color,
    };

    startTransition(async () => {
      const result = editing
        ? await updateEvent({ id: event!.id, ...payload })
        : await createEvent(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="event-title"
          className="text-xs font-medium text-[var(--color-text-muted)]"
        >
          Titol
        </label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
          maxLength={200}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="event-description"
          className="text-xs font-medium text-[var(--color-text-muted)]"
        >
          Descripcio
        </label>
        <textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Opcional"
          className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)] focus:ring-[var(--color-accent-ring)]"
        />
        Tot el dia
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="event-start"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            Inici
          </label>
          <input
            id="event-start"
            type={allDay ? "date" : "datetime-local"}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="event-end"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            Final (opcional)
          </label>
          <input
            id="event-end"
            type={allDay ? "date" : "datetime-local"}
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-[var(--color-text-muted)]">
          Color
        </legend>
        <div className="flex flex-wrap gap-2">
          {EVENT_COLORS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setColor(value)}
              aria-pressed={color === value}
              aria-label={COLOR_LABELS[value]}
              className={cn(
                "h-7 w-7 rounded-full border transition-transform",
                EVENT_COLOR_CLASSES[value],
                color === value
                  ? "border-white ring-2 ring-[var(--color-accent-ring)]"
                  : "border-transparent hover:scale-105",
              )}
            />
          ))}
        </div>
      </fieldset>

      {error ? (
        <p
          role="alert"
          className="rounded-md bg-[rgba(244,63,94,0.1)] px-3 py-2 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}

      <footer className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={pending}
        >
          Cancel·lar
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Desant…" : editing ? "Desar canvis" : "Crear"}
        </Button>
      </footer>
    </form>
  );
}

export function EventFormDialog({
  open,
  onClose,
  event,
  defaultStart,
}: EventFormDialogProps) {
  const editing = Boolean(event);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Editar esdeveniment" : "Nou esdeveniment"}
      description={
        editing
          ? "Modifica els camps i desa els canvis."
          : "Afegeix-lo al calendari."
      }
    >
      <EventFormContent
        key={event?.id ?? `create-${defaultStart?.toISOString() ?? "new"}`}
        event={event}
        defaultStart={defaultStart}
        onClose={onClose}
      />
    </Dialog>
  );
}
