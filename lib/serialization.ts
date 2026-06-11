import type { CalendarItem, SerializedCalendarItem } from "@/lib/calendar";

function toISO(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export function serializeCalendarItem(item: CalendarItem): SerializedCalendarItem {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    description: item.description ?? null,
    startsAt: item.startsAt.toISOString(),
    endsAt: toISO(item.endsAt),
    allDay: item.allDay,
    color: item.color,
  };
}

export function serializeCalendarItems(
  items: CalendarItem[],
): SerializedCalendarItem[] {
  return items.map(serializeCalendarItem);
}
