import type { Messages, TranslationKey, Translator } from "./types";

function getNestedValue(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function createTranslator(messages: Messages): Translator {
  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string {
    const value = getNestedValue(messages, key);
    if (!value) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation: ${key}`);
      }
      return key;
    }
    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (_, param) =>
      String(params[param] ?? `{${param}}`),
    );
  };
}
