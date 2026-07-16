"use client";

import * as React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import {
  inlineSelectVariants,
  type InlineSelectVariantsProps,
} from "./inlineSelectVariants";

export interface InlineSelectTriggerProps
  extends
    Omit<React.ComponentProps<"button">, "value">,
    // `disabled` comes from the native button props (CVA's is nullable and
    // would clash), so drop it from the variant props here.
    Omit<InlineSelectVariantsProps, "disabled"> {
  /** Resolved display text (from the hook's `selectTriggerLabel`). */
  displayText: string;
  /** Whether `displayText` is the placeholder (muted) vs a real value. */
  isPlaceholder: boolean;
  /** Whether the listbox is open (flips the caret). */
  open?: boolean;
  /** Leading adornment (decorative — kept out of the a11y tree via `aria-hidden`). */
  leadingSlot?: React.ReactNode;
}

/**
 * The InlineSelect trigger — a `<button type="button">` styled as inline text
 * (NO field box): an optional 16px leading slot, the value label (`body-03`),
 * and a 12px filled caret that flips (`rotate-180`) when `open`. The value uses
 * the variation foreground colour; the placeholder + caret use the muted
 * variation colour (Figma node 4926:5462).
 *
 * Presentational leaf: all open/selection/keyboard orchestration and the ARIA
 * popup wiring (`aria-haspopup`/`aria-expanded`/`aria-controls`/
 * `aria-activedescendant`) live in `InlineSelect`, which spreads them through
 * `...props`. `ref` is a normal React 19 prop, forwarded to the button.
 */
function InlineSelectTrigger({
  variation = "primary",
  disabled = false,
  displayText,
  isPlaceholder,
  open = false,
  leadingSlot,
  className,
  ref,
  ...props
}: InlineSelectTriggerProps) {
  // Value = variation foreground; placeholder = muted variation. When disabled,
  // everything drops to the muted variation colour (Figma disabled state).
  const valueColor =
    variation === "secondary"
      ? "text-card-brand-secondary-foreground"
      : "text-card-primary-foreground";
  const mutedColor =
    variation === "secondary"
      ? "text-card-brand-secondary-foreground-muted"
      : "text-card-primary-foreground-muted";
  const labelColor = disabled || isPlaceholder ? mutedColor : valueColor;

  return (
    <button
      type="button"
      ref={ref}
      // `combobox` legitimizes `aria-activedescendant` + `aria-controls` on the
      // trigger (a plain button role does not) — the activedescendant pattern
      // keeps focus here while the roving highlight lives in the portaled
      // listbox (ADR-0013 #3). The native <button> still supplies behavior.
      role="combobox"
      data-slot="inline-select-trigger"
      data-variation={variation}
      disabled={disabled}
      className={cn(inlineSelectVariants({ variation, disabled }), className)}
      {...props}
    >
      {leadingSlot != null && (
        <span
          data-slot="inline-select-leading"
          aria-hidden="true"
          className={cn(
            "flex items-center [&_svg:not([class*='size-'])]:size-4",
            // The leading slot follows the caret/muted colour unless a real
            // value is shown, then it follows the value colour (like the label).
            labelColor,
          )}
        >
          {leadingSlot}
        </span>
      )}
      <span
        data-slot="inline-select-value"
        className={cn("body-03 truncate", labelColor)}
      >
        {displayText}
      </span>
      <span
        data-slot="inline-select-caret"
        aria-hidden="true"
        className="flex items-center"
      >
        <CaretDownIcon
          weight="fill"
          className={cn(
            "size-3 transition-transform",
            // Caret uses the muted variation colour (Figma resting state).
            mutedColor,
            open && "rotate-180",
          )}
        />
      </span>
    </button>
  );
}

export { InlineSelectTrigger };
