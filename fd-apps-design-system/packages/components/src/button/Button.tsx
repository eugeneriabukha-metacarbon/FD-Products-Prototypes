"use client";

import * as React from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { BUTTON_CUT, useCutCornerClipPath } from "../lib/cut-corner";
import { buttonVariants, type ButtonVariantsProps } from "./buttonVariants";

/** Focus ring: gap between button edge and ring, and ring stroke width (px). */
const FOCUS_RING_GAP = 3;
const FOCUS_RING_WIDTH = 2;

export interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "color">, ButtonVariantsProps {
  /**
   * Render the single child element (e.g. an `<a>` / Next `<Link>`) as the root
   * instead of a `<button>`, keeping all button styling. Keeps a button-styled
   * link a real anchor (valid HTML, middle-click, open-in-new-tab).
   */
  asChild?: boolean;
  /**
   * Show a spinner and mark the button busy (`aria-busy`). Keeps the ACTIVE
   * styling (not the greyed disabled look) but is not actionable while busy —
   * clicks and keyboard activation are blocked and it reports `aria-disabled`.
   */
  loading?: boolean;
  /** Leading content (usually a Phosphor icon). Replaced by the spinner when loading. */
  leftSlot?: React.ReactNode;
  /** Trailing content (usually a Phosphor icon). Stays visible when loading (per Figma). */
  rightSlot?: React.ReactNode;
  /** Class names for the outer wrapper span (present only for the secondary border). */
  wrapperClassName?: string;
}

/** Assign a node to several refs at once (object or callback form). */
function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

function Button({
  className,
  variation = "primary",
  size = "md",
  iconOnly = false,
  asChild = false,
  loading = false,
  leftSlot,
  rightSlot,
  wrapperClassName,
  disabled,
  style,
  children,
  onClick,
  ref,
  ...props
}: ButtonProps) {
  // The hook needs the DOM node to measure the chamfer; the consumer may also
  // pass a `ref`. Merge both onto one callback so neither is dropped.
  const {
    ref: cutRef,
    clipPath,
    pathD,
    outsetPathD,
  } = useCutCornerClipPath<HTMLElement>(BUTTON_CUT.cut, {
    radius: BUTTON_CUT.radius,
    radiusCuts: BUTTON_CUT.radiusCuts,
    outset: FOCUS_RING_GAP,
  });
  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      (cutRef as React.MutableRefObject<HTMLElement | null>).current = node;
      setRef(ref as React.Ref<HTMLElement>, node);
    },
    [cutRef, ref],
  );

  // Loading keeps the ACTIVE look — only the explicit `disabled` prop applies
  // the greyed-out disabled styling (and the native `disabled` attribute).
  const isDisabled = disabled;
  const hasCutCorner = variation !== "ghost";
  // Secondary is the only variation with a visible border; it follows the cut
  // shape as an SVG stroke (a CSS border would clip square across the chamfer).
  const hasSvgBorder = variation === "secondary";

  // Loading is styled as active but must not be actionable: block the click
  // (mouse via `pointer-events-none`, keyboard via this guard — Enter/Space on a
  // button dispatch a click) and prevent an implicit form submit, without the
  // disabled *styling*. Signalled to assistive tech with `aria-disabled`.
  const handleClick = loading
    ? (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
      }
    : onClick;

  const rootClassName = cn(
    buttonVariants({ variation, size, iconOnly }),
    hasSvgBorder && "border-0",
    loading && "pointer-events-none",
    className,
  );
  const rootStyle = hasCutCorner ? { ...style, clipPath } : style;

  const content = (
    <>
      {loading ? (
        <CircleNotchIcon className="animate-spin" aria-hidden="true" />
      ) : (
        leftSlot
      )}
      {!iconOnly && children}
      {iconOnly && !loading && children}
      {/* Figma loading variant: spinner replaces the LEFT icon; the right icon persists. */}
      {!iconOnly && rightSlot}
    </>
  );

  let rootEl: React.ReactElement;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "Button: `asChild` requires a single React element child",
      );
    }
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    const childOnClick = (
      childProps as { onClick?: React.MouseEventHandler<HTMLElement> }
    ).onClick;
    rootEl = React.cloneElement(
      child,
      {
        ...props,
        ...childProps,
        "data-slot": "button",
        "data-loading": loading || undefined,
        "aria-busy": loading || undefined,
        "aria-disabled": loading || undefined,
        // Block activation while loading; otherwise run both handlers.
        onClick: loading
          ? (event: React.MouseEvent<HTMLElement>) => {
              event.preventDefault();
              event.stopPropagation();
            }
          : (event: React.MouseEvent<HTMLElement>) => {
              onClick?.(event as React.MouseEvent<HTMLButtonElement>);
              childOnClick?.(event);
            },
        ref: (node: HTMLElement | null) => {
          setRootRef(node);
          setRef((childProps as { ref?: React.Ref<HTMLElement> }).ref, node);
        },
        className: cn(
          rootClassName,
          childProps.className as string | undefined,
        ),
        style: {
          ...rootStyle,
          ...(childProps.style as React.CSSProperties | undefined),
        },
      },
      loading ? (
        <CircleNotchIcon className="animate-spin" aria-hidden="true" />
      ) : null,
      childProps.children as React.ReactNode,
    );
  } else {
    rootEl = (
      <button
        data-slot="button"
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        className={rootClassName}
        style={rootStyle}
        disabled={isDisabled}
        {...props}
        onClick={handleClick}
        ref={setRootRef}
      >
        {content}
      </button>
    );
  }

  // Ghost has no clip-path — its focus ring renders on the element itself.
  if (!hasCutCorner) return rootEl;

  // Cut-corner variants get an unclipped wrapper. Both the focus ring and
  // secondary's border are SVG paths tracing the cut shape (a CSS outline/border
  // would clip square across the chamfer, and an outline on the button itself
  // would be swallowed by its clip-path):
  // - the focus ring follows the button's outline, offset outward by
  //   `FOCUS_RING_GAP` (`outsetPathD`); shown only on `:focus-visible`;
  // - secondary's border traces the button outline exactly (`pathD`). Its stroke
  //   is class-driven so it tracks states like Figma: default `border`,
  //   hover/active `border-accent`, disabled `-muted`.
  return (
    <span className={cn("group relative inline-block", wrapperClassName)}>
      {rootEl}
      {outsetPathD && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-0 group-has-[:focus-visible]:opacity-100"
          aria-hidden="true"
        >
          <path
            d={outsetPathD}
            fill="none"
            strokeWidth={FOCUS_RING_WIDTH}
            className="stroke-focus"
          />
        </svg>
      )}
      {hasSvgBorder && pathD && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d={pathD}
            fill="none"
            strokeWidth={1}
            className={cn(
              // Disabled locks the muted stroke; the hover/active accent
              // classes must not be present at all (a `group-hover:` variant
              // out-specifies the plain muted class, so it would still
              // recolor the border on hover of a disabled button).
              isDisabled
                ? "stroke-button-secondary-border-muted"
                : [
                    "stroke-button-secondary-border",
                    "group-hover:stroke-button-secondary-border-accent group-active:stroke-button-secondary-border-accent",
                  ],
            )}
          />
        </svg>
      )}
    </span>
  );
}

export { Button };
