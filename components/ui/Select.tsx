"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formFieldClass } from "./field-styles";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectChangeEvent = {
  target: { value: string };
};

export type SelectProps = {
  id?: string;
  value: string;
  onChange: (event: SelectChangeEvent) => void;
  children?: ReactNode;
  options?: SelectOption[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
};

function optionsFromChildren(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== "option") return;
    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    if (props.value === undefined) return;

    const label =
      typeof props.children === "string" || typeof props.children === "number"
        ? String(props.children)
        : String(props.value);

    options.push({
      value: String(props.value),
      label,
      disabled: props.disabled,
    });
  });

  return options;
}

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
};

const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;
const MIN_SPACE_BELOW = 120;

export function Select({
  id,
  value,
  onChange,
  children,
  options: optionsProp,
  disabled = false,
  className,
  placeholder,
  "aria-label": ariaLabel,
}: SelectProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const options = useMemo(
    () => optionsProp ?? optionsFromChildren(children),
    [optionsProp, children],
  );

  const selectedOption = options.find((option) => option.value === value);
  const enabledOptions = options.filter((option) => !option.disabled);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const preferBelow = spaceBelow >= MIN_SPACE_BELOW;
    const available = preferBelow ? spaceBelow : spaceAbove;
    const maxHeight = Math.min(240, Math.max(96, available - MENU_GAP));

    setPosition({
      left: rect.left,
      width: rect.width,
      top: preferBelow ? rect.bottom + MENU_GAP : rect.top - MENU_GAP,
      maxHeight,
      placement: preferBelow ? "below" : "above",
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
    requestAnimationFrame(() => {
      menuRef.current?.focus({ preventScroll: true });
    });
  }, [open, updatePosition, options.length]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const selectedIndex = enabledOptions.findIndex(
      (option) => option.value === value,
    );
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, enabledOptions, value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function selectOption(option: SelectOption) {
    if (option.disabled) return;
    onChange({ target: { value: option.value } });
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ":
        event.preventDefault();
        setOpen(true);
        break;
      default:
        break;
    }
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!open || enabledOptions.length === 0) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((current) => {
          const next = current + 1;
          return next >= enabledOptions.length ? 0 : next;
        });
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((current) => {
          const next = current - 1;
          return next < 0 ? enabledOptions.length - 1 : next;
        });
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (highlightedIndex >= 0) {
          selectOption(enabledOptions[highlightedIndex]);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const option = menuRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${highlightedIndex}"]`,
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [open, highlightedIndex]);

  const menu =
    open && position && typeof window !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-activedescendant={
              highlightedIndex >= 0 && enabledOptions[highlightedIndex]
                ? `${listboxId}-option-${enabledOptions[highlightedIndex].value}`
                : undefined
            }
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              zIndex: 70,
              transform:
                position.placement === "above"
                  ? "translateY(-100%)"
                  : undefined,
            }}
            className="overflow-y-auto rounded-lg border border-border bg-bg-elevated p-1 shadow-pop"
          >
            {options.length === 0 ? (
              <p className="px-3 py-2 text-sm text-text-muted">—</p>
            ) : (
              options.map((option) => {
                const enabledIndex = enabledOptions.indexOf(option);
                const isSelected = option.value === value;
                const isHighlighted = enabledIndex === highlightedIndex;

                return (
                  <button
                    key={option.value}
                    id={`${listboxId}-option-${option.value}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    {...(enabledIndex >= 0
                      ? { "data-option-index": enabledIndex }
                      : {})}
                    onMouseEnter={() => {
                      if (!option.disabled && enabledIndex >= 0) {
                        setHighlightedIndex(enabledIndex);
                      }
                    }}
                    onClick={() => selectOption(option)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      option.disabled && "cursor-not-allowed opacity-40",
                      !option.disabled && isHighlighted && "bg-surface-hover",
                      !option.disabled &&
                        isSelected &&
                        "bg-accent-soft text-accent",
                      !option.disabled &&
                        !isSelected &&
                        !isHighlighted &&
                        "text-text hover:bg-surface-hover",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          formFieldClass,
          "flex items-center justify-between gap-2 text-left",
          open &&
            "border-accent shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_2px_var(--color-accent-soft)]",
          className,
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            selectedOption ? "text-text" : "text-text-subtle",
          )}
        >
          {selectedOption?.label ?? placeholder ?? "—"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {menu}
    </>
  );
}
