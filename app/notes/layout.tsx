import { getAllNotes } from "@/lib/data/notes";
import { NoteList } from "@/components/notes/NoteList";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const notes = await getAllNotes();
  const summaries = notes.map((note) => ({
    id: note.id,
    title: note.title,
    pinned: note.pinned,
    updatedAt: note.updatedAt,
    preview: note.content.replace(/\s+/g, " ").slice(0, 120),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Notes"
        title="Bloc personal"
        description="Apunts rapids amb desat automatic. Selecciona o crea una nota."
      />
      <section className="grid flex-1 grid-cols-1 md:grid-cols-[320px_1fr]">
        <NoteList notes={summaries} />
        <div className="min-h-[60vh]">{children}</div>
      </section>
    </div>
  );
}
