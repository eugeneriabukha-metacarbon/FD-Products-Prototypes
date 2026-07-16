"use client";

import * as React from "react";

/**
 * CSS selector for the elements that can receive focus inside a trap. Mirrors
 * the common focusable set (links with href, non-disabled form controls, and
 * anything with a non-negative `tabindex`).
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * All tabbable descendants of `container`, in DOM order.
 *
 * Deliberately does NOT filter by visibility (`offsetParent`/rects): jsdom
 * performs no layout, so a visibility filter would drop every element under
 * test. A modal's card rarely contains hidden-but-matching focusables, and the
 * trap only ever cycles among what it returns, so the DOM-order set is
 * sufficient. Kept pure (no React) so it is unit-testable in isolation.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}

export interface UseFocusTrapOptions {
  /** Whether the trap is engaged (the dialog is open). */
  active: boolean;
  /** Ref to the element that focus is confined within (the dialog card). */
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Modal focus machinery for `Dialog.Content` — the piece ADR-0013 #2 explicitly
 * deferred for `Select` (which kept focus on its trigger via
 * `aria-activedescendant`). Dialog is a true modal, so on open it:
 *
 * 1. remembers the element that had focus (typically the trigger),
 * 2. moves focus into the container (first focusable, else the container
 *    itself — give it `tabIndex={-1}` for that fallback),
 * 3. locks body scroll, and
 * 4. traps `Tab` / `Shift+Tab` so focus cycles within the container and cannot
 *    escape to the page behind the backdrop.
 *
 * On close/unmount it releases the scroll lock and restores focus to the
 * remembered element. Dependency-free per ADR-0013 (no focus-trap library).
 */
export function useFocusTrap({
  active,
  containerRef,
}: UseFocusTrapOptions): void {
  React.useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // 1. Remember where focus was so we can restore it on close.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 2. Move focus into the dialog: first focusable, else the card itself.
    const initial = getFocusableElements(container)[0] ?? container;
    initial.focus();

    // 3. Lock body scroll while open.
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    // 4. Trap Tab within the container (capture phase so it wins over any
    //    bubble-phase handlers inside the dialog).
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        // Nothing to cycle to — keep focus on the card.
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
