"use client";

import { useI18n } from "@/lib/i18n/client";

export default function RootLoading() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <span
          aria-hidden
          className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"
        />
        {t("common.loading")}
      </div>
    </div>
  );
}
