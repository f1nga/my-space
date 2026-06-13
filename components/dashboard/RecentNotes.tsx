"use client";

import Link from "next/link";
import { ArrowRight, StickyNote } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n/client";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

export function RecentNotes({ notes }: { notes: NoteItem[] }) {
  const { t, intlLocale } = useI18n();

  function relativeDate(date: Date): string {
    const diff = Date.now() - date.getTime();
    const minutes = Math.round(diff / 60_000);
    if (minutes < 60) {
      return t("relative.agoMinutes", { count: Math.max(1, minutes) });
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return t("relative.agoHours", { count: hours });
    }
    const days = Math.round(hours / 24);
    if (days < 7) {
      return t("relative.agoDays", { count: days });
    }
    return date.toLocaleDateString(intlLocale, {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.recentNotes")}</CardTitle>
        <Link
          href="/notes"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          {t("dashboard.allNotes")}{" "}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </CardHeader>
      <CardBody>
        {notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title={t("dashboard.noNotes")}
            description={t("dashboard.noNotesDescription")}
          />
        ) : (
          <ul className="space-y-1">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface)]"
                >
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">
                    {note.title || t("common.noTitle")}
                  </p>
                  {note.content ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-muted)]">
                      {note.content.replace(/\s+/g, " ")}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-text-subtle)]">
                    {relativeDate(note.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
