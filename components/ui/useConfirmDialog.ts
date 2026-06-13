"use client";

import { useCallback, useState, useTransition } from "react";
import type { ConfirmDialogProps } from "@/components/ui/ConfirmDialog";

export interface ConfirmRequest {
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<unknown>;
}

export function useConfirmDialog() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = useCallback((options: ConfirmRequest) => {
    setRequest(options);
  }, []);

  const close = useCallback(() => {
    if (!pending) setRequest(null);
  }, [pending]);

  const handleConfirm = useCallback(() => {
    if (!request) return;
    startTransition(async () => {
      await request.onConfirm();
      setRequest(null);
    });
  }, [request]);

  const dialogProps: ConfirmDialogProps | null = request
    ? {
        open: true,
        onClose: close,
        onConfirm: handleConfirm,
        title: request.title,
        description: request.description,
        confirmLabel: request.confirmLabel,
        pending,
      }
    : null;

  return { confirm, dialogProps };
}
