"use client";

import * as React from "react";

import { selectTriggerLabel, type SelectOption } from "./SelectTrigger";

export type { SelectOption } from "./SelectTrigger";

/** How long (ms) a type-ahead buffer accumulates before it resets. */
const TYPEAHEAD_RESET_MS = 500;

/**
 * Find the next enabled option index moving `dir` (1 = down, -1 = up) from
 * `from`, skipping `disabled` rows and clamping at the ends (no wrap). If no
 * enabled row exists in that direction, `from` is returned unchanged. Pure —
 * unit-testable in isolation.
 */
export function nextEnabledIndex(
  options: SelectOption[],
  from: number,
  dir: 1 | -1,
): number {
  for (let i = from + dir; i >= 0 && i < options.length; i += dir) {
    if (!options[i].disabled) return i;
  }
  return from;
}

/** First enabled index (used to seed the active row when opening). */
export function firstEnabledIndex(options: SelectOption[]): number {
  const i = options.findIndex((o) => !o.disabled);
  return i;
}

/** Normalize the `string | string[]` public value to the internal array form. */
function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Options for {@link useSelectListbox}. Trigger-agnostic — any button-shaped
 *  trigger (field, line, inline) can drive the same listbox orchestration. */
export interface UseSelectListboxOptions {
  /** The options to choose from (array-of-data API). */
  options: SelectOption[];
  /** Controlled selection. `string` in single mode, `string[]` in multi. */
  value?: string | string[];
  /** Uncontrolled initial selection. */
  defaultValue?: string | string[];
  /** Fires with the next selection — `string` (single) or `string[]` (multi). */
  onValueChange?: (value: string | string[]) => void;
  /** Single (default) vs multi select. */
  multiple?: boolean;
  /** Disabled — the trigger won't open and keys are ignored. */
  disabled?: boolean;
  /**
   * Whether a single-select pick closes the listbox. Default `true` (Select /
   * InlineSelect behaviour, unchanged). When `false`, single-select does NOT
   * close on pick — it stays open like multi, keeping the active row on the
   * chosen option. Multi never closes on pick regardless of this flag. Filter
   * passes `false` (its dropdown persists so several picks / a Reset are
   * possible without reopening).
   */
  closeOnSelect?: boolean;
  /** Base id for the widget (trigger id); the listbox id derives from it. */
  id: string;
  /** Consumer's forwarded ref to the trigger button (merged with the internal ref). */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * The ARIA popup + activedescendant attributes a trigger button must spread.
 * `role` is intentionally NOT included — a field trigger uses `role="combobox"`
 * to legitimize `aria-activedescendant`/`aria-controls` (ADR-0013 #3), which it
 * sets itself; these attributes are the shared wiring both triggers need.
 */
export interface SelectTriggerAriaProps {
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  "aria-haspopup": "listbox";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  "aria-activedescendant": string | undefined;
}

/** The props a trigger passes straight to `<SelectListbox>` (minus the a11y name). */
export interface SelectListboxOwnProps {
  id: string;
  options: SelectOption[];
  selected: string[];
  multiple: boolean;
  activeIndex: number;
  anchorRect: DOMRect | null;
  onSelect: (value: string) => void;
  onActiveChange: (index: number) => void;
}

/** Everything a trigger + `<SelectListbox>` need to render a select. */
export interface UseSelectListboxResult {
  /** Currently selected values (normalized to an array for both modes). */
  selected: string[];
  /** Whether the listbox is open (flips the trigger caret + `aria-expanded`). */
  open: boolean;
  /** Callback ref for the trigger button (merges the consumer's ref + internal). */
  setTriggerRef: (node: HTMLButtonElement | null) => void;
  /** id of the listbox element (the trigger's `aria-controls` target). */
  listboxId: string;
  /** id of the active `aria-activedescendant` row, or undefined when none. */
  activeId: string | undefined;
  /** ARIA + handler props to spread on the trigger button. */
  triggerProps: SelectTriggerAriaProps;
  /** Props to spread on `<SelectListbox>` (supply the a11y name separately). */
  listboxProps: SelectListboxOwnProps;
  /** Close the listbox; `restoreFocus` returns focus to the trigger. */
  closeListbox: (restoreFocus: boolean) => void;
  /** Resolved display text for the trigger (from `selectTriggerLabel`). */
  text: string;
  /** Whether `text` is the placeholder (muted) vs a real value. */
  isPlaceholder: boolean;
  /**
   * Clear the selection, committing the empty value through the same
   * controlled/uncontrolled + `onValueChange` path as a normal pick (single →
   * `""`, multi → `[]`). Does NOT close the listbox — the caller decides. Used
   * by Filter's Reset footer.
   */
  reset: () => void;
}

/**
 * Trigger-agnostic orchestration for a select-style listbox widget — extracted
 * from `Select` so alternate triggers (`InlineSelect`) reuse the exact same
 * behavior. Owns:
 *
 * - selection state (controlled via `value`, uncontrolled via `defaultValue`),
 * - `open` / `activeIndex` / `anchorRect`, the merged trigger ref,
 * - the type-ahead buffer, reposition-on-scroll/resize, outside-`pointerdown`
 *   close, the full keydown model (↑/↓/Home/End/Enter/Space/Escape/Tab +
 *   type-ahead, disabled-skip, no-wrap clamp), and the select/click handlers.
 *
 * Focus stays on the trigger; the roving highlight lives in the portaled
 * listbox via `aria-activedescendant` (ADR-0013 #2). The consumer supplies a
 * `placeholder` to `selectTriggerLabel` itself if it needs the resolved text —
 * this hook exposes the raw pieces; `text`/`isPlaceholder` are computed against
 * the passed `placeholder` below.
 */
export function useSelectListbox(
  options: UseSelectListboxOptions & { placeholder?: string },
): UseSelectListboxResult {
  const {
    options: opts,
    value: valueProp,
    defaultValue,
    onValueChange,
    multiple = false,
    disabled = false,
    closeOnSelect = true,
    id,
    ref,
    placeholder = "Select",
  } = options;

  const listboxId = `${id}-listbox`;

  // Selection state: controlled when `value` is provided, else uncontrolled.
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() =>
    toArray(defaultValue),
  );
  const selected = isControlled ? toArray(valueProp) : uncontrolled;

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  // Merge the forwarded ref with our internal ref (both point at the button).
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref != null) ref.current = node;
    },
    [ref],
  );

  // Type-ahead buffer + last-keystroke timestamp (ref → no re-render churn).
  const typeahead = React.useRef({ buffer: "", at: 0 });

  const commit = (next: string[]) => {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(multiple ? next : (next[0] ?? ""));
  };

  const measure = React.useCallback(() => {
    const node = triggerRef.current;
    if (node) setAnchorRect(node.getBoundingClientRect());
  }, []);

  const openListbox = React.useCallback(() => {
    measure();
    // Seed the active row at the first selected option, else the first enabled.
    const selectedIndex = opts.findIndex((o) => selected.includes(o.value));
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(opts),
    );
    setOpen(true);
  }, [measure, opts, selected]);

  const closeListbox = React.useCallback((restoreFocus: boolean) => {
    setOpen(false);
    setActiveIndex(-1);
    setAnchorRect(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const next = selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue];
      commit(next);
      // Multi stays open; keep the active row on the toggled option.
      const idx = opts.findIndex((o) => o.value === optionValue);
      if (idx >= 0) setActiveIndex(idx);
    } else {
      commit([optionValue]);
      if (closeOnSelect) {
        closeListbox(true);
      } else {
        // Stay open (Filter): keep the active row on the just-chosen option so
        // the keyboard highlight tracks the new selection.
        const idx = opts.findIndex((o) => o.value === optionValue);
        if (idx >= 0) setActiveIndex(idx);
      }
    }
  };

  // Clear the whole selection through the same commit path (single → "", multi
  // → []). Leaves the listbox open/closed as-is — the caller decides. A plain
  // closure (like `handleSelect`) so it always sees the current `commit`.
  const reset = () => {
    commit([]);
  };

  // Reposition while open: capture-phase scroll (any scroll container) + resize.
  React.useEffect(() => {
    if (!open) return;
    const onReflow = () => measure();
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [open, measure]);

  // Outside-click: pointerdown outside both the trigger and the portaled panel
  // closes (without restoring focus — the user is interacting elsewhere).
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const trigger = triggerRef.current;
      const listbox = document.getElementById(listboxId);
      // In footer mode the `<ul role="listbox">` is wrapped in a panel `<div>`
      // that also holds the footer (e.g. Filter's Reset); a click on the footer
      // is INSIDE the widget, so test the panel ancestor too (falls back to the
      // `<ul>` itself when there is no panel — Select / InlineSelect).
      const panel =
        listbox?.closest("[data-slot=select-listbox-panel]") ?? listbox;
      if (trigger?.contains(target) || panel?.contains(target)) return;
      closeListbox(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, listboxId, closeListbox]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          openListbox();
        } else {
          setActiveIndex((i) => nextEnabledIndex(opts, i < 0 ? -1 : i, 1));
        }
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openListbox();
        } else {
          setActiveIndex((i) =>
            i < 0 ? firstEnabledIndex(opts) : nextEnabledIndex(opts, i, -1),
          );
        }
        return;
      }
      case "Home": {
        if (!open) return;
        event.preventDefault();
        setActiveIndex(firstEnabledIndex(opts));
        return;
      }
      case "End": {
        if (!open) return;
        event.preventDefault();
        setActiveIndex(nextEnabledIndex(opts, opts.length, -1));
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!open) {
          openListbox();
        } else if (activeIndex >= 0 && !opts[activeIndex]?.disabled) {
          handleSelect(opts[activeIndex].value);
        }
        return;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          closeListbox(true);
        }
        return;
      }
      case "Tab": {
        // Tab moves focus away → close (without hijacking the focus move).
        if (open) closeListbox(false);
        return;
      }
      default: {
        // Type-ahead: printable single chars jump to the next matching label.
        if (
          event.key.length === 1 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey
        ) {
          if (!open) openListbox();
          const now =
            typeof performance !== "undefined" ? performance.now() : Date.now();
          const t = typeahead.current;
          t.buffer =
            now - t.at > TYPEAHEAD_RESET_MS ? event.key : t.buffer + event.key;
          t.at = now;
          const query = t.buffer.toLowerCase();
          const match = opts.findIndex(
            (o) => !o.disabled && o.label.toLowerCase().startsWith(query),
          );
          if (match >= 0) setActiveIndex(match);
        }
      }
    }
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    if (open) closeListbox(true);
    else openListbox();
  };

  const { text, isPlaceholder } = selectTriggerLabel(
    opts,
    selected,
    placeholder,
  );

  const activeId =
    open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  return {
    selected,
    open,
    setTriggerRef,
    listboxId,
    activeId,
    triggerProps: {
      onClick: handleTriggerClick,
      onKeyDown: handleKeyDown,
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      "aria-controls": open ? listboxId : undefined,
      "aria-activedescendant": activeId,
    },
    listboxProps: {
      id: listboxId,
      options: opts,
      selected,
      multiple,
      activeIndex,
      anchorRect,
      onSelect: handleSelect,
      onActiveChange: setActiveIndex,
    },
    closeListbox,
    text,
    isPlaceholder,
    reset,
  };
}
