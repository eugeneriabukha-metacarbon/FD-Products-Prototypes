import { cva, type VariantProps } from "class-variance-authority";

/**
 * InlineSelect trigger styling — the inline-text select (Figma node 4926:5462).
 * Unlike `Select`, there is NO field box: the trigger is a run of inline text
 * (the value label) plus a small filled caret. Binds ONLY to the semantic
 * `--color-*` token layer (never primitives, never arbitrary values); theme
 * switching is automatic via the `.dark` class.
 *
 * Two `variation`s map to the two card-foreground families:
 * - `primary`   → neutral card foreground (`card-primary-foreground`), muted
 *   caret/placeholder (`card-primary-foreground-muted`).
 * - `secondary` → brand card foreground (`card-brand-secondary-foreground`),
 *   muted caret/placeholder (`card-brand-secondary-foreground-muted`).
 *
 * FOCUS is the ADR-0010 system ring — a momentary control (not a text field, so
 * NOT the border-recolor treatment `Select`/`Input` use): 2px `--focus` stroke,
 * 2px offset, on `:focus-visible` only, with a 2px (`radius/xs`) corner to match
 * the Figma focus ring. Suppressed when disabled. The placeholder / value / caret
 * colours are applied by `InlineSelectTrigger` (they depend on runtime state:
 * whether a value is selected, and whether the caret follows the muted or full
 * foreground), so this file owns the shared layout + focus + disabled shell.
 */
export const inlineSelectVariants = cva(
  [
    // Inline text run: label + caret, 4px gap (Figma spacing/1), baseline-ish
    // centered. `w-fit` so the ring hugs the content, not a full-width box.
    "inline-flex w-fit items-center gap-1",
    // Behaves as inline text — no field padding/background/border.
    "cursor-pointer bg-transparent p-0 text-left align-middle",
    "transition-colors",
    // System focus ring (ADR-0010): momentary-control treatment, not a border
    // recolor. Kill the default outline, then draw the 2px --focus ring with a
    // 2px gap on :focus-visible only. `rounded-xs` matches the Figma ring.
    "rounded-xs outline-none",
    "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    // Decorative svgs (caret / leading slot) never intercept the click and keep
    // their explicit sizes.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variation: {
        primary: "",
        secondary: "",
      },
      disabled: {
        // Muted + not-allowed, and the focus ring is suppressed (a disabled
        // control is not focusable, but belt-and-braces if a consumer forces it).
        true: "cursor-not-allowed focus-visible:outline-none",
        false: "",
      },
    },
    defaultVariants: {
      variation: "primary",
      disabled: false,
    },
  },
);

export type InlineSelectVariantsProps = VariantProps<
  typeof inlineSelectVariants
>;
