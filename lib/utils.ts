export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(
  date: Date,
  localeId = "ca-ES",
  opts?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(localeId, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatTime(date: Date, localeId = "ca-ES") {
  return new Intl.DateTimeFormat(localeId, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** @deprecated Use formatDate(date, localeId) */
export function formatDateCa(date: Date, opts?: Intl.DateTimeFormatOptions) {
  return formatDate(date, "ca-ES", opts);
}

/** @deprecated Use formatTime(date, localeId) */
export function formatTimeCa(date: Date) {
  return formatTime(date, "ca-ES");
}
