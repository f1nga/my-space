"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { createBoard } from "@/lib/actions/boards";

interface BoardFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (board: { id: string; name: string; position: number }) => void;
}

export function BoardFormDialog({
  open,
  onClose,
  onCreated,
}: BoardFormDialogProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  function handleClose() {
    setName("");
    setError(null);
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Cal un nom per al tauler.");
      return;
    }

    startTransition(async () => {
      const result = await createBoard({ name: trimmed });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data) onCreated(result.data);
      handleClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Nou tauler"
      description="Crea un espai de treball amb el nom que vulguis."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="board-name"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            Nom del tauler
          </label>
          <Input
            id="board-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
            maxLength={50}
            placeholder="Per exemple, Feina, Uni, Projectes…"
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]"
          >
            {error}
          </p>
        ) : null}

        <footer className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={pending}
          >
            Cancel·lar
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Creant…" : "Crear tauler"}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
