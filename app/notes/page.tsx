import { EmptyState } from "@/components/ui/EmptyState";
import { StickyNote } from "lucide-react";

export default function NotesIndexPage() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <EmptyState
        icon={StickyNote}
        title="Tria una nota"
        description="Selecciona una nota de la llista esquerra o crea'n una de nova amb el botó +."
      />
    </div>
  );
}
