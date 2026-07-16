"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../lib/cn";
import { tooltipVariants } from "./tooltipVariants";

// ── Placement types + pure positioning math ──────────────────────────────────

/** Preferred side of the trigger the bubble is placed on. */
export type TooltipSide = "top" | "bottom" | "left" | "right";
/** Alignment of the bubble along the trigger's edge. */
export type TooltipAlign = "start" | "center" | "end";

/** Gap (px) between the trigger edge and the bubble. */
const TOOLTIP_OFFSET = 6;
/** Safety margin (px) kept between the bubble and each viewport edge when clamping. */
const VIEWPORT_MARGIN = 8;

const OPPOSITE_SIDE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** The minimal rect shape the placement math needs (a `DOMRect` satisfies it). */
export interface TooltipRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Whether `side` has room for the bubble between the trigger and the viewport edge. */
function sideFits(
  trigger: TooltipRect,
  content: { width: number; height: number },
  side: TooltipSide,
  viewport: { width: number; height: number },
): boolean {
  switch (side) {
    case "top":
      return trigger.top - TOOLTIP_OFFSET - content.height >= 0;
    case "bottom":
      return (
        trigger.top + trigger.height + TOOLTIP_OFFSET + content.height <=
        viewport.height
      );
    case "left":
      return trigger.left - TOOLTIP_OFFSET - content.width >= 0;
    case "right":
      return (
        trigger.left + trigger.width + TOOLTIP_OFFSET + content.width <=
        viewport.width
      );
  }
}

/** Cross-axis coordinate for an alignment along the trigger's edge. */
function alignCoord(
  anchorStart: number,
  anchorSize: number,
  contentSize: number,
  align: TooltipAlign,
): number {
  switch (align) {
    case "start":
      return anchorStart;
    case "center":
      return anchorStart + anchorSize / 2 - contentSize / 2;
    case "end":
      return anchorStart + anchorSize - contentSize;
  }
}

