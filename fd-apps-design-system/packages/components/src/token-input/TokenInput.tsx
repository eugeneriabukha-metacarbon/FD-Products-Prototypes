"use client";

import * as React from "react";
import { InfoIcon, WarningIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { inputVariants } from "../input/inputVariants";
import { Token } from "./Token";

export interface TokenInputProps extends Omit<
  React.ComponentProps<"input">,
  "size" | "value" | "defaultValue" | "onChange"
> {
  /**
   * Committed tokens (controlled). Pair with `onChange`. When provided, the
   * component does not hold its own token state — the parent owns the array.
   */
  value?: string[];
  /**
   * Initial committed tokens (uncontrolled). Seeds the internal token state;
   * ignored once `value` is provided (controlled mode).
   */
  defaultValue?: string[];
  /**
   * Fires whenever a token is added or removed, with the full next tokens array.
   * The in-progress draft text lives in the native `<input>` and is NOT reported
   * here — the component's value is the committed tokens array.
   */
  onChange?: (tokens: string[]) => void;
  /**
   * Characters that commit the current draft into token(s). Default `[","]`.
   * When the draft contains any of these chars it is split on all of them,
   * trimmed, empties dropped, case-insensitive duplicates dropped, then pushed.
   * No key other than a separator commits (Enter never commits).
   */
  separators?: string[];
  /**
   * Opt-in: commit a non-empty trailing draft as one token on blur. Default
   * `false` (strict separator-only commit). Useful so a form never loses a
   * half-typed trailing entry.
   */
  commitOnBlur?: boolean;
  /**
   * Optional per-token predicate. Default `undefined` = no validation, nothing
   * is ever flagged (the generic component accepts anything). When provided,
   * tokens failing it are KEPT but flagged destructive ("flag but allow") and
   * expose `data-invalid`. The DS ships no domain-specific validator.
   */
  validate?: (token: string) => boolean;
  /**
   * Uppercase label shown above the field. When omitted the label row is not
   * rendered. Paired with the `<input>` via generated `id`/`htmlFor` (or your
   * own `id`) so the control is properly named for assistive tech.
   */
  label?: React.ReactNode;
  /**
   * Marks the field as not required — renders an "Optional" tag on the right of
   * the label row (Figma). Has no effect without a `label`.
   */
  optional?: boolean;
  /**
   * Helper text shown below the field, with a leading 16px icon (info by
   * default, warning when `error`). Linked to the input via `aria-describedby`.
   */
  hint?: React.ReactNode;
  /**
   * Field-level error state (distinct from per-token invalid flagging): sets
   * `aria-invalid`, turns the label, border, icon and hint to the destructive
   * accent, and swaps the hint icon to a warning — exactly as Input's `error`.
   */
  error?: boolean;
  /** Class names for the outer wrapper (the vertical label/field/hint stack). */
  wrapperClassName?: string;
  /** Class names for the field row (border/background box), not the `<input>`. */
  fieldClassName?: string;
}

/** Split a raw string on any of the separator chars. */
function splitOnSeparators(raw: string, separators: string[]): string[] {
  if (separators.length === 0) return [raw];
  // Build a character class from the (escaped) separators.
  const escaped = separators
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("");
  return raw.split(new RegExp(`[${escaped}]`));
}

/**
 * TokenInput — a domain-agnostic token / tag input. As the user types, text
 * commits into removable badges (tokens) on a configurable separator (default
 * comma). The DS ships it knowing NOTHING about emails or any other domain:
 * validation, copy and separators are all supplied at the call site (mirrors
 * SearchBar-over-Input layering — ship the generic primitive, let the app
 * specialize it).
 *
 * Composition — "reuse variants only": TokenInput does NOT render <Input> (its
 * badges wrap inside the field and its leading slot is decorative-by-contract).
 * It reuses `inputVariants({ variation: "field", size: "lg", error })` — the
 * hard-to-duplicate token/focus/error handling — and overrides layout only via
 * `cn` (tailwind-merge last-wins): `h-auto min-h-10 flex-wrap p-2`. The thin
 * label + hint rows are replicated locally, matching Input's exact classes. The
 * `field`/`lg` axes are fixed and NOT exposed as props (per the Figma scope).
 *
 * Value model: committed tokens are a `string[]` (controlled `value`+`onChange`
 * or uncontrolled `defaultValue`); the draft lives in the native `<input>` (the
 * source of truth for the in-progress text), read via a merged `ref`. `ref`
 * forwards to the `<input>`.
 */
function TokenInput({
  className,
  fieldClassName,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  separators = [","],
  commitOnBlur = false,
  validate,
  label,
  optional = false,
  hint,
  error = false,
  disabled,
  placeholder,
  id: idProp,
  onKeyDown,
  onBlur,
  onInput,
  ref,
  ...props
}: TokenInputProps) {
  const isControlled = value !== undefined;

  // Uncontrolled token state; controlled mode reads from the `value` prop.
  const [tokensState, setTokensState] = React.useState<string[]>(
    () => defaultValue ?? [],
  );
  const tokens = isControlled ? value : tokensState;

  // The DOM input is the source of truth for the draft text. Keep our own node
  // ref to read/clear/focus it, and merge the caller's `ref` onto it.
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

  // Associate the label + hint with the input (caller id, else a generated one).
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;

  // Commit the next tokens array via the right channel (controlled: onChange
  // only; uncontrolled: local state + onChange notification). Plain function
  // (not `useCallback`): consumed only by non-memoized event handlers, so
  // memoizing it yields no referential-stability benefit (matches SearchBar,
  // which reserves `useCallback` for `setInputRef` alone).
  const commitTokens = (next: string[]) => {
    if (!isControlled) setTokensState(next);
    onChange?.(next);
  };

  // Add one or more raw pieces to the tokens: trim, drop empties, drop
  // case-insensitive duplicates (against existing AND within the batch).
  const addTokens = (pieces: string[]) => {
    const next = [...tokens];
    const seen = new Set(next.map((t) => t.toLowerCase()));
    let changed = false;
    for (const piece of pieces) {
      const trimmed = piece.trim();
      if (trimmed === "") continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(trimmed);
      changed = true;
    }
    if (changed) commitTokens(next);
  };

  // Remove the token at `index`. A `"keyboard"` origin (Delete/Backspace on the
  // focused badge) restores focus to the input, since the removed badge's DOM
  // node — which had focus — is gone (leaving focus on <body> otherwise).
  const removeTokenAt = (index: number, origin?: "keyboard" | "pointer") => {
    commitTokens(tokens.filter((_, i) => i !== index));
    if (origin === "keyboard") innerRef.current?.focus();
  };

  const handleInput = (event: React.InputEvent<HTMLInputElement>) => {
    onInput?.(event);
    const input = event.currentTarget;
    const raw = input.value;
    // Commit when the draft contains any separator char.
    if (separators.some((sep) => raw.includes(sep))) {
      addTokens(splitOnSeparators(raw, separators));
      input.value = "";
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    // Backspace on an EMPTY draft removes the last token (keyboard affordance;
    // a removal, not a commit trigger — consistent with separator-only commit).
    if (
      event.key === "Backspace" &&
      event.currentTarget.value === "" &&
      tokens.length > 0
    ) {
      event.preventDefault();
      removeTokenAt(tokens.length - 1);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    // Opt-in: commit a non-empty trailing draft as one token on blur.
    if (commitOnBlur) {
      const input = event.currentTarget;
      if (input.value.trim() !== "") {
        addTokens([input.value]);
        input.value = "";
      }
    }
  };

  // Clicking anywhere in the field focuses the input — EXCEPT when the click
  // lands on a badge (the badge is focusable and its ✕ runs its own removal, so
  // neither should steal focus to the input). `onMouseDown` + preventDefault
  // keeps the input from losing a just-placed caret when clicking empty chrome.
  const handleFieldMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    // Clicks on a badge (its body OR its ✕) manage their own focus/removal — the
    // badge is itself focusable, so don't yank focus to the input.
    if (target.closest("[data-slot=token]")) return;
    if (target === innerRef.current) return;
    event.preventDefault();
    innerRef.current?.focus();
  };

  // Icon colour shared by the hint icon (matches Input): destructive on error,
  // muted on disabled, else the default input foreground.
  const iconStateClass = cn(
    error
      ? "text-input-destructive-foreground-accent"
      : "text-input-foreground",
    disabled && "text-input-foreground-muted",
  );

  const HintIcon = error ? WarningIcon : InfoIcon;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label != null && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            data-slot="input-label"
            className={cn(
              "caption-03-medium uppercase",
              error
                ? "text-input-destructive-foreground-accent"
                : "text-input-foreground",
              disabled && "text-input-foreground-muted",
            )}
          >
            {label}
          </label>
          {optional && (
            <span
              data-slot="input-optional"
              className="body-04 text-input-foreground-muted"
            >
              Optional
            </span>
          )}
        </div>
      )}

      <div
        data-slot="token-input-field"
        data-error={error || undefined}
        onMouseDown={handleFieldMouseDown}
        className={cn(
          // Reuse Input's field styling (bg/border/rounded/focus-within/error).
          inputVariants({ variation: "field", size: "lg", error }),
          // Layout overrides (tailwind-merge last-wins): grow with wrapped rows,
          // keep single-row min height, allow badges + input to wrap, uniform
          // spacing/2 inset (overrides field-lg's px-3 py-2).
          "h-auto min-h-10 flex-wrap gap-1 p-2",
          // Icon slots inherit the shared state colour.
          iconStateClass,
          fieldClassName,
        )}
      >
        {tokens.map((token, index) => (
          <Token
            key={`${token}-${index}`}
            value={token}
            invalid={validate ? !validate(token) : false}
            disabled={disabled}
            onRemove={(origin) => removeTokenAt(index, origin)}
          />
        ))}
        <input
          id={id}
          data-slot="token-input"
          disabled={disabled}
          placeholder={tokens.length === 0 ? placeholder : undefined}
          aria-invalid={error || undefined}
          aria-describedby={hintId}
          className={cn(
            // Typography + grow to fill remaining row width. `min-w-0` lets the
            // input shrink; a small basis keeps it usable when tokens wrap.
            "body-03 w-0 min-w-16 flex-1 bg-transparent outline-none",
            "text-input-foreground-accent caret-input-foreground-accent",
            "placeholder:text-input-foreground-muted",
            "disabled:cursor-not-allowed disabled:text-input-foreground-muted",
            className,
          )}
          ref={setInputRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          {...props}
        />
      </div>

      {hint != null && (
        <p
          id={hintId}
          data-slot="input-hint"
          className={cn(
            "body-04 flex items-center gap-1",
            error
              ? "text-input-destructive-foreground-accent"
              : "text-input-foreground",
            disabled && "text-input-foreground-muted",
          )}
        >
          <HintIcon
            aria-hidden="true"
            weight="regular"
            className="size-4 shrink-0"
          />
          {hint}
        </p>
      )}
    </div>
  );
}

export { TokenInput };
