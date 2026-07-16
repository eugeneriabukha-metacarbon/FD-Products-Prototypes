import * as React from "react";

export interface TableTitleProps extends React.ComponentProps<"div"> {}

/**
 * Table title/header bar — ports the DS Figma `table-title` component
 * (styleguide node 4945:122683): a 32px row with a bottom divider, `px-2`
 * (matching TableCell) so labels align with the rows below, and `py-1.5`.
 * The DS ships no code version yet (the table shell is deferred), so this
 * mirrors it with tokens. Children are the column label(s); style them with
 * `caption-03-medium uppercase text-card-foreground-muted` per the component.
 */
export function TableTitle({ className, children, ...props }: TableTitleProps) {
  return (
    <div
      className={`border-card-border flex h-8 w-full items-center overflow-clip border-b px-2 py-1.5 ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
}
