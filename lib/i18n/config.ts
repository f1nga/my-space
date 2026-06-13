export const locales = ["ca", "es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ca";

export const LOCALE_COOKIE = "my-space-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  ca: "CA",
  es: "ES",
  en: "EN",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined | null): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
