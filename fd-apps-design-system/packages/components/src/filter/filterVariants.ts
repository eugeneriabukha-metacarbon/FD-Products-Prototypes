import { cva, type VariantProps } from "class-variance-authority";

/**
 * Filter styling — the filter-chip trigger (Figma `base-filter`, node
 * 5026:36907) and its count badge. Binds ONLY to the semantic `--color-*` token
 * layer (never primitives, never arbitrary values); theme switching is automatic
 * via the `.dark` class, so no `dark:` variants are needed.
 *
 * The Filter reuses the shared `SelectListbox` for its dropdown (rows + footer)
 * — this file owns only the pill trigger + the count badge, both unique to the
 * Filter's visual (the listbox card + option rows are the select family's).
 */

/**
 * The pill trigger (Figma `base-filter` node 5026:36907). A `<button>` shaped
 * as a chip: `h-10` / `rounded-sm` / `px-3`, a `gap-1.5` row of the label, an
 * optional count badge, and a trailing caret. Surface + border are the
 * `card/neutral/primary` family (strip `neutral` → `card-primary-*`), the label
 * is `body-03` in `card-primary-foreground`.
 *
 * FOCUS is the ADR-0010/0014 system ring (this is a button-shaped control, not
 * a text field): `rounded-sm outline-none` at rest, then a 2px `--focus` ring
 * with a 2px offset on `:focus-visible` only, suppressed when disabled. Per the
 * TW4 gotcha (ADR-0014), `outline-solid` MUST accompany `outline-2` or the ring
 * paints at style `none` (invisible). The caret + label colours are applied by
 * `FilterTrigger` (they depend on open/hover runtime state), so this file owns
 * the shared layout + surface + focus + disabled shell.
 */
export const filterTriggerVariants = cva(
  [
    // Layout — chip row: label + optional badge + caret, 6px gap (spacing/1-5).
    "inline-flex h-10 w-fit shrink-0 items-center gap-1.5",
    "rounded-sm px-3",
    "cursor-pointer text-left align-middle transition-colors",
    // Surface — card/neutral/primary (the `neutral` segment is stripped in the
    // token name transform → `card-primary-*`).
    "bg-card-primary-background border border-card-primary-border",
    // System focus ring (ADR-0010/0014). `outline-solid` restores the style the
    // base `outline-none` zeroed (TW4 gotcha) so the 2px ring actually paints.
    "outline-none",
    "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    // Decorative svgs (caret) never intercept the click and keep explicit sizes.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      disabled: {
        // Muted + not-allowed; the ring is suppressed (a disabled control is not
        // focusable, but belt-and-braces if a consumer forces focus).
        true: "cursor-not-allowed focus-visible:outline-none",
        false: "",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export type FilterTriggerVariantsProps = VariantProps<
  typeof filterTriggerVariants
>;

/**
 * The count badge shown in the multi-select trigger when ≥1 option is selected
 * (Figma `CountBadge` node 5026:5358). A small brand pill: `brand-primary`
 * background, `rounded-xs`, `min-w-5 h-5` (20px), centred `text-xs` medium in
 * the brand foreground, `px-0.5` (2px) so a two-digit count still fits inside
 * the 20px min-width. Implemented as a local piece (not a shared `Badge`) per
 * ADR-0016 — a shared badge is deferred until a second, non-token-input
 * consumer justifies the abstraction; the Figma `CountBadge` is a distinct
 * component from `DiscardBadge`, so it does not qualify as that second consumer.
 */
export const filterCountBadgeVariants = cva([
  "inline-flex h-5 min-w-5 items-center justify-center px-0.5",
  "rounded-xs bg-brand-primary-background",
  // `body-04` = the Figma badge text style (Archivo Regular 12/16) — NOT
  // a `caption-*` utility (those render Chakra Petch, `font-caption`).
  "body-04 text-brand-primary-foreground",
]);

export type FilterCountBadgeVariantsProps = VariantProps<
  typeof filterCountBadgeVariants
>;
