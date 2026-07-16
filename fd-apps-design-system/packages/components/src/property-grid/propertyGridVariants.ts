import { cva, type VariantProps } from "class-variance-authority";

/**
 * Property-grid CELL frame — the title (left) and content (right) sides of a
 * property-grid row. Binds ONLY to the semantic `card/*` token layer; theme
 * switch is automatic via `.dark`. Static (no hover/active/focus) — a
 * property-grid row is read-only display.
 *
 * `variant` distinguishes the two sides:
 * - `title`   — muted text, left-aligned.
 * - `content` — foreground text, right-aligned.
 */
export const propertyGridCellVariants = cva(
  [
    // Layout — 40px row, single line, slots on a horizontal axis.
    "flex h-10 min-w-0 items-center gap-1 py-3",
    // Type — Archivo 14/20.
    "body-03",
  ],
  {
    variants: {
      variant: {
        title: "justify-start text-card-foreground-muted",
        content: "justify-end text-card-foreground",
      },
    },
    defaultVariants: {
      variant: "title",
    },
  },
);

export type PropertyGridCellVariantsProps = VariantProps<
  typeof propertyGridCellVariants
>;

/**
 * Property-grid ITEM (row) frame — a two-column grid (title | content). Owns the
 * bottom divider; `last` (the last row in a grid) omits it. Stacked items align
 * columns automatically (each column is 1fr).
 */
export const propertyGridItemVariants = cva(["grid grid-cols-2"], {
  variants: {
    last: {
      false: "border-b border-card-border",
      true: "",
    },
  },
  defaultVariants: {
    last: false,
  },
});

export type PropertyGridItemVariantsProps = VariantProps<
  typeof propertyGridItemVariants
>;
