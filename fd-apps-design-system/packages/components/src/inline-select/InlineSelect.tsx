"use client";

import * as React from "react";

import { SelectListbox } from "../select/SelectListbox";
import { useSelectListbox } from "../select";
import type { SelectOption } from "../select";
import { InlineSelectTrigger } from "./InlineSelectTrigger";
import { type InlineSelectVariantsProps } from "./inlineSelectVariants";

export interface InlineSelectProps extends Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> {
  /** The options to choose from (array-of-data API). */
  options: SelectOption[];
  /** Controlled selection (single). */
  value?: string;
  /** Uncontrolled initial selection (single). */
  defaultValue?: string;
  /** Fires with the next selected value. */
  onValueChange?: (value: string) => void;
  /** `primary` (neutral foreground, default) | `secondary` (brand foreground). */
  variation?: NonNullable<InlineSelectVariantsProps["variation"]>;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Leading adornment before the label (decorative, 16px). */
  leadingSlot?: React.ReactNode;
  /** Disabled — the trigger won't open. */
  disabled?: boolean;
  /** Form field name (mirrors the value into a hidden input for form submission). */
  name?: string;
}

/**
 * InlineSelect — a single-select styled as inline text (NO field box), for use
 * inline in a sentence, a card header, or a toolbar (Figma node 4926:5462). The
 * trigger is the value label + a small filled caret; choosing opens a portaled
 * dropdown reusing `Select`'s `SelectListbox`.
 *
 * Single-select only (no multi): `value` / `defaultValue` are `string`s and
 * `onValueChange` emits a `string`. Uncontrolled by default (`defaultValue`)
 * with a controlled escape hatch (`value` + `onValueChange`). Behaviour (open,
 * keyboard model, type-ahead, active-descendant, reposition, outside-click) is
 * shared with `Select` via the `useSelectListbox` hook. `ref` is a normal React
 * 19 prop, forwarded to the trigger button.
 */
function InlineSelect({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  variation = "primary",
  placeholder = "Select",
  leadingSlot,
  disabled,
  name,
  id: idProp,
  className,
  ref,
  ...props
}: InlineSelectProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  const {
    selected,
    open,
    setTriggerRef,
    triggerProps,
    listboxProps,
    text,
    isPlaceholder,
  } = useSelectListbox({
    options,
    // Normalize the single-select public value to the hook's array form.
    value: valueProp,
    defaultValue,
    // The hook emits `string | string[]`; in single mode it is always a
    // `string`, so narrow before handing it to the public single callback.
    onValueChange: onValueChange
      ? (next) => onValueChange(Array.isArray(next) ? (next[0] ?? "") : next)
      : undefined,
    multiple: false,
    disabled,
    id,
    ref,
    placeholder,
  });

  return (
    <>
      <InlineSelectTrigger
        ref={setTriggerRef}
        id={id}
        variation={variation}
        open={open}
        displayText={text}
        isPlaceholder={isPlaceholder}
        leadingSlot={leadingSlot}
        disabled={disabled}
        className={className}
        {...triggerProps}
        {...props}
      />
      {/* Form participation: the visible trigger is a <button>, so mirror the
          selected value into a hidden input for `FormData` when `name` is set. */}
      {name != null && (
        <input type="hidden" name={name} value={selected[0] ?? ""} />
      )}
      {open && (
        <SelectListbox
          {...listboxProps}
          // Size the dropdown to its content rather than the narrow inline
          // trigger (clamped to the viewport). See `computeListboxHorizontal`.
          widthMode="auto"
          aria-label={props["aria-label"]}
        />
      )}
    </>
  );
}

export { InlineSelect };
