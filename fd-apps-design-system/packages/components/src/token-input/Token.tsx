"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";

export interface TokenProps {
  /** The token's text label (also used to build the remove button's accessible name). */
  value: string;
  /**
   * Flags the token as failing the consumer's `validate` predicate. Recolours the
   * badge to the destructive accent and exposes `data-invalid` for styling/testing.
   * The token is still fully functional (removable) — "flag but allow".
   */
  invalid?: boolean;
  /**
   * Disables the remove button (the whole field is disabled). Keeps the badge
   * visible but non-interactive.
   */
  disabled?: boolean;
  /**
   * Fired when the token is removed. `origin` distinguishes a mouse click on the
   * ✕ (`"pointer"`) from a Delete/Backspace on the focused badge (`"keyboard"`),
   * so the caller can restore focus (to the input) after a keyboard removal.
   */
  onRemove: (origin?: "keyboard" | "pointer") => void;
}

/**
 * Token — the internal removable badge rendered inside <TokenInput> for each
 * committed token. NOT exported from the package (used once; a shared `Badge`
 * would be extracted only if a second consumer appears). Mirrors the Figma
 * `DiscardBadge` (node 561:12732) using the semantic `card-*` token layer.
 *
 * The WHOLE badge is a focusable, removable chip: it is the tab stop and carries
 * the STANDARD focus ring (ADR-0010/0012); hover/focus fills it to `card-accent`;
 * Delete/Backspace on a focused badge removes it. The trailing ✕ is a real
 * `<button type="button">` with an accessible name (`Remove {value}`) but is a
 * MOUSE-ONLY affordance — `tabIndex={-1}`, no ring of its own — so focus and the
 * ring belong to the badge, never the ✕. (The input's own no-ring exception,
 * ADR-0011, is unrelated — it applies only to the text input.)
 */
function Token({
  value,
  invalid = false,
  disabled = false,
  onRemove,
}: TokenProps) {
  return (
    <span
      data-slot="token"
      data-invalid={invalid || undefined}
      // The WHOLE badge is the tab stop and focus target (not the ✕). Disabled
      // badges are inert (removed from the tab order). Delete/Backspace on a
      // focused badge removes it — `origin: "keyboard"` lets the parent restore
      // focus to the input afterwards.
      tabIndex={disabled ? undefined : 0}
      onKeyDown={
        disabled
          ? undefined
          : (event) => {
              if (event.key === "Delete" || event.key === "Backspace") {
                event.preventDefault();
                onRemove("keyboard");
              }
            }
      }
      className={cn(
        // `group` so the ✕ can react to the badge's hover/focus (see below).
        // Height is exactly 22px = 20px (`body-03` line) + 2px border, with NO
        // vertical padding: this keeps the field a constant 40px tall
        // (badge 22 + 8+8 field padding + 1+1 field border = 40, empty or filled).
        // Adding `py-*` here would push the field past 40px once tokens appear.
        "group inline-flex items-center gap-1 min-w-5 rounded-sm border px-1",
        // Default: neutral card border + background. Invalid: destructive accent
        // recolour (there is no `card-destructive` token — reuse `input-destructive-*`).
        invalid
          ? "border-input-destructive-border bg-card-background"
          : "border-card-border bg-card-background",
        // Interactive chrome (only when not disabled): hover/focus fill to
        // `card-accent` (the DS's "stronger/hover" step up from `card-background`)
        // and the STANDARD ADR-0010/0012 focus ring on the whole badge — the ✕
        // itself carries no ring. `cursor-default` overrides the field's I-beam
        // so a badge doesn't read as "type here".
        !disabled &&
          "cursor-default hover:bg-card-accent focus-visible:bg-card-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus",
      )}
    >
      <span
        data-slot="token-label"
        className={cn(
          "body-03",
          // Disabled wins over invalid: the Figma disabled badge (561:12782) is
          // fully muted — a disabled field is inert, so no destructive red.
          disabled
            ? "text-card-foreground-muted"
            : invalid
              ? "text-input-destructive-foreground-accent"
              : "text-card-foreground",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Remove ${value}`}
        onClick={() => onRemove("pointer")}
        disabled={disabled}
        // Mouse-only affordance: NOT a tab stop and NO ring of its own — the whole
        // badge owns focus + the ring. Kept in the a11y tree (labelled) so screen
        // readers still surface the remove action.
        tabIndex={-1}
        data-slot="token-remove"
        className={cn(
          // Reset native button chrome.
          "inline-flex cursor-pointer items-center justify-center rounded-xs bg-transparent p-0",
          // Icon colour follows the badge state. Disabled wins (fully muted, no
          // hover strengthen — the badge is inert). Valid: muted at rest,
          // strengthens to `card-foreground` on badge hover/focus (via `group-*`).
          // Invalid: stays destructive (a strengthen would drop the flag).
          disabled
            ? "text-card-foreground-muted"
            : invalid
              ? "text-input-destructive-foreground-accent"
              : "text-card-foreground-muted group-hover:text-card-foreground group-focus-visible:text-card-foreground",
          "disabled:cursor-not-allowed",
        )}
      >
        <XIcon weight="regular" aria-hidden="true" className="size-4" />
      </button>
    </span>
  );
}

export { Token };
