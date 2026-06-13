import { cn } from "@/lib/utils";

/** Bordered form control with inset relief + clean accent focus ring. */
export const formFieldClass = cn(
  "w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-text placeholder:text-text-subtle",
  "shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]",
  "transition-all duration-200",
  "focus:outline-none focus-visible:outline-none",
  "focus:border-accent focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_2px_var(--color-accent-soft)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** Borderless editor fields (note title / body). */
export const formFieldGhostClass = cn(
  "w-full border border-transparent bg-transparent",
  "transition-all duration-200",
  "focus:outline-none focus-visible:outline-none",
);

/** Compact variant modifier (search bars). */
export const formFieldSmClass = "py-1.5";

export const formCheckClass = cn(
  "transition-shadow duration-200",
  "focus:outline-none focus-visible:outline-none",
  "focus:shadow-[0_0_0_2px_var(--color-accent-soft)]",
);
