"use client";

import * as React from "react";

import { SelectListbox } from "./SelectListbox";
import { SelectTrigger } from "./SelectTrigger";
import { useSelectListbox } from "./useSelectListbox";

export type { SelectOption } from "./SelectTrigger";
// Re-exported so existing importers (and the test suite) keep resolving the
// pure index helper from `./Select`; it now lives in the extracted hook.
export { nextEnabledIndex } from "./useSelectListbox";

export interface SelectProps extends Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> {
  /** The options to choose from (array-of-data API, not compound children). */
  options: import("./SelectTrigger").SelectOption[];
  /** Controlled selection. `string` in single mode, `string[]` in multi. */
  value?: string | string[];
  /** Uncontrolled initial selection. */
  defaultValue?: string | string[];
  /** Fires with the next selection — `string` (single) or `string[]` (multi). */
  onValueChange?: (value: string | string[]) => void;
  /** Single (default) vs multi select. */
  multiple?: boolean;
  /** `field` (bordered box, default) | `line` (bottom border only). */
  variation?: "field" | "line";
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Uppercase label above the field. */
  label?: React.ReactNode;
  /** Error state — destructive border/label/hint. */
  error?: boolean;
  /** Helper text below the field; destructive when `error`. */
  hint?: React.ReactNode;
  /** Leading adornment in the trigger (decorative). */
  leadingSlot?: React.ReactNode;
  /**
   * Toggles the resting visibility of the bottom line on the **`line`**
   * variation only (mirrors `Input`). Default `true` (line visible at rest).
   * When `false`, the bottom line is hidden at rest (transparent) but still
   * appears on focus (accent) and on error (destructive); the 1px `border-b` is
   * kept in all cases so there is no layout shift. Has NO effect on the `field`
   * variation.
   */
  showBottomLine?: boolean;
  /** Class names for the outer wrapper (the label/field/hint stack). */
  wrapperClassName?: string;
  /** Class names for the trigger field row. */
  fieldClassName?: string;
}

/**
 * Select — a shared base select with a custom, portaled dropdown. Single and
 * multi in one component; two visual variations (`field` / `line`); one `lg`
 * size. Uncontrolled by default (`defaultValue`) with a controlled escape hatch
 * (`value` + `onValueChange`).
 *
 * The trigger is a `<button>` styled as an input field (reusing `inputVariants`
 * — the Figma Select field IS the base-input field). The dropdown is a portaled
 * `role="listbox"` positioned from the trigger's rect, flipping above when short
 * on room and repositioning on scroll/resize. Focus stays on the trigger via
 * `aria-activedescendant` (no focus trap): ↑/↓/Home/End move the active row,
 * Enter/Space toggle, Escape closes and restores focus, type-ahead jumps to a
 * matching label, and disabled rows are skipped. `ref` is a normal React 19
 * prop, forwarded to the trigger button.
 *
 * The trigger-agnostic orchestration (selection state, open/active/anchor, the
 * keyboard model, type-ahead, reposition + outside-click) lives in the shared
 * `useSelectListbox` hook; this component wires the hook to the field trigger +
 * portaled listbox.
 */
function Select({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  variation = "field",
  placeholder = "Select",
  label,
  error = false,
  hint,
  leadingSlot,
  showBottomLine = true,
  disabled,
  id: idProp,
  className,
  wrapperClassName,
  fieldClassName,
  ref,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const hintId = hint != null ? `${id}-hint` : undefined;

  const {
    open,
    setTriggerRef,
    triggerProps,
    listboxProps,
    text,
    isPlaceholder,
  } = useSelectListbox({
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    multiple,
    disabled,
    id,
    ref,
    placeholder,
  });

  return (
    <>
      <SelectTrigger
        ref={setTriggerRef}
        id={id}
        variation={variation}
        error={error}
        showBottomLine={showBottomLine}
        open={open}
        displayText={text}
        isPlaceholder={isPlaceholder}
        label={label}
        hint={hint}
        hintId={hintId}
        leadingSlot={leadingSlot}
        disabled={disabled}
        className={className}
        wrapperClassName={wrapperClassName}
        fieldClassName={fieldClassName}
        {...triggerProps}
        {...props}
      />
      {open && (
        <SelectListbox
          {...listboxProps}
          aria-labelledby={label != null ? id : undefined}
          aria-label={label == null ? props["aria-label"] : undefined}
        />
      )}
    </>
  );
}

export { Select };
