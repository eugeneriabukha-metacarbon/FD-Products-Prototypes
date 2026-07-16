"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import {
  tableCellVariants,
  type TableCellVariantsProps,
} from "./tableCellVariants";

export interface TableCellProps
  extends React.ComponentProps<"div">, TableCellVariantsProps {
  /** Leading slot (e.g. a network icon). Hidden when omitted. */
  leading?: React.ReactNode;
  /** Trailing slot (e.g. a Button). Hidden when omitted. */
  trailing?: React.ReactNode;
  /** The last row in its column — omits the bottom divider. */
  last?: boolean;
  /** Force the brand-accent highlight (active / selected row). */
  active?: boolean;
  /**
   * Render the single child element as the root (e.g. a `<td>` / `<a>`) instead
   * of a `<div>`, keeping all cell styling. The child's own children become the
   * middle content; `leading`/`trailing` are injected around them.
   */
  asChild?: boolean;
}

/** Assign a node to a ref (object or callback form). */
function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

/**
 * The atomic presentational cell for FD data tables (Layer 1). Presentational by
 * default (a non-focusable `<div>`). For an INTERACTIVE cell (e.g. one that opens
 * a details panel), make it focusable — `asChild` onto a `<button>`/`<a>`, or
 * pass `tabIndex`/`role`/`onClick` — and it shows the brand-accent treatment on
 * keyboard focus (`:focus-visible`), identical to hover.
 */
function TableCell({
  className,
  last = false,
  leading,
  trailing,
  active = false,
  asChild = false,
  children,
  ref,
  ...props
}: TableCellProps) {
  const rootClassName = cn(tableCellVariants({ last }), className);
  const dataState = active ? "active" : undefined;

  const leadingSlot =
    leading != null ? (
      <span
        data-slot="table-cell-leading"
        className="flex shrink-0 items-center"
      >
        {leading}
      </span>
    ) : null;
  const trailingSlot =
    trailing != null ? (
      <span
        data-slot="table-cell-trailing"
        className="flex shrink-0 items-center"
      >
        {trailing}
      </span>
    ) : null;
  const middleSlot = (middle: React.ReactNode) =>
    middle != null ? (
      <span
        data-slot="table-cell-middle"
        className="flex min-w-0 flex-1 flex-col"
      >
        {middle}
      </span>
    ) : null;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "TableCell: `asChild` requires a single React element child",
      );
    }
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    // Unlike Button, we intentionally do NOT merge `style` or compose an
    // owner-level handler onto the child here: TableCell contributes no inline
    // style and exposes no owner handlers at Layer 1, so there is nothing to
    // merge. Revisit if Layer 2 adds cell-level interactivity.
    return React.cloneElement(
      child,
      {
        ...props,
        ...childProps,
        "data-slot": "table-cell",
        "data-state": dataState,
        className: cn(
          rootClassName,
          childProps.className as string | undefined,
        ),
        ref: (node: HTMLElement | null) => {
          setRef(ref as React.Ref<HTMLElement>, node);
          setRef((childProps as { ref?: React.Ref<HTMLElement> }).ref, node);
        },
      },
      leadingSlot,
      middleSlot(childProps.children as React.ReactNode),
      trailingSlot,
    );
  }

  return (
    <div
      data-slot="table-cell"
      data-state={dataState}
      className={rootClassName}
      ref={ref}
      {...props}
    >
      {leadingSlot}
      {middleSlot(children)}
      {trailingSlot}
    </div>
  );
}

export { TableCell };
