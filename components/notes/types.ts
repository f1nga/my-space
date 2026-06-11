export interface NoteSummary {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: Date;
  preview: string;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
