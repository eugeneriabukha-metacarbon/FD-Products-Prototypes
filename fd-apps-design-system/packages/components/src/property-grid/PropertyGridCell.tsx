"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { propertyGridCellVariants } from "./propertyGridVariants";

export interface PropertyGridCellProps extends React.ComponentProps<"div"> {
  /** Which side of the row — sets tone (muted/foreground) + alignment. */
  variant: "title" | "content";
  /** Leading slot (e.g. a muted icon). Hidden when omitted. */
  leading?: React.ReactNode;
  /** Trailing slot (e.g. a copy icon). Hidden when omitted. */
  trailing?: React.ReactNode;
}

/**
 * Shared slotted cell for <PropertyGridTitle> / <PropertyGridContent>. Renders
 * `leading` / middle `children` / `trailing`; leading & trailing tint their
 * content muted and size icons to 16px so a `currentColor` icon matches Figma.
 * Borderless — the divider lives on <PropertyGridItem>. Internal to the package.
 */
function PropertyGridCell({
  variant,
  className,
  leading,
  trailing,
  children,
  ref,
  ...props
}: PropertyGridCellProps) {
  const slotClass =
    "flex shrink-0 items-center text-card-foreground-muted [&_svg]:size-4";
  return (
    <div
      data-slot={`property-grid-${variant}`}
      className={cn(propertyGridCellVariants({ variant }), className)}
      ref={ref}
      {...props}
    >
      {leading != null && (
        <span
          data-slot={`property-grid-${variant}-leading`}
          className={slotClass}
        >
          {leading}
        </span>
      )}
      {children != null && <span className="min-w-0 truncate">{children}</span>}
      {trailing != null && (
        <span
          data-slot={`property-grid-${variant}-trailing`}
          className={slotClass}
        >
          {trailing}
        </span>
      )}
    </div>
  );
}

export { PropertyGridCell };
