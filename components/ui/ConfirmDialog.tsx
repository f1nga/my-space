"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pending = false,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const resolvedTitle = title ?? t("confirm.deleteTitle");
  const resolvedConfirmLabel = confirmLabel ?? t("common.delete");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, pending]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("confirm.closeDialog")}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!pending) onClose();
        }}
      />
      <div
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-2xl",
          "border border-border bg-bg-elevated shadow-pop",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger-soft"
              aria-hidden
            >
              <AlertTriangle className="h-5 w-5 text-danger" />
            </span>
            <div>
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold tracking-tight text-text"
              >
                {resolvedTitle}
              </h2>
              <p
                id="confirm-dialog-desc"
                className="mt-1 text-sm leading-relaxed text-text-muted"
              >
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label={t("common.close")}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <footer className="flex justify-end gap-2 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={pending}
            className="bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger"
          >
            {pending ? t("common.deleting") : resolvedConfirmLabel}
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialogHost({
  dialogProps,
}: {
  dialogProps: ConfirmDialogProps | null;
}) {
  if (!dialogProps) return null;
  return <ConfirmDialog {...dialogProps} />;
}
