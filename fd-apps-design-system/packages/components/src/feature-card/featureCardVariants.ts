import { cva } from "class-variance-authority";

/**
 * FeatureCard styling — the Figma `feature-card` (node `4854:144741`). Binds
 * ONLY to the `card-*` semantic token layer (never primitives / mode
 * plumbing); theme switching is automatic via `.dark`, so no `dark:` variants.
 *
 * `feature-card` is a navigation card: the whole surface is the click target.
 * The Figma `border-r` divider is NOT baked in — grouping/dividers are a
 * consumer layout concern (a standalone card carries no stray border).
 */

/**
 * The card row. `h-16`=64px, `gap-3`=12px, `px-4`=16px, `py-3`=12px.
 * `no-underline` strips the default `<a>` underline (the root may be an anchor
 * or a cloned link). Interactive roots add hover accent + the ADR-0010 focus
 * ring; a presentational root stays static.
 */
export const featureCardVariants = cva(
  "flex h-16 items-center gap-3 px-4 py-3 bg-card-background no-underline",
  {
    variants: {
      interactive: {
        true: [
          "cursor-pointer transition-colors hover:bg-card-accent",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus",
        ],
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  },
);

/** Leading 24px decorative icon slot (`foreground`). */
export const featureCardLeadingVariants = cva(
  "flex shrink-0 items-center text-card-foreground [&_svg]:size-6 [&_svg]:shrink-0",
);

/** Trailing 24px decorative icon slot (`foreground-muted`). */
export const featureCardTrailingVariants = cva(
  "flex shrink-0 items-center text-card-foreground-muted [&_svg]:size-6 [&_svg]:shrink-0",
);

/** Title + subtitle column. `min-w-0` + `flex-1` enable text truncation. */
export const featureCardTextVariants = cva("flex min-w-0 flex-1 flex-col");

/** Title + inline caret row. `gap-0.5`=2px; `min-w-0` lets the title truncate. */
export const featureCardTitleRowVariants = cva(
  "flex min-w-0 items-center gap-0.5",
);

/** Inline 16px muted caret slot. */
export const featureCardCaretVariants = cva(
  "flex shrink-0 items-center text-card-foreground-muted [&_svg]:size-4 [&_svg]:shrink-0",
);
