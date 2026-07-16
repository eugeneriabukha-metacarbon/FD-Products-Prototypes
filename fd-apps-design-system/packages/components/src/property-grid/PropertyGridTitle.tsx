"use client";

import {
  PropertyGridCell,
  type PropertyGridCellProps,
} from "./PropertyGridCell";

export type PropertyGridTitleProps = Omit<PropertyGridCellProps, "variant">;

/** The title (left) cell of a property-grid row — muted, left-aligned. */
function PropertyGridTitle(props: PropertyGridTitleProps) {
  return <PropertyGridCell variant="title" {...props} />;
}

export { PropertyGridTitle };
