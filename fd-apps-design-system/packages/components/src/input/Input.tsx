"use client";

import * as React from "react";
import { InfoIcon, WarningIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { inputVariants, type InputVariantsProps } from "./inputVariants";

export interface InputProps
  extends
    Omit<React.ComponentProps<"input">, "size">,
    Omit<InputVariantsProps, "error"> {
  /**
   * Uppercase label shown above the field. When omitted the label row is not
   * rendered. Always paired with the `<input>` via generated `id`/`htmlFor`
   * (or your own `id`), so the control is properly named for assistive tech.
   */
  label?: React.ReactNode;
  /**
   * Marks the field as not required — renders an "Optional" tag on the right of
   * the label row (Figma). Has no effect without a `label`.
   */
  optional?: boolean;
  /**
   * Helper text shown below the field, with a leading 16px icon (info by
   * default, warning when `error`). Linked to the input via `aria-describedby`.
   */
  hint?: React.ReactNode;
  /**
   * Error state (a prop, not an interaction state): sets `aria-invalid`, turns
   * the label, border/bottom-line, icons and hint to the destructive accent,
   * and swaps the hint icon to a warning.
   */
  error?: boolean;
  /** Leading adornment (usually a 16px Phosphor icon). Decorative — kept out of the a11y tree via `aria-hidden`. */
  leftSlot?: React.ReactNode;
  /**
   * Trailing adornment. Usually a 16px Phosphor icon (decorative), but MAY be an
   * interactive control (e.g. SearchBar's clear `<button>`). The wrapper is NOT
   * `aria-hidden` (that would hide a focusable child from assistive tech — an
   * ARIA violation); decorative bare `<svg>` icons are silent to AT on their own
   * (no role, no accessible name), so they stay unannounced without it. An
   * interactive control placed here must carry its own accessible name.
   */
  rightSlot?: React.ReactNode;
  /** Class names for the outer wrapper (the vertical label/field/hint stack). */
  wrapperClassName?: string;
  /** Class names for the field row (border/background box), not the `<input>`. */
  fieldClassName?: string;
  /**
   * Toggles the resting visibility of the bottom line on the **`line`**
   * variation only. Default `true` (line visible at rest). When `false`, the
   * bottom line is hidden at rest (recoloured to transparent) but still appears
   * on focus (accent) and on error (destructive); the 1px `border-b` is kept in
   * all cases so there is no layout shift — only the border colour changes.
   *
   * Has NO effect on the `field` variation (its box border is out of scope).
   */
  showBottomLine?: boolean;
}

/**
 * Text input — the Figma `BaseInput` component (node 4973:6816), rendered as a
 * real `<input>` wrapped in a field row with optional `leftSlot`/`rightSlot`
 * icon slots, an optional uppercase label row, and an optional hint message.
 *
 * Follows the ADR-0010 form-control conventions: the native `<input>` is the
 * single source of truth (uncontrolled `defaultValue` or controlled
 * `value` + `onChange`); the component holds no React state. `ref` is a normal
 * prop (React 19). Not `asChild` — the root must stay a void, platform-behaviour
 * -bearing `<input>` (ADR-0010).
 *
 * Two independent axes (4 combinations): `variation` (`field` bordered box /
 * `line` bottom-border-only) × `size` (`sm` / `lg`, reusing the sibling scale).
 * The Figma "states" (hover/focus/filled) are runtime DOM states: hover is an
 * I-beam cursor affordance only (no colour change), focus recolours the border
 * via `focus-within:` (no system outline ring — a user-authorized exception to
 * ADR-0010 #4 / ADR-0011, see `inputVariants.ts`), and filled shows the typed-
 * text colour. Only `disabled` (native attribute) and `error` (prop) are real
 * props.
 */
function Input({
  className,
  fieldClassName,
  wrapperClassName,
  variation = "field",
  size = "lg",
  error = false,
  // LINE-only bottom-line toggle. Destructured OUT of `props` so it never
  // spreads onto the native <input> (invalid DOM attribute → React warning).
  showBottomLine = true,
  label,
  optional = false,
  hint,
  leftSlot,
  rightSlot,
  disabled,
  id: idProp,
  ref,
  ...props
}: InputProps) {
  // Associate the label + hint with the input. Use the caller's id when given,
  // otherwise a stable generated one; the hint id is derived from it.
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;

  // Icon size (16px, Figma) + colour, shared by leading/trailing/hint icons.
  // Default `text-input-foreground`; error → destructive accent; disabled →
  // muted. Applied to any nested svg that hasn't set its own size.
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
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            data-slot="input-label"
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
          {optional && (
            <span
              data-slot="input-optional"
              className="body-04 text-input-foreground-muted"
            >
              Optional
            </span>
          )}
        </div>
      )}

      <div
        data-slot="input-field"
        data-variation={variation}
        data-error={error || undefined}
        className={cn(
          inputVariants({ variation, size, error, showBottomLine }),
          // Icon slots inherit the shared state colour; 16px default size.
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          iconStateClass,
          fieldClassName,
        )}
      >
        {leftSlot != null && (
          <span
            data-slot="input-leading"
            aria-hidden="true"
            className="flex items-center"
          >
            {leftSlot}
          </span>
        )}
        <input
          id={id}
          data-slot="input"
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={hintId}
          className={cn(
            // Typography (Figma `body-03`) + fill the row. `min-w-0` lets the
            // input shrink inside the flex row instead of overflowing.
            "body-03 w-full min-w-0 bg-transparent outline-none",
            // Typed text + caret colour (Figma `input-foreground-accent`).
            "text-input-foreground-accent caret-input-foreground-accent",
            // Placeholder colour (Figma `input-foreground-muted`).
            "placeholder:text-input-foreground-muted",
            // Disabled text goes muted; keep the not-allowed cursor.
            "disabled:cursor-not-allowed disabled:text-input-foreground-muted",
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightSlot != null && (
          // NOT aria-hidden: the trailing slot may host an interactive control
          // (e.g. SearchBar's clear button) that must stay reachable by AT +
          // keyboard, and a focusable element inside aria-hidden is an ARIA
          // violation. Decorative bare-<svg> icons are silent to AT on their own
          // (no role / no accessible name), so dropping aria-hidden here does not
          // make them announced. The leading slot stays decorative (aria-hidden).
          <span data-slot="input-trailing" className="flex items-center">
            {rightSlot}
          </span>
        )}
      </div>

      {hint != null && (
        <p
          id={hintId}
          data-slot="input-hint"
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

export { Input };
