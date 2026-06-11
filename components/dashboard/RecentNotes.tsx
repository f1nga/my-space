import Link from "next/link";
import { ArrowRight, StickyNote } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `fa ${Math.max(1, minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `fa ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `fa ${days} dies`;
  return date.toLocaleDateString("ca-ES", { day: "numeric", month: "short" });
}

export function RecentNotes({ notes }: { notes: NoteItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes recents</CardTitle>
        <Link
          href="/notes"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Totes <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </CardHeader>
      <CardBody>
        {notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="Encara no tens notes"
            description="Crea&apos;n una des de la secció Notes."
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
                    {note.title || "Sense titol"}
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
