import { cva, type VariantProps } from "class-variance-authority";

/**
 * Button styling — mirrors the Figma `button` component set
 * (`variation` × `size` × `state` × `iconOnly`) and binds ONLY to the semantic
 * `--button-*` token layer (never primitives). Theme switching is automatic via
 * the `.dark` class, so no `dark:` variants are needed.
 *
 * Notes on states:
 * - `hover` / `active` are handled by the `:hover` / `:active` utilities here.
 * - `focus` is the shared focus ring (`outline-focus`), applied in the base.
 * - `disabled` is a shared NEUTRAL-muted look for every filled variant (Figma
 *   greys out primary/brand/destructive identically), hence they all reuse
 *   `button-primary-muted` / `button-primary-foreground-muted`.
 * - `loading` is a runtime prop on <Button>, not a style variant.
 *
 * Shape (cut corners) and the secondary border are handled in <Button>: the
 * chamfer is a measured `clip-path` and the secondary outline is an SVG stroke
 * that follows that shape (a CSS border would clip square across the chamfer).
 */
export const buttonVariants = cva(
  [
    // Layout
    "inline-flex shrink-0 items-center justify-center gap-1",
    // Type — the Figma `button-01` text style (Archivo Medium 14/20)
    "button-01",
    // Shape — cut corners are applied as a clip-path in <Button>; keep the box square
    "rounded-none",
    // Transition
    "transition-colors cursor-pointer",
    // Suppress the native ring. The Figma focus ring is drawn OUTSIDE the
    // clip-path (which would swallow an outline here), so cut-corner variants
    // render it on the wrapper in <Button>; ghost renders it directly (below).
    "outline-none",
    // Disabled
    "disabled:pointer-events-none disabled:cursor-not-allowed",
    // Icons
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variation: {
        primary: [
          "bg-button-primary-background text-button-primary-foreground",
          "hover:bg-button-primary-accent active:bg-button-primary-accent",
          "disabled:bg-button-primary-muted disabled:text-button-primary-foreground-muted",
        ],
        brand: [
          "bg-button-brand-primary-background text-button-brand-primary-foreground",
          "hover:bg-button-brand-primary-accent active:bg-button-brand-primary-accent",
          "disabled:bg-button-primary-muted disabled:text-button-primary-foreground-muted",
        ],
        destructive: [
          "bg-button-destructive-background text-button-destructive-primary-foreground",
          "hover:bg-button-destructive-accent active:bg-button-destructive-accent",
          "disabled:bg-button-primary-muted disabled:text-button-primary-foreground-muted",
        ],
        // Outline — background fill + an SVG stroke border drawn in <Button>.
        secondary: [
          "bg-button-secondary-background text-button-secondary-foreground",
          "hover:text-button-secondary-foreground-accent active:text-button-secondary-foreground-accent",
          "disabled:text-button-secondary-foreground-muted",
        ],
        // No background, no cut corner — so no wrapper; ring on the element.
        // `outline-solid` restores the style that base `outline-none` zeroed.
        ghost: [
          "bg-transparent text-button-secondary-foreground",
          "hover:text-button-secondary-foreground-accent active:text-button-secondary-foreground-accent",
          "disabled:text-button-secondary-foreground-muted",
          // `rounded-xs` (2px) keeps the ghost focus ring as sharp as the other
          // variants' corners (which now use sharp chamfers + 2px square corners).
          "rounded-xs focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        ],
      },
      size: {
        sm: "h-8 px-2.5 [&_svg:not([class*='size-'])]:size-4",
        md: "h-10 px-2.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 px-3 [&_svg:not([class*='size-'])]:size-4",
      },
      iconOnly: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Icon-only: square footprint, no horizontal padding.
      { iconOnly: true, size: "sm", className: "w-8 px-0" },
      { iconOnly: true, size: "md", className: "w-10 px-0" },
      { iconOnly: true, size: "lg", className: "w-12 px-0" },
      // Ghost has no chamfer/background, so it sits flush with no inset padding.
      { variation: "ghost", iconOnly: false, className: "px-0" },
    ],
    defaultVariants: {
      variation: "primary",
      size: "md",
      iconOnly: false,
    },
  },
);

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
