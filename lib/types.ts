import { z } from "zod";

// Estats de tasca (SQLite no suporta enum a Prisma; ho validem amb Zod).
export const TASK_STATUSES = ["todo", "doing", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const taskStatusSchema = z.enum(TASK_STATUSES);

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Per fer",
  doing: "En proces",
  done: "Fet",
};

// Helpers per acceptar dates des de FormData (string) i convertir-les.
const optionalDate = z
  .union([z.string().min(1), z.date(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    return value instanceof Date ? value : new Date(value);
  })
  .nullable();

// ───── Tasks ─────
export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "El titol es obligatori").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  status: taskStatusSchema.default("todo"),
  dueDate: optionalDate.optional(),
});
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export const taskMoveSchema = z.object({
  id: z.string().min(1),
  status: taskStatusSchema,
  position: z.number().finite(),
});
export type TaskMoveInput = z.infer<typeof taskMoveSchema>;

// ───── Notes ─────
export const noteCreateSchema = z.object({
  title: z.string().trim().min(1, "El titol es obligatori").max(200),
  content: z.string().max(50_000).default(""),
  pinned: z.boolean().default(false),
});
export type NoteCreateInput = z.infer<typeof noteCreateSchema>;

export const noteUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().max(50_000).optional(),
  pinned: z.boolean().optional(),
});
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;

// ───── Events ─────
const requiredDate = z
  .union([z.string().min(1), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

export const eventCreateSchema = z
  .object({
    title: z.string().trim().min(1, "El titol es obligatori").max(200),
    description: z.string().trim().max(5000).optional().nullable(),
    startsAt: requiredDate,
    endsAt: optionalDate.optional(),
    allDay: z.boolean().default(false),
    color: z.string().trim().max(40).optional().nullable(),
  })
  .refine(
    (data) => !data.endsAt || data.endsAt.getTime() >= data.startsAt.getTime(),
    { message: "La data final no pot ser anterior a la inicial", path: ["endsAt"] },
  );
export type EventCreateInput = z.infer<typeof eventCreateSchema>;

export const eventUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  startsAt: requiredDate.optional(),
  endsAt: optionalDate.optional(),
  allDay: z.boolean().optional(),
  color: z.string().trim().max(40).optional().nullable(),
});
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

// Paleta d'accents disponible per esdeveniments (clau de classe Tailwind).
export const EVENT_COLORS = [
  "emerald",
  "sky",
  "violet",
  "amber",
  "rose",
  "zinc",
] as const;
export type EventColor = (typeof EVENT_COLORS)[number];
