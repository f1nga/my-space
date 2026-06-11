"use client";

import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import { useTransition } from "react";
import { togglePinNote } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";
import type { NoteSummary } from "./types";

interface NoteListItemProps {
  note: NoteSummary;
  isActive: boolean;
}

function formatRelative(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "ara mateix";
  if (minutes < 60) return `fa ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `fa ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `fa ${days} d`;
  return new Date(date).toLocaleDateString("ca-ES", {
    day: "numeric",
    month: "short",
  });
}

export function NoteListItem({ note, isActive }: NoteListItemProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Link
      href={`/notes/${note.id}`}
      className={cn(
        "group block rounded-xl border px-3 py-3 transition-colors",
        isActive
          ? "border-[var(--color-accent-ring)] bg-[var(--color-accent-soft)]"
          : "border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text)]",
          )}
        >
          {note.title || "Sense titol"}
        </p>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            startTransition(async () => {
              await togglePinNote(note.id);
            });
          }}
          disabled={pending}
          aria-label={note.pinned ? "Desfixar nota" : "Fixar nota"}
          className={cn(
            "shrink-0 rounded p-1 text-[var(--color-text-subtle)] transition-colors hover:bg-[var(--color-surface-hover)]",
            note.pinned && "text-[var(--color-accent)]",
          )}
        >
          {note.pinned ? (
            <Pin className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <PinOff className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>
      </div>
      {note.preview ? (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">
          {note.preview}
        </p>
      ) : null}
      <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--color-text-subtle)]">
        {formatRelative(note.updatedAt)}
      </p>
    </Link>
  );
}
