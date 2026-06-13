"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(t("errors.routeLog"), error);
  }, [error, t]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("errors.title")}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {error.message || t("errors.generic")}
        </p>
      </div>
      <Button onClick={reset} variant="secondary" size="sm">
        {t("common.retry")}
      </Button>
    </div>
  );
}
