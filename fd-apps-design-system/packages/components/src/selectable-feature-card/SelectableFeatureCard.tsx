"use client";

import * as React from "react";

import { Radio, type RadioProps } from "../radio";
import { cn } from "../lib/cn";
import {
  selectableFeatureCardVariants,
  selectableFeatureCardRowVariants,
  selectableFeatureCardTextVariants,
  selectableFeatureCardTrailingVariants,
  selectableFeatureCardBottomVariants,
} from "./selectableFeatureCardVariants";

export interface SelectableFeatureCardProps extends Omit<
  RadioProps,
  "className" | "wrapperClassName" | "title" | "children"
> {
  /** Title line (`body-02-medium`). Part of the radio's accessible name. */
  title: React.ReactNode;
  /** Optional subtitle line (`body-03`, muted). */
  subtitle?: React.ReactNode;
  /** Optional 24px trailing icon slot (decorative, `aria-hidden`). */
  trailing?: React.ReactNode;
  /**
   * `"editable"` enables the expandable bottom slot, revealed while the card is
   * selected. `"basic"` (default) has no bottom slot.
   */
  variation?: "basic" | "editable";
  /** Bottom-slot content — shown when `variation="editable"` and selected. */
  children?: React.ReactNode;
  /** Class names for the outer card container. */
  className?: string;
  /** Ref forwarded to the radio input. */
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * SelectableFeatureCard — the Figma `SelectableFeatureCard` (node `5075:8855`).
 * A single-select card: the leading slot is a real `Radio`, the whole row is a
 * `<label>` (so a click anywhere selects), and the radio input is the single
 * source of truth (ADR-0010). The selected border and the `editable`
 * bottom-slot reveal are derived purely from CSS (`:has(:checked)`), so the
 * component holds no state and behaves the same controlled or uncontrolled.
 *
 * Grouping is the platform's: give sibling cards the same `name` (there is no
 * group wrapper, matching the `Radio` API).
 */
function SelectableFeatureCard({
  title,
  subtitle,
  trailing,
  variation = "basic",
  children,
  className,
  ref,
  ...radioProps
}: SelectableFeatureCardProps) {
  const editable = variation === "editable";

  return (
    <div
      data-slot="selectable-feature-card"
      className={cn(selectableFeatureCardVariants(), className)}
    >
      <label className={selectableFeatureCardRowVariants({ editable })}>
        <Radio ref={ref} {...radioProps} />
        <span
          data-slot="selectable-feature-card-text"
          className={selectableFeatureCardTextVariants()}
        >
          <span className="body-02-medium truncate text-card-foreground">
            {title}
          </span>
          {subtitle != null && (
            <span className="body-03 truncate text-card-foreground-muted">
              {subtitle}
            </span>
          )}
        </span>
        {trailing != null && (
          <span
            data-slot="selectable-feature-card-trailing"
            aria-hidden="true"
            className={selectableFeatureCardTrailingVariants()}
          >
            {trailing}
          </span>
        )}
      </label>
      {editable && (
        <div
          data-slot="selectable-feature-card-bottom"
          className={selectableFeatureCardBottomVariants()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export { SelectableFeatureCard };