function clamp(value: number, min: number, max: number): number {
  // When the content is wider/taller than the room, `max < min`; pin to `min`
  // (the near viewport edge) rather than letting the upper bound win.
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

/**
 * Pure placement math for the portaled bubble. Given the trigger rect, the
 * measured bubble size, the preferred `side`/`align`, and the viewport, returns
 * the viewport-relative `top`/`left` and the RESOLVED `side` (after flip). The
 * caller offsets by `scrollX`/`scrollY` for absolute document coordinates.
 *
 * Rules: place on the preferred `side`; **flip** to the opposite side only when
 * the preferred side overflows the viewport AND the opposite side has room
 * (otherwise keep the preferred side); then clamp the CROSS axis into the
 * viewport so the bubble never bleeds off-screen. The main axis is owned by the
 * side/flip, so only the cross axis is clamped. Kept free of the DOM/React so
 * every branch is unit-testable.
 */
export function computeTooltipPosition(
  trigger: TooltipRect,
  content: { width: number; height: number },
  side: TooltipSide,
  align: TooltipAlign,
  viewport: { width: number; height: number },
): { top: number; left: number; side: TooltipSide } {
  const resolvedSide =
    sideFits(trigger, content, side, viewport) ||
    !sideFits(trigger, content, OPPOSITE_SIDE[side], viewport)
      ? side
      : OPPOSITE_SIDE[side];

  const vertical = resolvedSide === "top" || resolvedSide === "bottom";

  let top: number;
  let left: number;
  if (vertical) {
    top =
      resolvedSide === "top"
        ? trigger.top - TOOLTIP_OFFSET - content.height
        : trigger.top + trigger.height + TOOLTIP_OFFSET;
    left = alignCoord(trigger.left, trigger.width, content.width, align);
    left = clamp(
      left,
      VIEWPORT_MARGIN,
      viewport.width - content.width - VIEWPORT_MARGIN,
    );
  } else {
    left =
      resolvedSide === "left"
        ? trigger.left - TOOLTIP_OFFSET - content.width
        : trigger.left + trigger.width + TOOLTIP_OFFSET;
    top = alignCoord(trigger.top, trigger.height, content.height, align);
    top = clamp(
      top,
      VIEWPORT_MARGIN,
      viewport.height - content.height - VIEWPORT_MARGIN,
    );
  }

  return { top, left, side: resolvedSide };
}

// ── Context ──────────────────────────────────────────────────────────────────

interface TooltipContextValue {
  /** Resolved open state (forced `false` while `disabled`). */
  open: boolean;
  /** Open/close, routed through controlled `onOpenChange` / uncontrolled state. */
  setOpen: (open: boolean) => void;
  /** Whether the tooltip is disabled (never opens; no `aria-describedby`). */
  disabled: boolean;
  /** Generated id shared by the trigger (`aria-describedby`) and content (`id`). */
  contentId: string;
  /** Preferred placement side + alignment. */
  side: TooltipSide;
  align: TooltipAlign;
  /** Anchor node ref the Trigger registers and the positioning measures. */
  anchorRef: React.RefObject<HTMLElement | null>;
  /** Trigger rect, captured on open + capture-phase scroll/resize (null → unmeasured). */
  anchorRect: TooltipRect | null;
  /** Pointer/focus handlers the Trigger binds (composed with the consumer's). */
  onTriggerPointerEnter: () => void;
  onTriggerPointerLeave: () => void;
  onTriggerFocus: () => void;
  onTriggerBlur: () => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

/** Read the Tooltip context, throwing if a part is used outside `Tooltip.Root`. */
function useTooltipContext(part: string): TooltipContextValue {
  const context = React.useContext(TooltipContext);
  if (context === null) {
    throw new Error(`${part} must be used within <Tooltip.Root>`);
  }
  return context;
}

// ── ref helper ───────────────────────────────────────────────────────────────

/** Assign a node to a ref (object or callback form). */
function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

// ── Root ─────────────────────────────────────────────────────────────────────

export interface TooltipRootProps {
  /** Controlled open state. Pair with `onOpenChange`. Omit for uncontrolled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Ignored if `open` is provided. Default `false`. */
  defaultOpen?: boolean;
  /** Called with the next open state from hover/focus/leave/blur/Escape. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Milliseconds a pointer must hover the trigger before the tooltip opens.
   * Default `600`. Keyboard focus opens immediately (no delay).
   */
  delayDuration?: number;
  /** Preferred side of the trigger to place the bubble on. Default `"top"`. */
  side?: TooltipSide;
  /** Alignment of the bubble along the trigger's edge. Default `"center"`. */
  align?: TooltipAlign;
  /**
   * When `true` the tooltip never opens: the trigger still renders, but no
   * `aria-describedby` is wired and no hover/focus fires an open.
   */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * State owner + context provider for the compound `Tooltip`. Renders no DOM of
 * its own (a fragment) — it only coordinates the trigger and the portaled
 * bubble. Owns the open state (controlled via `open`/`onOpenChange`, or
 * uncontrolled via `defaultOpen`), the hover-open timer, the anchor rect + its
 * reposition listeners, and the Escape-to-close listener.
 */
function TooltipRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 600,
  side = "top",
  align = "center",
  disabled = false,
  children,
}: TooltipRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const rawOpen = isControlled ? openProp : uncontrolledOpen;
  // `disabled` always wins — a disabled tooltip is never shown, even if a
  // controlled `open` prop says otherwise.
  const open = disabled ? false : rawOpen;

  const reactId = React.useId();
  const contentId = `${reactId}-tooltip`;

  const anchorRef = React.useRef<HTMLElement | null>(null);
  const [anchorRect, setAnchorRect] = React.useState<TooltipRect | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable identity: consumed in the Escape effect's dependency array — a fresh
  // identity each render would needlessly rebind the document listener. This is
  // the "structural reason" the authoring pattern allows `useCallback`.
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clear any pending open timer on unmount.
  React.useEffect(() => clearTimer, [clearTimer]);

  const onTriggerPointerEnter = () => {
    if (disabled) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delayDuration);
  };
  const onTriggerPointerLeave = () => {
    clearTimer();
    setOpen(false);
  };
  const onTriggerFocus = () => {
    if (disabled) return;
    clearTimer();
    // Focus opens immediately — no hover delay.
    setOpen(true);
  };
  const onTriggerBlur = () => {
    clearTimer();
    setOpen(false);
  };

  // Measure the anchor on open and keep it in sync: capture-phase `scroll` (any
  // scroll container) + `resize` — the exact listener pattern `useSelectListbox`
  // uses. `useLayoutEffect` so the rect is set before paint (no flash).
  React.useLayoutEffect(() => {
    if (!open) {
      setAnchorRect(null);
      return;
    }
    const measure = () => {
      const node = anchorRef.current;
      if (node) setAnchorRect(node.getBoundingClientRect());
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  // Escape closes while open — listener on `document` so it fires regardless of
  // where focus sits (the Dialog pattern).
  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimer();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, setOpen, clearTimer]);

  const value: TooltipContextValue = {
    open,
    setOpen,
    disabled,
    contentId,
    side,
    align,
    anchorRef,
    anchorRect,
    onTriggerPointerEnter,
    onTriggerPointerLeave,
    onTriggerFocus,
    onTriggerBlur,
  };

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}

// ── Trigger ──────────────────────────────────────────────────────────────────

export interface TooltipTriggerProps extends React.ComponentProps<"button"> {
  /**
   * Render the single child element as the trigger instead of a `<button>`, so
   * an existing control (an `IconButton`, `Button`, anchor…) becomes the anchor.
   * The clone pattern: merge `ref`, compose event handlers, merge `className`.
   */
  asChild?: boolean;
}

/**
 * The anchor the tooltip describes. Renders a native `<button type="button">`
 * by default (focusable, correct semantics), or projects its props/ref onto the
 * single child when `asChild`. Binds the pointer/focus handlers that drive
 * open/close (composed with any consumer handler of the same name) and, while
 * open and not `disabled`, wires `aria-describedby` to the bubble. Registers the
 * anchor node for positioning. Forwards `ref` to the trigger element.
 */
function TooltipTrigger({
  asChild = false,
  className,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TooltipTriggerProps) {
  const {
    open,
    disabled,
    contentId,
    anchorRef,
    onTriggerPointerEnter,
    onTriggerPointerLeave,
    onTriggerFocus,
    onTriggerBlur,
  } = useTooltipContext("Tooltip.Trigger");

  // Reference the bubble only while it is rendered — closed content is removed
  // from the DOM, so a dangling `aria-describedby` id would be invalid (an axe
  // violation), and a `disabled` tooltip is never described (Accordion wires
  // `aria-controls` the same open-gated way).
  const describedBy = !disabled && open ? contentId : undefined;

  // Compose our handlers with the consumer's (theirs runs first).
  const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(event);
    onTriggerPointerEnter();
  };
  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    onTriggerPointerLeave();
  };
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    onTriggerFocus();
  };
  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    onTriggerBlur();
  };

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "Tooltip.Trigger: `asChild` requires a single React element child",
      );
    }
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    const childHandlers = childProps as {
      onPointerEnter?: React.PointerEventHandler<HTMLElement>;
      onPointerLeave?: React.PointerEventHandler<HTMLElement>;
      onFocus?: React.FocusEventHandler<HTMLElement>;
      onBlur?: React.FocusEventHandler<HTMLElement>;
      ref?: React.Ref<HTMLElement>;
      className?: string;
    };
    return React.cloneElement(
      child,
      {
        ...props,
        ...childProps,
        "data-slot": "tooltip-trigger",
        "aria-describedby": describedBy,
        onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
          childHandlers.onPointerEnter?.(event);
          onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>);
          onTriggerPointerEnter();
        },
        onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
          childHandlers.onPointerLeave?.(event);
          onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>);
          onTriggerPointerLeave();
        },
        onFocus: (event: React.FocusEvent<HTMLElement>) => {
          childHandlers.onFocus?.(event);
          onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
          onTriggerFocus();
        },
        onBlur: (event: React.FocusEvent<HTMLElement>) => {
          childHandlers.onBlur?.(event);
          onBlur?.(event as React.FocusEvent<HTMLButtonElement>);
          onTriggerBlur();
        },
        className: cn(className, childHandlers.className),
        ref: (node: HTMLElement | null) => {
          anchorRef.current = node;
          setRef(ref as React.Ref<HTMLElement>, node);
          setRef(childHandlers.ref, node);
        },
      },
      childProps.children as React.ReactNode,
    );
  }

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      data-slot="tooltip-trigger"
      aria-describedby={describedBy}
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={(node: HTMLButtonElement | null) => {
        anchorRef.current = node;
        setRef(ref as React.Ref<HTMLButtonElement>, node);
      }}
    >
      {children}
    </button>
  );
}

