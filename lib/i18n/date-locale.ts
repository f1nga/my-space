import { ca, enUS, es } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";
import type { Locale } from "./config";

export const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = {
  ca,
  es,
  en: enUS,
};

export const INTL_LOCALE_IDS: Record<Locale, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-GB",
};

export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  return DATE_FNS_LOCALES[locale];
}

export function getIntlLocaleId(locale: Locale): string {
  return INTL_LOCALE_IDS[locale];
}
