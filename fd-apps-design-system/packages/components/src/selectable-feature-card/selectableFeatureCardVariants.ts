import { cva } from "class-variance-authority";

/**
 * SelectableFeatureCard styling — the Figma `SelectableFeatureCard`
 * (node `5075:8855`). Binds ONLY to the `card-*` / `brand-*` semantic token
 * layer (never primitives / mode plumbing); theme switching is automatic via
 * `.dark`, so no `dark:` variants.
 *
 * The radio input is the single source of truth (ADR-0010): the selected
 * border and the bottom-slot reveal are derived purely from `:has(:checked)` /
 * `group-has(:checked)` — no React state, identical controlled or uncontrolled.
 * `group` on the container is what lets the bottom slot (a sibling of the row,
 * not a descendant of the input) react to the input's checked state.
 */

/**
 * Outer card container. `group` powers the `group-has-[:checked]:` reveals;
 * `overflow-hidden` clips the bottom slot to the rounded corners. Border is
 * neutral by default and brand when any descendant radio is `:checked`; the
 * whole card dims when the radio is `:disabled`.
 */
export const selectableFeatureCardVariants = cva([
  "group overflow-hidden rounded-md border border-border bg-card-background",
  "has-[:checked]:border-brand-primary-border",
  "has-[:disabled]:opacity-60",
]);

/**
 * The clickable row (a `<label>`). `h-16`=64px, `gap-3`=12px, `px-4`/`py-3`.
 * For the `editable` variation it grows a bottom divider only while selected
 * (i.e. only when the bottom slot is actually showing).
 */
export const selectableFeatureCardRowVariants = cva(
  [
    "flex h-16 items-center gap-3 bg-card-background px-4 py-3",
    "cursor-pointer has-[:disabled]:cursor-not-allowed",
  ],
  {
    variants: {
      editable: {
        true: "group-has-[:checked]:border-b group-has-[:checked]:border-border",
        false: "",
      },
    },
    defaultVariants: { editable: false },
  },
);

/** Title + subtitle column. `min-w-0` + `flex-1` enable text truncation. */
export const selectableFeatureCardTextVariants = cva(
  "flex min-w-0 flex-1 flex-col",
);

/** Trailing 24px decorative icon slot (`foreground-muted`). */
export const selectableFeatureCardTrailingVariants = cva(
  "flex shrink-0 items-center text-card-foreground-muted [&_svg]:size-6 [&_svg]:shrink-0",
);

/**
 * Editable bottom slot. Hidden until a descendant radio is `:checked`, then
 * revealed as a block. `bg-card-accent` surface, `p-4` default body padding.
 */
export const selectableFeatureCardBottomVariants = cva(
  "hidden bg-card-accent p-4 group-has-[:checked]:block",
);
