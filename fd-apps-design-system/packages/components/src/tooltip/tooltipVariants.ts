import { cva } from "class-variance-authority";

/**
 * Tooltip bubble styling — the Figma `Tooltip` (node `5153:4063`). Binds ONLY to
 * the semantic token layer (never primitives); theme switching is automatic via
 * `.dark`, so no `dark:` variants.
 *
 * The surface is the fixed dark "reversed" card — the SAME utilities
 * `toastVariants.ts` binds (`bg-card-reversed-background` /
 * `text-card-reversed-foreground`) — so the two dark surfaces stay in lock-step.
 * There is no `variation`/`size` axis (the Figma frame shows a single bubble),
 * and no arrow/caret element (absent from Figma).
 *
 * `max-w-[244px]` is the one allowed arbitrary value: it is the Figma-exact wrap
 * boundary (long text wraps; the sample's single-word `whitespace-nowrap` is a
 * content artifact and is intentionally NOT carried over). `pointer-events-none`
 * is intrinsic — the bubble is descriptive, never interactive, so it can never
 * steal the pointer or cause a hover-leave flicker.
 */
export const tooltipVariants = cva([
  "pointer-events-none max-w-[244px] rounded-sm bg-card-reversed-background px-1.5 py-1",
  "body-04 text-center text-card-reversed-foreground shadow-xs",
]);
