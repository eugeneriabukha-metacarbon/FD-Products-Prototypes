"use client";

import * as React from "react";

import { cn } from "../lib/cn";

export interface CellTextProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** Primary line (Archivo 14/20 — `body-03`). */
  label: React.ReactNode;
  /**
   * Optional secondary line: mono (Chakra Petch 12/16 — `body-mono-04`)
   * segments joined by a 2px dot separator. Arbitrary length.
   */
  meta?: React.ReactNode[];
}

/**
 * Middle-slot helper for <TableCell>: a `label` line above an optional `meta`
 * row. Recolors to the brand foregrounds via the parent <TableCell> group on
 * hover / keyboard focus / `data-state="active"`, so it MUST be rendered inside
 * a <TableCell>.
 */
function CellText({ label, meta, className, ...props }: CellTextProps) {
  const hasMeta = Array.isArray(meta) && meta.length > 0;
  return (
    <div
      data-slot="cell-text"
      className={cn("flex min-w-0 flex-col gap-0.5", className)}
      {...props}
    >
      <span
        data-slot="cell-text-label"
        className={cn(
          "body-03 min-w-0 truncate",
          "text-card-foreground",
          "group-hover:text-card-brand-foreground group-focus-visible:text-card-brand-foreground group-data-[state=active]:text-card-brand-foreground",
        )}
      >
        {label}
      </span>
      {hasMeta && (
        <div
          data-slot="cell-text-meta"
          className={cn(
            "flex min-w-0 items-center gap-1",
            "body-mono-04",
            "text-card-foreground-muted",
            "group-hover:text-card-brand-foreground-muted group-focus-visible:text-card-brand-foreground-muted group-data-[state=active]:text-card-brand-foreground-muted",
          )}
        >
          {meta!.map((segment, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="size-0.5 shrink-0 rounded-full bg-current"
                />
              )}
              <span className="truncate">{segment}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export { CellText };
