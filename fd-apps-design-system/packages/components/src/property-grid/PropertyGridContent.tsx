"use client";

import {
  PropertyGridCell,
  type PropertyGridCellProps,
} from "./PropertyGridCell";

export type PropertyGridContentProps = Omit<PropertyGridCellProps, "variant">;

/** The content (right) cell of a property-grid row — foreground, right-aligned. */
function PropertyGridContent(props: PropertyGridContentProps) {
  return <PropertyGridCell variant="content" {...props} />;
}

export { PropertyGridContent };
