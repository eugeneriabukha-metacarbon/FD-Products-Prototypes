"use client";

import * as React from "react";
import { CheckIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { checkboxVariants } from "./checkboxVariants";

export interface CheckboxProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "size"
> {
  /**
   * Convenience change callback with the next checked state already
   * extracted. Fires alongside (not instead of) the native `onChange`.
   * Controlled/uncontrolled usage is the standard input contract:
   * `defaultChecked` (uncontrolled, the default) or `checked` + a change
   * handler (controlled).
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Class names for the outer wrapper span (positions the ✓ indicator). */
  wrapperClassName?: string;
}

/**
 * Checkbox control — the Figma `checkbox-control` set (node 5066:9964),
 * rendered as a real `<input type="checkbox">` so keyboard (Space), forms,
 * and label association all come from the platform.
 *
 * Ships without a label (the Figma set is the bare 20×20 control): associate
 * one by wrapping in a `<label>` or via `htmlFor`/`id`; icon-style usages
 * need an `aria-label`.
 *
 * The FD Figma set has no indeterminate variant; if a consumer ever needs the
 * native `indeterminate` flag (DOM-only, not an attribute), set it on the
 * node via `ref`.
 */
function Checkbox({
  className,
  wrapperClassName,
  onChange,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  // Fold the convenience callback into the native change event — the input
  // element stays the single source of truth for checked state.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.currentTarget.checked);
  };

  // The indicator can't live inside the input (void element), so a wrapper
  // span overlays it; the input's `peer` class reveals it on :checked.
  return (
    <span className={cn("relative inline-flex shrink-0", wrapperClassName)}>
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(checkboxVariants(), className)}
        {...props}
        onChange={handleChange}
      />
      {/* The ✓ (Figma `CheckIcon`, 16px inside the 20px box). Decorative —
          the input itself carries the checked semantics for AT. */}
      <CheckIcon
        aria-hidden="true"
        weight="regular"
        data-slot="checkbox-indicator"
        className={cn(
          "pointer-events-none invisible absolute inset-0 m-auto size-4",
          "text-brand-primary-foreground",
          "peer-checked:visible peer-disabled:text-foreground-muted",
        )}
      />
    </span>
  );
}

export { Checkbox };
