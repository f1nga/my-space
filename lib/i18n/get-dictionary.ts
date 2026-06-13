import "server-only";

import { createTranslator } from "./create-translator";
import { getLocale } from "./get-locale";
import type { Locale } from "./config";
import type { Messages } from "./types";

const dictionaries: Record<Locale, () => Promise<Messages>> = {
  ca: () => import("@/messages/ca.json").then((m) => m.default),
  es: () => import("@/messages/es.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  return dictionaries[locale]();
}

export async function getTranslations() {
  const locale = await getLocale();
  const messages = await getDictionary(locale);
  return createTranslator(messages);
}
