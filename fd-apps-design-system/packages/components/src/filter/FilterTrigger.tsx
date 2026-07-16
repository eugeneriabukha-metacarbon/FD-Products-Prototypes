"use client";

import * as React from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import {
  filterTriggerVariants,
  filterCountBadgeVariants,
} from "./filterVariants";

export interface FilterTriggerProps extends Omit<
  React.ComponentProps<"button">,
  "value"
> {
  /**
   * The text shown in the pill. In single-select this is the selected option's
   * label (or the filter `label` when nothing is chosen); in multi-select it is
   * ALWAYS the static filter `label` (the count badge carries the selection).
   */
  displayText: string;
  /**
   * The number of selected options. Renders the count badge when ≥1 (multi
   * only — single-select passes `0` so no badge shows). No badge at `0`.
   */
  count?: number;
  /** Whether the listbox is open (up caret + foreground caret colour). */
  open?: boolean;
  /** id of the pill `<button>`. */
  id: string;
}

/**
 * The Filter trigger — a `<button type="button">` styled as a filter chip
 * (Figma `base-filter`, node 5026:36907): a `h-10` / `rounded-sm` / `px-3` pill
 * with the label, an optional count badge (multi), and a trailing caret that
 * points down when closed / up when open.
 *
 * The caret is muted (`card-primary-foreground-muted`) at rest and strengthens
 * to the full foreground on hover and while open (matching the Figma hover /
 * focused&active / active states). Focus is the ADR-0010/0014 system ring (a
 * chip is a button-shaped control, not a text field).
 *
 * Presentational leaf: all open/selection/keyboard orchestration and the ARIA
 * popup wiring (`aria-haspopup`/`-expanded`/`-controls`/`-activedescendant`)
 * live in `Filter`, which spreads them through `...props`. `ref` is a normal
 * React 19 prop, forwarded to the button.
 */
function FilterTrigger({
  displayText,
  count = 0,
  open = false,
  disabled = false,
  id,
  className,
  ref,
  ...props
}: FilterTriggerProps) {
  const Caret = open ? CaretUpIcon : CaretDownIcon;
  // Caret: muted at rest; foreground on hover and while open. Disabled locks it
  // muted (no hover strengthen — the chip is inert). `group-hover:` on the caret
  // reacts to the button's hover via the `group` class on the trigger.
  const caretColor = disabled
    ? "text-card-primary-foreground-muted"
    : open
      ? "text-card-primary-foreground"
      : "text-card-primary-foreground-muted group-hover:text-card-primary-foreground";

  return (
    <button
      type="button"
      id={id}
      ref={ref}
      // `combobox` legitimizes `aria-activedescendant` + `aria-controls` on the
      // trigger (a plain button role does not) — the activedescendant pattern
      // keeps focus here while the roving highlight lives in the portaled
      // listbox (ADR-0013 #3). The native <button> still supplies behaviour.
      role="combobox"
      data-slot="filter-trigger"
      data-open={open || undefined}
      disabled={disabled}
      className={cn("group", filterTriggerVariants({ disabled }), className)}
      {...props}
    >
      <span
        data-slot="filter-label"
        className={cn(
          "body-03 truncate",
          disabled
            ? "text-card-primary-foreground-muted"
            : "text-card-primary-foreground",
        )}
      >
        {displayText}
      </span>
      {count > 0 && (
        <span
          data-slot="filter-count"
          // Decorative — the selection count is already conveyed by the listbox
          // rows' `aria-selected`; the badge is a visual summary, so keep it out
          // of the a11y name to avoid a confusing "Label 1" trigger name.
          aria-hidden="true"
          className={filterCountBadgeVariants()}
        >
          {count}
        </span>
      )}
      <span
        data-slot="filter-caret"
        aria-hidden="true"
        className="flex items-center"
      >
        <Caret
          weight="fill"
          className={cn("size-3 transition-transform", caretColor)}
        />
      </span>
    </button>
  );
}

export { FilterTrigger };
