"use client";

import * as React from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { useDebouncedCallback } from "../lib/use-debounced-callback";
import { Input } from "../input/Input";

/** Default debounce for the `onSearch` callback (ms). */
const DEFAULT_DEBOUNCE_MS = 300;

export interface SearchBarProps extends Omit<
  React.ComponentProps<"input">,
  "size"
> {
  /**
   * Fired with the current value, **debounced** by `debounceMs` (default 300).
   * Runs ALONGSIDE the native `onChange` (which still fires immediately per
   * keystroke — ADR-0010: the native input is the source of truth). Also fired
   * immediately (debounce cancelled) on clear (`""`) and on Enter.
   */
  onSearch?: (value: string) => void;
  /** Debounce delay for `onSearch`, in milliseconds. Default `300`. */
  debounceMs?: number;
  /** Helper text below the field (forwarded to Input's `hint`). */
  hint?: React.ReactNode;
  /** Class names for Input's outer wrapper (the vertical field/hint stack). */
  wrapperClassName?: string;
  /** Class names for Input's field row (border/background box), not the `<input>`. */
  fieldClassName?: string;
}

/**
 * SearchBar — a search field composed from `<Input>` (it renders Input; it does
 * NOT fork Input's markup). Fixed to Input's `field` variation at `lg` size (no
 * `label`), with a leading MagnifyingGlass icon and a trailing clear (X) button
 * that appears only when there's a value.
 *
 * Value model (ADR-0010): the native `<input>` is the single source of truth.
 * Use it uncontrolled (`defaultValue`) or controlled (`value` + `onChange`);
 * `onChange` fires immediately on every keystroke and is never replaced.
 * `onSearch` is a debounced convenience on top, fired ALONGSIDE `onChange`.
 *
 * Clear-button visibility is keyed off whether the field currently has a value.
 * We track that as a minimal boolean UI flag (`hasValue`) — NOT a mirror of the
 * value string: the actual text is always read from the input via `ref` (for
 * `onSearch`/flush), so the native input stays the source of truth. For
 * controlled use the flag is derived from the `value` prop each render; for
 * uncontrolled use it seeds from `defaultValue` and updates on each input event.
 *
 * `ref` (a normal React 19 prop) forwards to the underlying `<input>`.
 */
function SearchBar({
  onSearch,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  hint,
  wrapperClassName,
  fieldClassName,
  className,
  disabled,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  ref,
  ...props
}: SearchBarProps) {
  const isControlled = value !== undefined;

  // The DOM input is the source of truth for the value string. We keep our own
  // node ref to read/clear/focus it, and merge the caller's `ref` onto it.
  const innerRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  // Minimal UI flag: does the field currently hold text? Seeds from the initial
  // value (controlled `value` or uncontrolled `defaultValue`). This is NOT a
  // value mirror — the string itself is always read from the DOM node.
  const [hasValueState, setHasValueState] = React.useState(
    () => String(value ?? defaultValue ?? "").length > 0,
  );
  // Controlled: derive directly from the prop each render (source of truth is the
  // parent's `value`). Uncontrolled: use the locally tracked flag.
  const hasValue = isControlled
    ? String(value ?? "").length > 0
    : hasValueState;

  const debouncedSearch = useDebouncedCallback((next: string) => {
    onSearch?.(next);
  }, debounceMs);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Immediate native callback first (ADR-0010) — never replaced.
    onChange?.(event);
    if (!isControlled) setHasValueState(event.currentTarget.value.length > 0);
    // Debounced convenience alongside it.
    debouncedSearch(event.currentTarget.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    // Enter commits the search now: fire onSearch immediately and drop the
    // pending debounce (no trailing double-fire).
    if (event.key === "Enter") {
      debouncedSearch.flush(event.currentTarget.value);
    }
  };

  const handleClear = () => {
    const input = innerRef.current;
    if (!input) return;

    // Clear the value via the native setter so a CONTROLLED consumer's onChange
    // fires with the empty value and its state updates. Setting `input.value`
    // directly wouldn't emit an event and React wouldn't see it on a controlled
    // input; instead we use the prototype value setter + dispatch a bubbling
    // `input` event, which React's synthetic onChange listens to. This is the
    // standard "programmatic native input change" technique and keeps the native
    // input the source of truth for both controlled and uncontrolled callers.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    if (!isControlled) setHasValueState(false);

    // onSearch("") fires immediately; cancel any pending debounced call.
    debouncedSearch.cancel();
    onSearch?.("");

    // Return focus to the field after clearing (the button will unmount).
    input.focus();
  };

  const showClear = hasValue && !disabled;

  return (
    <Input
      type="search"
      variation="field"
      size="lg"
      ref={setInputRef}
      disabled={disabled}
      hint={hint}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn(
        // Suppress the browser's native `type=search` clear affordance
        // (WebKit/Chrome render `::-webkit-search-cancel-button`) — SearchBar
        // provides its own clear button, so the native one would show a second
        // "X". `hidden` (display:none) is used rather than `appearance-none`:
        // that pseudo-element is governed by `-webkit-appearance`, which the
        // unprefixed `appearance:none` Tailwind emits does not affect.
        // Caller `className` is merged after and can still override.
        "[&::-webkit-search-cancel-button]:hidden",
        className,
      )}
      wrapperClassName={wrapperClassName}
      fieldClassName={fieldClassName}
      leftSlot={<MagnifyingGlassIcon weight="regular" />}
      rightSlot={
        showClear ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            data-slot="search-clear"
            className={cn(
              // Reset native button chrome; inherit the field's icon colour.
              "inline-flex cursor-pointer items-center justify-center rounded-xs bg-transparent p-0 text-current",
              // Standard ADR-0010 system focus ring (this button is a momentary
              // control — the ADR-0011 no-ring exception applies only to the
              // text input itself, NOT to this button).
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus",
            )}
          >
            <XIcon weight="regular" aria-hidden="true" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
}

export { SearchBar };
