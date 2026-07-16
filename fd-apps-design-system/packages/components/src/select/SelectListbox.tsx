"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../lib/cn";
import { scrollbarVariants } from "../lib/scrollbar";
import { Checkbox } from "../checkbox";
import {
  selectListboxVariants,
  selectListboxPanelVariants,
  selectListboxScrollVariants,
  selectListboxFooterVariants,
  selectOptionVariants,
} from "./selectVariants";
import type { SelectOption } from "./SelectTrigger";

/** Gap (px) between the trigger and the panel, and viewport safety margin. */
const LISTBOX_OFFSET = 4;
/**
 * Horizontal safety margin (px) kept between the panel and each viewport edge in
 * `"auto"` width mode. Bounds both the max width and the clamped left offset so a
 * content-sized panel never touches or overflows the viewport horizontally.
 */
const LISTBOX_MARGIN = 8;

/** How the portaled panel is sized horizontally (see {@link computeListboxHorizontal}). */
export type ListboxWidthMode = "trigger" | "auto";
/**
 * Hard cap on the panel height; the list scrolls internally past this. The
 * rendered cap is bound to the `--container-4xs` token (208px — see
 * `packages/tokens`) applied inline below; this numeric mirror is used only for
 * the flip-placement math as a fallback before the panel is measured. Keep the
 * two in sync if the token changes.
 */
const LISTBOX_MAX_HEIGHT = 208;

/**
 * Pure placement math for the portaled panel. Given the trigger's rect, the
 * measured panel height, and the viewport height, decide whether the panel goes
 * below (default) or flips above, and return the absolute `top`/`left`/`width`
 * (in document coordinates the caller offsets by scroll).
 *
 * Flips above only when there is no room below AND there is room above — so a
 * panel taller than either side stays below (then scrolls). Kept free of the
 * DOM/React so the branch is unit-testable.
 */
export function computeListboxPosition(
  anchor: DOMRect,
  listboxHeight: number,
  viewportHeight: number,
): { top: number; left: number; width: number; placement: "top" | "bottom" } {
  const flipsAbove =
    anchor.bottom + listboxHeight > viewportHeight &&
    anchor.top > listboxHeight;
  return {
    left: anchor.left,
    width: anchor.width,
    top: flipsAbove ? anchor.top - listboxHeight : anchor.bottom,
    placement: flipsAbove ? "top" : "bottom",
  };
}

/**
 * Pure horizontal-sizing math for the portaled panel — the width/left half of
 * placement, split out from {@link computeListboxPosition} (which owns the
 * vertical top/flip) so each branch is unit-testable and Select's behaviour is
 * provably untouched.
 *
 * - `"trigger"` (Select, default): the panel matches the trigger exactly — a
 *   fixed pixel `width` = `anchor.width` at `left` = `anchor.left`. Byte-for-byte
 *   what Select produced before this helper existed.
 * - `"auto"` (InlineSelect): the panel sizes to its content. `width` is left
 *   undefined (the caller applies `width: "max-content"` in the style), bounded
 *   by `minWidth` = `anchor.width` (never narrower than the trigger) and
 *   `maxWidth` = viewport − 2×margin (never wider than the viewport). `left` is
 *   clamped into `[margin, viewportWidth − margin − measuredWidth]` so the
 *   measured panel never overflows either edge; the lower bound wins if the
 *   viewport is narrower than the panel (clamp collapses to `margin`).
 */
export function computeListboxHorizontal(
  anchor: DOMRect,
  widthMode: ListboxWidthMode,
  measuredWidth: number,
  viewportWidth: number,
  margin: number,
): { left: number; width?: number; minWidth?: number; maxWidth?: number } {
  if (widthMode === "trigger") {
    return { left: anchor.left, width: anchor.width };
  }
  const maxWidth = viewportWidth - 2 * margin;
  // Never past the right edge, never before the left margin. Math.max wins when
  // the panel is wider than the room (upperBound < margin) → pinned to margin.
  const upperBound = viewportWidth - margin - measuredWidth;
  const left = Math.max(margin, Math.min(anchor.left, upperBound));
  return { left, minWidth: anchor.width, maxWidth };
}

