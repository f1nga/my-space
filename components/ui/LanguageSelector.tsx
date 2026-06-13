"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LOCALE_LABELS,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/types";
import { useI18n } from "@/lib/i18n/client";

type LanguageSelectorProps = {
  compact?: boolean;
};

const LOCALE_NAMES: Record<Locale, TranslationKey> = {
  ca: "settings.languageCa",
  es: "settings.languageEs",
  en: "settings.languageEn",
};

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSelect(newLocale: Locale) {
    if (newLocale === locale || pending) return;
    setPending(true);
    await setLocale(newLocale);
    router.refresh();
    setOpen(false);
    setPending(false);
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          aria-label={t("settings.language")}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Languages className="h-4 w-4" aria-hidden />
        </button>
        {open ? (
          <>
            <button
              type="button"
              aria-label={t("common.close")}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              role="listbox"
              aria-label={t("settings.language")}
              className="absolute bottom-full left-0 z-50 mb-2 min-w-[7rem] rounded-lg border border-border bg-bg-elevated p-1 shadow-pop"
            >
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={locale === code}
                  lang={code}
                  disabled={pending}
                  onClick={() => handleSelect(code)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    locale === code
                      ? "bg-accent-soft text-accent"
                      : "text-text-muted hover:bg-surface hover:text-text",
                  )}
                >
                  <span>{LOCALE_LABELS[code]}</span>
                  <span className="text-[10px] text-text-subtle">
                    {t(LOCALE_NAMES[code])}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("settings.language")}
      className="inline-flex rounded-lg border border-border bg-surface p-0.5"
    >
      {locales.map((code) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={isActive}
            aria-label={t(LOCALE_NAMES[code])}
            disabled={pending}
            onClick={() => handleSelect(code)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
