import type ca from "@/messages/ca.json";

export type Messages = typeof ca;

type DotPrefix<T extends string, U extends string> = U extends ""
  ? T
  : `${T}.${U}`;

type DotNestedKeys<T> = T extends object
  ? {
      [K in keyof T & string]: DotPrefix<K, DotNestedKeys<T[K]>>;
    }[keyof T & string]
  : "";

export type TranslationKey = DotNestedKeys<Messages>;

export type Translator = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;