// ── Content ──────────────────────────────────────────────────────────────────

export interface TooltipContentProps extends React.ComponentProps<"div"> {}

/**
 * The bubble. Portaled to `document.body` via `createPortal` (escaping
 * `overflow`/stacking ancestors, like `SelectListbox`/`DialogContent`), rendered
 * **only while open** — closed, it is removed from the DOM and the a11y tree.
 * Absolutely positioned from the trigger rect via {@link computeTooltipPosition}
 * (preferred side, flips when it would overflow, clamps the cross-axis).
 * `role="tooltip"`; `data-side`/`data-align` reflect the RESOLVED placement.
 *
 * **Content must be non-interactive** — the WAI-ARIA tooltip pattern forbids
 * focusable/interactive content inside a tooltip (there is no accessible way to
 * reach it, and the bubble is `pointer-events-none`). Pass text or decorative
 * `ReactNode` only. Forwards `ref` to the bubble.
 */
function TooltipContent({
  className,
  children,
  style,
  ref,
  ...props
}: TooltipContentProps) {
  const { open, contentId, side, align, anchorRect } =
    useTooltipContext("Tooltip.Content");
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = React.useState<{
    top: number;
    left: number;
    side: TooltipSide;
  } | null>(null);

  // Position after layout so the bubble's real size feeds the flip/clamp math.
  // Recomputes whenever the anchor rect changes (open + scroll/resize) or the
  // requested placement changes.
  React.useLayoutEffect(() => {
    if (!open || anchorRect == null) {
      setPlacement(null);
      return;
    }
    const node = contentRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setPlacement(
      computeTooltipPosition(
        anchorRect,
        { width: rect.width, height: rect.height },
        side,
        align,
        { width: window.innerWidth, height: window.innerHeight },
      ),
    );
  }, [open, anchorRect, side, align]);

  if (!open) return null;

  const positioned = placement !== null;
  // Before the first measure, render hidden so the real size can be read
  // without a flash at (0,0).
  const positionStyle: React.CSSProperties = positioned
    ? {
        position: "absolute",
        top: placement.top + window.scrollY,
        left: placement.left + window.scrollX,
        zIndex: 50,
        ...style,
      }
    : {
        position: "absolute",
        top: 0,
        left: 0,
        visibility: "hidden",
        zIndex: 50,
        ...style,
      };

  const setContentRef = (node: HTMLDivElement | null) => {
    contentRef.current = node;
    setRef(ref as React.Ref<HTMLDivElement>, node);
  };

  return createPortal(
    <div
      {...props}
      ref={setContentRef}
      role="tooltip"
      id={contentId}
      data-slot="tooltip-content"
      data-side={positioned ? placement.side : side}
      data-align={align}
      className={cn(tooltipVariants(), className)}
      style={positionStyle}
    >
      {children}
    </div>,
    document.body,
  );
}

// ── Compound export ──────────────────────────────────────────────────────────

/**
 * Compound tooltip — a small floating label shown on hover (after
 * `delayDuration`) or keyboard focus (immediately), describing its trigger.
 * Assemble from its namespaced parts:
 *
 * ```tsx
 * <Tooltip.Root side="top">
 *   <Tooltip.Trigger asChild>
 *     <IconButton aria-label="Info" />
 *   </Tooltip.Trigger>
 *   <Tooltip.Content>Explanatory text</Tooltip.Content>
 * </Tooltip.Root>
 * ```
 */
const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};

export { Tooltip, TooltipRoot, TooltipTrigger, TooltipContent };
