"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale as DateFnsLocale } from "date-fns";
import { createTranslator } from "./create-translator";
import { DATE_FNS_LOCALES, INTL_LOCALE_IDS } from "./date-locale";
import { setLocale as setLocaleAction } from "./set-locale";
import type { Locale } from "./config";
import type { Messages, Translator } from "./types";

type I18nContextValue = {
  locale: Locale;
  t: Translator;
  dateFnsLocale: DateFnsLocale;
  intlLocale: string;
  setLocale: (locale: Locale) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const t = useMemo(() => createTranslator(messages), [messages]);

  const setLocale = useCallback(async (newLocale: Locale) => {
    await setLocaleAction(newLocale);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t,
      dateFnsLocale: DATE_FNS_LOCALES[locale],
      intlLocale: INTL_LOCALE_IDS[locale],
      setLocale,
    }),
    [locale, t, setLocale],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  const ctx = use(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
