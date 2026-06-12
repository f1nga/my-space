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

// ───── Objectius ─────
export const CATEGORIES_OBJECTIU = [
  "FISIC",
  "MENTAL",
  "DINERS",
  "TREBALL",
  "ALTRES",
] as const;
export type CategoriaObjectiu = (typeof CATEGORIES_OBJECTIU)[number];
export const categoriaObjectiuSchema = z.enum(CATEGORIES_OBJECTIU);

export const ESTATS_OBJECTIU = ["EN_PROGRES", "COMPLETAT", "ABANDONAT"] as const;
export type EstatObjectiu = (typeof ESTATS_OBJECTIU)[number];
export const estatObjectiuSchema = z.enum(ESTATS_OBJECTIU);

export const CATEGORIA_OBJECTIU_LABELS: Record<CategoriaObjectiu, string> = {
  FISIC: "Físic",
  MENTAL: "Mental",
  DINERS: "Diners",
  TREBALL: "Treball",
  ALTRES: "Altres",
};

export const ESTAT_OBJECTIU_LABELS: Record<EstatObjectiu, string> = {
  EN_PROGRES: "En progrés",
  COMPLETAT: "Completat",
  ABANDONAT: "Abandonat",
};

const subObjectiuInputSchema = z.object({
  titol: z.string().trim().min(1).max(200),
});

export const objectiuCreateSchema = z
  .object({
    titol: z.string().trim().min(1, "El títol és obligatori").max(200),
    descripcio: z.string().trim().max(2000).optional().nullable(),
    dataInici: requiredDate,
    dataFinal: requiredDate,
    categoria: categoriaObjectiuSchema,
    progress: z.number().int().min(0).max(100).default(0),
    subtasques: z.array(subObjectiuInputSchema).max(20).default([]),
  })
  .refine((data) => data.dataFinal.getTime() >= data.dataInici.getTime(), {
    message: "La data final no pot ser anterior a la inicial",
    path: ["dataFinal"],
  });
export type ObjectiuCreateInput = z.infer<typeof objectiuCreateSchema>;

export const objectiuUpdateSchema = z
  .object({
    id: z.string().min(1),
    titol: z.string().trim().min(1).max(200).optional(),
    descripcio: z.string().trim().max(2000).optional().nullable(),
    dataInici: requiredDate.optional(),
    dataFinal: requiredDate.optional(),
    categoria: categoriaObjectiuSchema.optional(),
    estat: estatObjectiuSchema.optional(),
    progress: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      if (!data.dataInici || !data.dataFinal) return true;
      return data.dataFinal.getTime() >= data.dataInici.getTime();
    },
    {
      message: "La data final no pot ser anterior a la inicial",
      path: ["dataFinal"],
    },
  );
export type ObjectiuUpdateInput = z.infer<typeof objectiuUpdateSchema>;

export const subObjectiuCreateSchema = z.object({
  objectiuId: z.string().min(1),
  titol: z.string().trim().min(1).max(200),
});
export type SubObjectiuCreateInput = z.infer<typeof subObjectiuCreateSchema>;

export const subObjectiuToggleSchema = z.object({
  id: z.string().min(1),
  completat: z.boolean(),
});
export type SubObjectiuToggleInput = z.infer<typeof subObjectiuToggleSchema>;

export const subObjectiuDeleteSchema = z.object({
  id: z.string().min(1),
});
export type SubObjectiuDeleteInput = z.infer<typeof subObjectiuDeleteSchema>;

export const subObjectiuUpdateSchema = z.object({
  id: z.string().min(1),
  titol: z.string().trim().min(1).max(200),
});
export type SubObjectiuUpdateInput = z.infer<typeof subObjectiuUpdateSchema>;
