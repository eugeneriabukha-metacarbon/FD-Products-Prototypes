"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import {
  propertyGridItemVariants,
  type PropertyGridItemVariantsProps,
} from "./propertyGridVariants";

export interface PropertyGridItemProps
  extends React.ComponentProps<"div">, PropertyGridItemVariantsProps {}

/**
 * A property-grid row: a two-column grid holding one <PropertyGridTitle> (left)
 * and one <PropertyGridContent> (right) as children. Owns the bottom divider;
 * `last` (the last row in a grid) omits it. Stacked items align columns
 * automatically (each is `grid-cols-2` at 1fr/1fr).
 */
function PropertyGridItem({
  className,
  last = false,
  children,
  ref,
  ...props
}: PropertyGridItemProps) {
  return (
    <div
      data-slot="property-grid-item"
      className={cn(propertyGridItemVariants({ last }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
}

export { PropertyGridItem };
