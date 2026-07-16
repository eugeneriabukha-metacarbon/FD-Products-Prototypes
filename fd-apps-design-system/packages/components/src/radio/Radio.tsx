"use client";

import * as React from "react";
import { CircleIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { radioVariants } from "./radioVariants";

export interface RadioProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "size"
> {
  /**
   * Convenience change callback with the next checked state already
   * extracted. Fires alongside (not instead of) the native `onChange`.
   * Radio semantics: the platform fires `change` only when this radio
   * BECOMES checked (never on deselection by a sibling), so the payload is
   * `true` in practice — the boolean type keeps the ADR-0010 `on<Value>Change`
   * contract shared with Checkbox. Controlled/uncontrolled usage is the
   * standard input contract: `defaultChecked` (uncontrolled, the default) or
   * `checked` + a change handler (controlled).
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Class names for the outer wrapper span (positions the ● indicator). */
  wrapperClassName?: string;
}

/**
 * Radio control — the Figma `radio-control` set (node 5117:5677), rendered as
 * a real `<input type="radio">` so grouping (`name`), keyboard behavior
 * (arrow keys move selection within a group; only the checked radio is in the
 * tab order), forms, and label association all come from the platform. There
 * is no RadioGroup wrapper: give radios the same `name` and wrap the set in a
 * `<fieldset>` with a `<legend>` for a group label.
 *
 * Ships without a label (the Figma set is the bare 20×20 control): associate
 * one by wrapping in a `<label>` or via `htmlFor`/`id`; icon-style usages
 * need an `aria-label`.
 */
function Radio({
  className,
  wrapperClassName,
  onChange,
  onCheckedChange,
  ...props
}: RadioProps) {
  // Fold the convenience callback into the native change event — the input
  // element stays the single source of truth for checked state (ADR-0010).
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.currentTarget.checked);
  };

  // The indicator can't live inside the input (void element), so a wrapper
  // span overlays it; the input's `peer` class reveals it on :checked.
  return (
    <span className={cn("relative inline-flex shrink-0", wrapperClassName)}>
      <input
        type="radio"
        data-slot="radio"
        className={cn(radioVariants(), className)}
        {...props}
        onChange={handleChange}
      />
      {/* The ● dot (Figma `CircleIcon`, 12px inside the 20px circle).
          Decorative — the input itself carries the checked semantics for AT. */}
      <CircleIcon
        aria-hidden="true"
        weight="fill"
        data-slot="radio-indicator"
        className={cn(
          "pointer-events-none invisible absolute inset-0 m-auto size-3",
          "text-brand-primary-foreground",
          "peer-checked:visible peer-disabled:text-foreground-muted",
        )}
      />
    </span>
  );
}

export { Radio };
