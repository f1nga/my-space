import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  formCheckClass,
  formFieldClass,
  formFieldGhostClass,
  formFieldSmClass,
} from "./field-styles";

export {
  formCheckClass,
  formFieldClass,
  formFieldGhostClass,
  formFieldSmClass,
} from "./field-styles";

export { Select } from "./Select";
export type { SelectOption, SelectProps } from "./Select";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { ghost?: boolean }
>(function Input({ className, ghost, type = "text", ...rest }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(ghost ? formFieldGhostClass : formFieldClass, className)}
      {...rest}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { ghost?: boolean }
>(function Textarea({ className, ghost, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(ghost ? formFieldGhostClass : formFieldClass, className)}
      {...rest}
    />
  );
});
