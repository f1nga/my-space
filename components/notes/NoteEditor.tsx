"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/components/ui/useConfirmDialog";
import { deleteNote, updateNote } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";
import type { NoteDetail } from "./types";

interface NoteEditorProps {
  note: NoteDetail;
}

type SaveFeedback = "saved" | "error" | null;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [feedback, setFeedback] = useState<SaveFeedback>(null);
  const { confirm, dialogProps } = useConfirmDialog();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resincronitzacio durant el render quan canvia la nota (patro React 19).
  const [trackedNoteId, setTrackedNoteId] = useState(note.id);
  const [baseline, setBaseline] = useState({
    title: note.title,
    content: note.content,
  });
  if (trackedNoteId !== note.id) {
    setTrackedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setFeedback(null);
    setBaseline({ title: note.title, content: note.content });
  }

  const dirty = title !== baseline.title || content !== baseline.content;
  const status: SaveStatus = dirty ? "saving" : (feedback ?? "idle");

  useEffect(() => {
    if (!dirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const snapshot = { title, content };
      const result = await updateNote({
        id: note.id,
        title: snapshot.title.trim() || "Sense titol",
        content: snapshot.content,
      });
      if (result.ok) {
        setBaseline(snapshot);
        setFeedback("saved");
        setTimeout(
          () =>
            setFeedback((current) => (current === "saved" ? null : current)),
          1500,
        );
      } else {
        setFeedback("error");
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [dirty, title, content, note.id]);

  function handleDelete() {
    confirm({
      title: "Eliminar nota",
      description:
        "Vols eliminar aquesta nota? Aquesta acció no es pot desfer.",
      onConfirm: async () => {
        const result = await deleteNote(note.id);
        if (result.ok) router.push("/notes");
      },
    });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-6 py-3 text-xs text-[var(--color-text-subtle)]">
        <span
          className={cn(
            status === "saving" && "text-[var(--color-text-muted)]",
            status === "saved" && "text-[var(--color-accent)]",
            status === "error" && "text-[var(--color-danger)]",
          )}
        >
          {status === "saving" && "Desant…"}
          {status === "saved" && "Desat"}
          {status === "error" && "Error en desar"}
          {status === "idle" && "Tots els canvis desats"}
        </span>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden /> Eliminar
        </Button>
      </header>
      <div className="flex flex-1 flex-col gap-2 px-6 py-6">
        <Input
          type="text"
          ghost
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="Titol"
          aria-label="Titol de la nota"
          className="text-2xl font-semibold tracking-tight text-text placeholder:text-text-subtle"
        />
        <Textarea
          ghost
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Comença a escriure…"
          aria-label="Contingut de la nota"
          className="flex-1 resize-none text-sm leading-relaxed text-text-muted placeholder:text-text-subtle"
        />
      </div>
      <ConfirmDialogHost dialogProps={dialogProps} />
    </div>
  );
}
