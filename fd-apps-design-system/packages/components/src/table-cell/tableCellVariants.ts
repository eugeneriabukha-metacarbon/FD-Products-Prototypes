import { cva, type VariantProps } from "class-variance-authority";

/**
 * TableCell frame — mirrors the Figma `BaseTableCell` (state default/hover ×
 * position first&middle/last). Binds ONLY to the semantic `card/*` token layer;
 * theme switch is automatic via `.dark`.
 *
 * The Figma `position` variant is a binary "is this the last row" flag, so it is
 * modelled as a boolean `last` (house style — cf. Button `iconOnly`): `last`
 * omits the bottom divider, otherwise the row draws it.
 *
 * State is NOT a cva variant. The cell is a Tailwind `group`; its own surface
 * (background + divider) recolors on self `hover:` / `focus-visible:` /
 * `data-[state=active]:` (`data-state` is set from the `active` prop in
 * <TableCell>). Descendants like <CellText> recolor via the same group
 * (`group-hover:` / `group-focus-visible:` / `group-data-[state=active]:`).
 * (`group-hover:` cannot fire from the group element's OWN hover — hence the
 * surface uses plain `hover:`/`focus-visible:`.)
 *
 * `focus-visible` mirrors hover so an INTERACTIVE cell (one made focusable by a
 * consumer — `asChild` onto a `<button>`/`<a>`, or a `tabIndex`) shows the same
 * brand-accent treatment as its keyboard focus indicator. A plain presentational
 * <div> cell never receives focus, so this is inert until the cell is made
 * focusable. `appearance-none` + `outline-none` let an `asChild` button/anchor
 * render cleanly with the fill (not the native ring) as the focus affordance.
 */
export const tableCellVariants = cva(
  [
    // The cell is the group that drives hover/active styling of its descendants.
    "group",
    // Layout — 56px row, slots on a horizontal axis; overflow clipped for truncation.
    "flex h-14 w-full items-center gap-3 overflow-hidden px-2 py-4",
    // Brand-accent background on hover / keyboard-focus / active (self). Reset
    // native control chrome so an asChild button/anchor styles cleanly.
    "appearance-none bg-transparent outline-none transition-colors",
    "hover:bg-card-brand-accent focus-visible:bg-card-brand-accent data-[state=active]:bg-card-brand-accent",
  ],
  {
    variants: {
      last: {
        // Row divider on all but the last row; recolors on hover / focus / active.
        false: [
          "border-b border-card-border",
          "hover:border-card-brand-border-accent focus-visible:border-card-brand-border-accent data-[state=active]:border-card-brand-border-accent",
        ],
        true: "",
      },
    },
    defaultVariants: {
      last: false,
    },
  },
);

export type TableCellVariantsProps = VariantProps<typeof tableCellVariants>;
