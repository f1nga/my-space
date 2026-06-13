"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { StickyNote } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export default function NotesIndexPage() {
  const { t } = useI18n();

  return (
    <div className="flex h-full items-center justify-center p-8">
      <EmptyState
        icon={StickyNote}
        title={t("notes.pickNote")}
        description={t("notes.pickNoteDescription")}
      />
    </div>
  );
}
