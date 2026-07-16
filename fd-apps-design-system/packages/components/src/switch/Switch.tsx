"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { switchVariants } from "./switchVariants";

export interface SwitchProps extends Omit<
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
  /** Class names for the outer wrapper span (positions the sliding thumb). */
  wrapperClassName?: string;
}

/**
 * Switch control — the Figma `toggle-switch` set (node 5050:2204), rendered as
 * a real `<input type="checkbox" role="switch">`. A toggle switch is a
 * checkbox semantically (on/off), so the platform gives us Space to toggle,
 * form participation (`FormData`), and label association for free; the `switch`
 * ARIA role only refines the announcement ("on/off" instead of
 * "checked/unchecked"). This is the one difference from Checkbox — otherwise it
 * follows the ADR-0010 form-control conventions exactly (on = `:checked`, zero
 * React state, `onCheckedChange` alongside native `onChange`).
 *
 * The visual is a track (the styled input) plus a sliding thumb (a sibling
 * span, since a void `<input>` can't have children); the thumb slides via
 * `peer-checked:` translate. Ships without a label (the Figma set is the bare
 * 56×24 control): associate one by wrapping in a `<label>` or via
 * `htmlFor`/`id`; icon-style usages need an `aria-label`.
 */
function Switch({
  className,
  wrapperClassName,
  onChange,
  onCheckedChange,
  ...props
}: SwitchProps) {
  // Fold the convenience callback into the native change event — the input
  // element stays the single source of truth for checked state (ADR-0010).
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.currentTarget.checked);
  };

  // The thumb can't live inside the input (void element), so a wrapper span
  // overlays it; the input's `peer` class drives the thumb's color and slide.
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center",
        wrapperClassName,
      )}
    >
      <input
        type="checkbox"
        role="switch"
        data-slot="switch"
        className={cn(switchVariants(), className)}
        {...props}
        onChange={handleChange}
      />
      {/* The sliding thumb (Figma `knob`, 24×16 inside the 56×24 track).
          Decorative — the input itself carries the on/off semantics for AT.
          Off: sits left (translate-x-0); on: slides 22px right (46px inner
          track − 24px thumb). Colors track the input via `peer-*`. */}
      <span
        aria-hidden="true"
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute left-1 h-4 w-6 rounded-full transition-transform",
          // Off — dark knob at 90% opacity (Figma `opacity/90`)
          "bg-button-secondary-foreground opacity-90",
          "peer-checked:translate-x-5.5 peer-checked:bg-brand-primary-foreground peer-checked:opacity-100",
          // Disabled — muted knob whether on or off (per Figma)
          "peer-disabled:bg-button-secondary-foreground-muted peer-disabled:opacity-100",
          "peer-checked:peer-disabled:bg-button-primary-foreground-muted",
        )}
      />
    </span>
  );
}

export { Switch };
