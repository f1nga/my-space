import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/data/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const note = await getNoteById(id);
  if (!note) notFound();

  return (
    <NoteEditor
      note={{
        id: note.id,
        title: note.title,
        content: note.content,
        pinned: note.pinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }}
    />
  );
}
