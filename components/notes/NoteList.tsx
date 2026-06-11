"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { createNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/Button";
import { NoteListItem } from "./NoteListItem";
import type { NoteSummary } from "./types";

interface NoteListProps {
  notes: NoteSummary[];
}

export function NoteList({ notes }: NoteListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeId = pathname?.match(/^\/notes\/([^/]+)/)?.[1] ?? null;
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.preview.toLowerCase().includes(q),
    );
  }, [notes, query]);

  function handleCreate() {
    startTransition(async () => {
      const result = await createNote({
        title: "Nota sense titol",
        content: "",
        pinned: false,
      });
      if (result.ok) {
        router.push(`/notes/${result.data.id}`);
      }
    });
  }

  return (
    <div className="flex h-full flex-col gap-3 border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-subtle)]"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cercar"
            aria-label="Cercar notes"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-8 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={pending}
          aria-label="Nova nota"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-[var(--color-text-subtle)]">
            Cap nota coincideix.
          </p>
        ) : (
          filtered.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={note.id === activeId}
            />
          ))
        )}
      </div>
    </div>
  );
}
