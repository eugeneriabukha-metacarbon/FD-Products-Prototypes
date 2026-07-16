"use client";

import * as React from "react";
import { CaretDownIcon, InfoIcon, WarningIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { inputVariants } from "../input/inputVariants";

/** A selectable option. `disabled` rows render but are skipped by keyboard nav. */
export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /**
   * Optional adornment before the label (usually a 16px Phosphor icon). In
   * multi mode it sits after the checkbox (checkbox → leading → label). Purely
   * decorative — rendered `aria-hidden`, and it inherits the row's text colour
   * (so it recolours to the brand foreground on the single-select selected row).
   */
  leadingSlot?: React.ReactNode;
  /**
   * Optional adornment after the label (usually a 16px Phosphor icon), pinned to
   * the trailing edge of the row. Decorative + colour-inheriting, like
   * `leadingSlot`.
   */
  trailingSlot?: React.ReactNode;
};

/**
 * Pure value-display helper — decides what the trigger shows for a given
 * selection. Kept free of React so it is unit-testable in isolation:
 * - `[]`  → the placeholder (`isPlaceholder: true`)
 * - one   → that option's label
 * - many  → `"${n} selected"` (never overflows the single lg line)
 *
 * A selected value with no matching option is ignored for the single-label case
 * (it can't be labelled); the count path still counts it.
 */
export function selectTriggerLabel(
  options: SelectOption[],
  selected: string[],
  placeholder: string,
): { text: string; isPlaceholder: boolean } {
  if (selected.length === 0) {
    return { text: placeholder, isPlaceholder: true };
  }
  if (selected.length === 1) {
    const match = options.find((o) => o.value === selected[0]);
    return { text: match?.label ?? placeholder, isPlaceholder: match == null };
  }
  return { text: `${selected.length} selected`, isPlaceholder: false };
}

export interface SelectTriggerProps extends Omit<
  React.ComponentProps<"button">,
  "value"
> {
  /** `field` (bordered box) | `line` (bottom border only). */
  variation?: "field" | "line";
  /** Error state — destructive border/label/hint (out-ranks the focus border). */
  error?: boolean;
  /** LINE-only: hide the resting bottom line (still shows on focus/error). */
  showBottomLine?: boolean;
  /** Whether the listbox is currently open (flips the caret + `aria-expanded`). */
  open?: boolean;
  /** Resolved display text (from `selectTriggerLabel`). */
  displayText: string;
  /** Whether `displayText` is the placeholder (muted) vs a real value (accent). */
  isPlaceholder: boolean;
  /** Uppercase label above the field; omitted → no label row. */
  label?: React.ReactNode;
  /** Helper text below the field; destructive when `error`. */
  hint?: React.ReactNode;
  /** Leading adornment (decorative — kept out of the a11y tree via `aria-hidden`). */
  leadingSlot?: React.ReactNode;
  /** id of the field `<button>` (label association + `aria-labelledby` target). */
  id: string;
  /** id of the hint node, linked via `aria-describedby` when a hint is present. */
  hintId?: string;
  /** Class names for the outer wrapper (the label/field/hint stack). */
  wrapperClassName?: string;
  /** Class names for the field row (the trigger button), not the wrapper. */
  fieldClassName?: string;
}

/**
 * The Select trigger — a `<button type="button">` styled as an input field
 * (reusing `inputVariants`), with an optional uppercase label above and a hint
 * below (both owned by the component, mirroring `Input`). It renders a leading
 * slot, the current value (or placeholder), and a trailing caret that flips
 * when `open`.
 *
 * This is a presentational leaf: all open/selection/keyboard orchestration and
 * the ARIA popup wiring (`aria-haspopup`/`aria-expanded`/`aria-controls`/
 * `aria-activedescendant`) live in `Select`, which spreads them through
 * `...props`. `ref` is a normal React 19 prop, forwarded to the button.
 */
function SelectTrigger({
  variation = "field",
  error = false,
  showBottomLine = true,
  open = false,
  displayText,
  isPlaceholder,
  label,
  hint,
  leadingSlot,
  id,
  hintId,
  disabled,
  className,
  wrapperClassName,
  fieldClassName,
  ref,
  ...props
}: SelectTriggerProps) {
  // Icon colour, shared by the leading slot + caret + hint icon: default
  // `text-input-foreground`, destructive on error, muted when disabled.
  const iconStateClass = cn(
    error
      ? "text-input-destructive-foreground-accent"
      : "text-input-foreground",
    disabled && "text-input-foreground-muted",
  );

  const HintIcon = error ? WarningIcon : InfoIcon;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label != null && (
        <label
          htmlFor={id}
          data-slot="select-label"
          className={cn(
            "caption-03-medium uppercase",
            error
              ? "text-input-destructive-foreground-accent"
              : "text-input-foreground",
            disabled && "text-input-foreground-muted",
          )}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={id}
        ref={ref}
        // `combobox` is the role that permits `aria-activedescendant` +
        // `aria-controls` on the trigger (a plain button role does not), which
        // is the pattern this Select uses to keep focus on the trigger while the
        // roving highlight lives in the portaled listbox.
        role="combobox"
        data-slot="select-trigger"
        data-variation={variation}
        data-error={error || undefined}
        disabled={disabled}
        aria-invalid={error || undefined}
        aria-describedby={hintId}
        className={cn(
          // Reuse the Input field-row styling (field/line + focus/error border).
          inputVariants({ variation, size: "lg", error, showBottomLine }),
          // The field is a pointer target, not a text field: pointer cursor,
          // and not-allowed when disabled (overrides `inputVariants`' I-beam).
          "cursor-pointer disabled:cursor-not-allowed",
          // No system focus ring: like Input (ADR-0011), this field-shaped
          // control signals focus purely by recolouring its 1px border to the
          // accent (via `inputVariants`' `focus-within:`). The focusable element
          // here is the field itself, so kill the browser's default outline —
          // otherwise it layers ~1.5px on top of the border and reads as 2px.
          "outline-none",
          // Left-align content; the value grows, the caret stays trailing.
          "text-left",
          // Icon slots inherit the shared state colour; 16px default size for
          // any nested svg that hasn't set its own size (mirrors Input).
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          iconStateClass,
          fieldClassName,
          className,
        )}
        {...props}
      >
        {leadingSlot != null && (
          <span
            data-slot="select-leading"
            aria-hidden="true"
            className="flex items-center"
          >
            {leadingSlot}
          </span>
        )}
        <span
          data-slot="select-value"
          className={cn(
            "body-03 w-full min-w-0 truncate",
            isPlaceholder
              ? "text-input-foreground-muted"
              : "text-input-foreground-accent",
            disabled && "text-input-foreground-muted",
          )}
        >
          {displayText}
        </span>
        <span
          data-slot="select-trailing"
          aria-hidden="true"
          className="flex items-center"
        >
          <CaretDownIcon
            weight="fill"
            className={cn("size-3 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {hint != null && (
        <p
          id={hintId}
          data-slot="select-hint"
          className={cn(
            "body-04 flex items-center gap-1",
            error
              ? "text-input-destructive-foreground-accent"
              : "text-input-foreground",
            disabled && "text-input-foreground-muted",
          )}
        >
          <HintIcon
            aria-hidden="true"
            weight="regular"
            className="size-4 shrink-0"
          />
          {hint}
        </p>
      )}
    </div>
  );
}

export { SelectTrigger };
