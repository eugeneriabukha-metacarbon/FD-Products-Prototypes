"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { SelectListbox } from "../select/SelectListbox";
import { useSelectListbox } from "../select";
import type { SelectOption } from "../select";
import { FilterTrigger } from "./FilterTrigger";

export type { SelectOption } from "../select";

export interface FilterProps extends Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> {
  /** The options to choose from (array-of-data API, shared with the select family). */
  options: SelectOption[];
  /** Controlled selection. `string` in single mode, `string[]` in multi. */
  value?: string | string[];
  /** Uncontrolled initial selection. */
  defaultValue?: string | string[];
  /** Fires with the next selection — `string` (single) or `string[]` (multi). */
  onValueChange?: (value: string | string[]) => void;
  /** Single (default) vs multi select. */
  multiple?: boolean;
  /**
   * The filter's name. In single-select it is the trigger text ONLY when nothing
   * is chosen (a pick replaces it with the option's label). In multi-select it
   * is ALWAYS the trigger text, with a count badge alongside it.
   */
  label: string;
  /** Disabled — the trigger won't open. */
  disabled?: boolean;
}

/**
 * Filter — a filter-chip dropdown (Figma `base-filter`, node 5026:36907). NOT a
 * form field: a pill trigger that opens the shared select listbox, exactly as
 * `InlineSelect` reuses that listbox behind an inline trigger. Single or multi
 * in one component; the dropdown carries a Reset footer.
 *
 * Behaviour is shared with `Select` / `InlineSelect` via `useSelectListbox`
 * (selection state, keyboard model, type-ahead, activedescendant, reposition,
 * outside-click) with two Filter-specific choices:
 * - `closeOnSelect: false` — a single-select pick does NOT close the dropdown
 *   (it stays open like multi), so several picks / a Reset are possible without
 *   reopening. A single pick still REPLACES the prior selection.
 * - the dropdown's `footer` slot renders a **Reset** ghost button, disabled when
 *   nothing is selected, that clears the selection (via the hook's `reset()`)
 *   and keeps the dropdown open.
 *
 * Trigger content differs from `Select`:
 * - **single**: the selected option's label (or `label` when empty); no badge.
 * - **multi**: always the static `label`, plus a count badge when ≥1 selected.
 *
 * Uncontrolled by default (`defaultValue`) with a controlled escape hatch
 * (`value` + `onValueChange`). `ref` is a normal React 19 prop, forwarded to the
 * trigger button.
 */
function Filter({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  label,
  disabled,
  id: idProp,
  className,
  ref,
  ...props
}: FilterProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  const {
    selected,
    open,
    setTriggerRef,
    triggerProps,
    listboxProps,
    reset,
    text,
  } = useSelectListbox({
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    multiple,
    disabled,
    // Filter's dropdown persists after a pick (single stays open like multi).
    closeOnSelect: false,
    id,
    ref,
    // The single-select empty state shows the filter `label`, not a generic
    // "Select" placeholder — so `selectTriggerLabel`'s placeholder IS `label`.
    // (In multi the trigger text is always `label` regardless — see below.)
    placeholder: label,
  });

  // Trigger content model (differs from Select):
  // - single: the hook's resolved `text` — the selected option's label, or
  //   `label` when empty (the placeholder above); never a count badge.
  // - multi: ALWAYS the static `label`; the badge carries the count. (The hook's
  //   `text` would be "N selected" here, which we deliberately do NOT use.)
  const displayText = multiple ? label : text;
  const count = multiple ? selected.length : 0;

  const canReset = selected.length > 0;

  return (
    <>
      <FilterTrigger
        ref={setTriggerRef}
        id={id}
        displayText={displayText}
        count={count}
        open={open}
        disabled={disabled}
        // A `role="combobox"` does NOT take its accessible name from its text
        // content (that content is the value), so name it with the filter
        // `label` — stable across value/badge changes. A consumer `aria-label` /
        // `aria-labelledby` in `...props` still wins.
        aria-label={label}
        className={className}
        {...triggerProps}
        {...props}
      />
      {open && (
        <SelectListbox
          {...listboxProps}
          // Size the dropdown to its content rather than the pill (clamped to
          // the viewport), like InlineSelect. See `computeListboxHorizontal`.
          widthMode="auto"
          aria-label={label}
          footer={
            <button
              type="button"
              data-slot="filter-reset"
              // Disabled (inert + not focusable) when nothing is selected; the
              // dropdown stays open on a reset click (the footer is inside the
              // portaled panel, so the outside-click handler treats it as
              // inside).
              disabled={!canReset}
              onClick={() => {
                if (canReset) reset();
              }}
              className={cn(
                // A ghost button styled as `button/neutral/secondary`
                // (`button-secondary-*`): foreground when enabled, muted when
                // disabled. System focus ring (ADR-0010/0014) — `outline-solid`
                // beside `outline-2` so it actually paints (TW4 gotcha).
                "button-01 inline-flex h-8 items-center rounded-xs bg-transparent",
                "outline-none transition-colors",
                "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                canReset
                  ? "cursor-pointer text-button-secondary-foreground hover:text-button-secondary-foreground-accent"
                  : "cursor-not-allowed text-button-secondary-foreground-muted",
              )}
            >
              Reset
            </button>
          }
        />
      )}
    </>
  );
}

export { Filter };
