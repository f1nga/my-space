import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatTimeCa } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  startsAt: Date;
  allDay: boolean;
  color: string | null;
}

const COLOR_DOTS: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  zinc: "bg-zinc-500",
};

function relativeDay(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Avui";
  if (diff === 1) return "Dema";
  return new Date(date).toLocaleDateString("ca-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function UpcomingEvents({ events }: { events: EventItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Propers esdeveniments</CardTitle>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Calendari <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </CardHeader>
      <CardBody>
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Cap esdeveniment proper"
            description="Tens els pròxims 7 dies lliures."
          />
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface)]"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    COLOR_DOTS[event.color ?? "emerald"] ?? COLOR_DOTS.emerald,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-text)]">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {relativeDay(event.startsAt)}
                    {!event.allDay ? ` · ${formatTimeCa(event.startsAt)}` : " · tot el dia"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
