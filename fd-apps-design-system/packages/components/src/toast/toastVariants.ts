import { cva } from "class-variance-authority";

/**
 * Toast styling — the Figma `Toast` (node `5020:2203`). Binds ONLY to the
 * semantic token layer (never primitives); theme switching is automatic via
 * `.dark`, so no `dark:` variants. The surface is the fixed dark "reversed"
 * card, so the root is not variation-dependent — only the leading status
 * icon's color changes with `variation`.
 */

/** Root row — dark reversed surface; identical for both variations. */
export const toastVariants = cva(
  "flex items-center gap-4 rounded-sm bg-card-reversed-background px-5 py-4",
);

/** Leading 20px status icon slot; color per variation. */
export const toastIconVariants = cva(
  "flex shrink-0 items-center [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variation: {
        success: "text-success-primary-foreground",
        error: "text-destructive-primary-foreground",
      },
    },
    defaultVariants: { variation: "success" },
  },
);

/**
 * Trailing close button — muted, brightens on hover; shared ADR-0010 focus
 * ring (`rounded-xs` so the ring follows the small hit area).
 */
export const toastCloseVariants = cva([
  "flex shrink-0 cursor-pointer items-center rounded-xs text-card-reversed-foreground-muted",
  "transition-colors hover:text-card-reversed-foreground",
  "[&_svg]:size-5 [&_svg]:shrink-0",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus",
]);