export interface SelectListboxProps {
  /** id of the listbox element (the trigger's `aria-controls` target). */
  id: string;
  options: SelectOption[];
  /** Currently selected values (normalized to an array for both modes). */
  selected: string[];
  /** Multi-select: rows show a leading checkbox + `aria-multiselectable`. */
  multiple: boolean;
  /** Index of the roving `aria-activedescendant` highlight (-1 = none). */
  activeIndex: number;
  /** The trigger's rect, captured on open + scroll/resize (null → not placed). */
  anchorRect: DOMRect | null;
  /**
   * How the panel is sized horizontally. `"trigger"` (default) matches the
   * trigger's width/left (Select). `"auto"` sizes to content, never narrower
   * than the trigger nor wider than the viewport, clamped inside the viewport
   * (InlineSelect). See {@link computeListboxHorizontal}.
   */
  widthMode?: ListboxWidthMode;
  /** Toggle/choose a value (single closes upstream; multi stays open). */
  onSelect: (value: string) => void;
  /** Move the active highlight (pointer hover keeps keyboard + mouse in sync). */
  onActiveChange: (index: number) => void;
  /**
   * Optional content pinned BELOW the scrollable list (e.g. Filter's Reset
   * button). When `undefined` the panel renders EXACTLY as before — the `<ul>`
   * IS the portaled/positioned card (no DOM or class change for Select /
   * InlineSelect). When provided, the card chrome moves to a wrapping panel
   * `<div>` (a flex column): the scrolling `role="listbox"` on top and this
   * footer pinned below, staying visible while the list scrolls under the
   * `max-height` cap. The footer is outside the `role="listbox"` (it is not an
   * option), so it must supply its own semantics/labels.
   */
  footer?: React.ReactNode;
  /** Accessible name for the listbox (mirrors the trigger's name). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * The portaled dropdown panel. Renders through `createPortal` into
 * `document.body` (so it escapes any `overflow:hidden`/stacking ancestor),
 * absolutely positioned from the trigger's rect via `computeListboxPosition`
 * (matched width, below by default, flips above when short on room), capped at
 * `LISTBOX_MAX_HEIGHT` with internal scroll.
 *
 * Selection semantics live on the `role="option"` rows (`aria-selected`); the
 * multi-select checkbox is a *visual mirror* only — kept out of the tab/AT flow
 * (`tabIndex=-1`, `aria-hidden`) so the option is the single source of truth for
 * assistive tech. Focus never enters the panel (activedescendant pattern), so
 * rows are chosen via `onMouseDown` (before the trigger's outside-click
 * `pointerdown` can fire) rather than a focus-stealing click.
 */
function SelectListbox({
  id,
  options,
  selected,
  multiple,
  activeIndex,
  anchorRect,
  widthMode = "trigger",
  onSelect,
  onActiveChange,
  footer,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SelectListboxProps) {
  const listRef = React.useRef<HTMLUListElement | null>(null);
  // In footer mode the card chrome + max-height live on a wrapping panel; we
  // measure IT (list + footer) for placement. In the no-footer path this ref is
  // never attached and the `<ul>` is measured directly (unchanged).
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const hasFooter = footer != null;
  const [style, setStyle] = React.useState<React.CSSProperties | null>(null);

  // Position after layout so we can measure the panel's real height and flip if
  // needed. Runs whenever the anchor rect changes (open + scroll/resize).
  React.useLayoutEffect(() => {
    if (anchorRect == null) {
      setStyle(null);
      return;
    }
    // Measure the outermost positioned element: the panel wrapper in footer
    // mode (so the footer's height counts toward the flip decision), else the
    // `<ul>` itself (unchanged for Select / InlineSelect).
    const measureEl: HTMLElement | null = hasFooter
      ? panelRef.current
      : listRef.current;
    const measured = measureEl ? measureEl.offsetHeight : 0;
    const height = Math.min(measured || LISTBOX_MAX_HEIGHT, LISTBOX_MAX_HEIGHT);
    // Vertical placement (top/flip) is unchanged; horizontal sizing is delegated
    // to the width-mode helper so Select ("trigger") stays byte-identical.
    const pos = computeListboxPosition(anchorRect, height, window.innerHeight);
    const measuredWidth = measureEl ? measureEl.offsetWidth : 0;
    const horizontal = computeListboxHorizontal(
      anchorRect,
      widthMode,
      measuredWidth,
      window.innerWidth,
      LISTBOX_MARGIN,
    );
    setStyle({
      position: "absolute",
      top:
        pos.top +
        window.scrollY +
        (pos.placement === "bottom" ? LISTBOX_OFFSET : -LISTBOX_OFFSET),
      left: horizontal.left + window.scrollX,
      // `"trigger"`: fixed pixel width = trigger width (Select, unchanged).
      // `"auto"`: content-sized via `max-content`, bounded by min/max width.
      ...(widthMode === "trigger"
        ? { width: horizontal.width }
        : {
            width: "max-content",
            minWidth: horizontal.minWidth,
            maxWidth: horizontal.maxWidth,
          }),
      // Bound to the design token (208px). `overflow-y-auto` on the panel
      // scrolls the list past this cap.
      maxHeight: "var(--container-4xs)",
      zIndex: 50,
    });
  }, [anchorRect, widthMode, hasFooter]);

  // Keep the active row scrolled into view during keyboard nav.
  React.useLayoutEffect(() => {
    if (activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(`${id}-opt-${activeIndex}`)}`,
    );
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, id]);

  // First paint (before the layout effect measures): render hidden so we can
  // read the real size. In `"auto"` mode also apply `width: "max-content"` so
  // the measured `offsetWidth` reflects the content, not the trigger. This
  // positioning style belongs to the OUTERMOST portaled element — the `<ul>` in
  // the no-footer path, the panel `<div>` in the footer path.
  const positionStyle: React.CSSProperties =
    style ??
    (widthMode === "auto"
      ? { position: "absolute", visibility: "hidden", width: "max-content" }
      : { position: "absolute", visibility: "hidden" });

  const optionItems = (
    <>
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value);
        const isActive = index === activeIndex;
        const isDisabled = option.disabled === true;
        // Leading/trailing icons are muted in every state EXCEPT the single-
        // select selected row, where they follow the brand foreground (Figma
        // node 4921:8203). Set explicitly (not inherited) so they stay muted
        // even though the resting label is the full `text-foreground`.
        const iconColorClass =
          isSelected && !multiple
            ? "text-card-brand-foreground"
            : "text-foreground-muted";
        return (
          <li
            key={option.value}
            id={`${id}-opt-${index}`}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled || undefined}
            data-slot="select-option"
            data-active={isActive || undefined}
            className={selectOptionVariants({
              active: isActive,
              selected: isSelected,
              multiple,
              disabled: isDisabled,
            })}
            onMouseEnter={() => {
              if (!isDisabled) onActiveChange(index);
            }}
            // Choose on mousedown so it lands before the trigger's outside-click
            // pointerdown handler (which would otherwise close first). preventDefault
            // keeps focus on the trigger (activedescendant pattern).
            onMouseDown={(event) => {
              event.preventDefault();
              if (!isDisabled) onSelect(option.value);
            }}
          >
            {multiple && (
              // Visual mirror of the row's selection — the `option` carries the
              // semantics, so the checkbox is hidden from AT and out of the tab
              // order. `readOnly` because the <li> owns the toggle.
              <Checkbox
                checked={isSelected}
                // `disabled` (not `readOnly`) makes the input non-focusable, so
                // it is NOT a nested interactive control inside the
                // `role="option"` row (which owns the real selection semantics)
                // — the row is the single source of truth for AT; this checkbox
                // is a pure visual mirror, also `aria-hidden` + out of the tab
                // order. The overrides below undo Checkbox's muted disabled look
                // so the mirror keeps its normal unchecked/brand-checked colours.
                disabled
                tabIndex={-1}
                aria-hidden="true"
                data-slot="select-option-checkbox"
                // Checkbox's own `disabled:`/`checked:disabled:` utilities mute
                // the box (`bg-background` + `border-border-muted`) and would
                // out-specify a plain `checked:` override; so the restore uses
                // the SAME `disabled:`/`checked:disabled:` modifier count to win
                // on specificity — an unchecked box looks default, a checked box
                // stays brand-filled, exactly as if it were enabled.
                className={cn(
                  "pointer-events-none disabled:border-border",
                  "checked:disabled:bg-brand-primary-background checked:disabled:border-brand-primary-border",
                )}
                wrapperClassName="[&_[data-slot=checkbox-indicator]]:text-brand-primary-foreground"
              />
            )}
            {option.leadingSlot != null && (
              // After the checkbox in multi mode. Decorative; muted foreground
              // except on the single-select selected row (brand), per iconColorClass.
              <span
                data-slot="select-option-leading"
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 items-center [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                  iconColorClass,
                )}
              >
                {option.leadingSlot}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            {option.trailingSlot != null && (
              <span
                data-slot="select-option-trailing"
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 items-center [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                  iconColorClass,
                )}
              >
                {option.trailingSlot}
              </span>
            )}
          </li>
        );
      })}
    </>
  );

  // No footer: the `<ul>` IS the portaled card panel — byte-identical to the
  // original (same element, classes, style, ref). Select / InlineSelect take
  // this path unchanged.
  if (!hasFooter) {
    return createPortal(
      <ul
        ref={listRef}
        id={id}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-slot="select-listbox"
        className={cn(selectListboxVariants(), scrollbarVariants())}
        style={positionStyle}
      >
        {optionItems}
      </ul>,
      document.body,
    );
  }

  // Footer present: the card chrome + positioning move to a wrapping panel
  // `<div>` (a flex column); the `<ul>` keeps only its scroll + inset and
  // scrolls under the max-height cap while the footer stays pinned below. The
  // footer sits OUTSIDE `role="listbox"` (it is not an option).
  return createPortal(
    <div
      ref={panelRef}
      data-slot="select-listbox-panel"
      className={selectListboxPanelVariants()}
      style={positionStyle}
    >
      <ul
        ref={listRef}
        id={id}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-slot="select-listbox"
        className={cn(selectListboxScrollVariants(), scrollbarVariants())}
      >
        {optionItems}
      </ul>
      <div
        data-slot="select-listbox-footer"
        className={selectListboxFooterVariants()}
      >
        {footer}
      </div>
    </div>,
    document.body,
  );
}

export { SelectListbox };
