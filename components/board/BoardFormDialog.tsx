"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { createBoard } from "@/lib/actions/boards";
import { useI18n } from "@/lib/i18n/client";

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
  const { t } = useI18n();
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
      setError(t("board.boardNameRequired"));
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
      title={t("board.newBoardTitle")}
      description={t("board.newBoardDescription")}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="board-name"
            className="text-xs font-medium text-[var(--color-text-muted)]"
          >
            {t("board.boardName")}
          </label>
          <Input
            id="board-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
            maxLength={50}
            placeholder={t("board.boardNamePlaceholder")}
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
            {t("common.cancel")}
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? t("common.creating") : t("board.createBoard")}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
