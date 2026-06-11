export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDateCa(date: Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("ca-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatTimeCa(date: Date) {
  return new Intl.DateTimeFormat("ca-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
