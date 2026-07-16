import { cva } from "class-variance-authority";

/**
 * Dialog styling — the Figma `Dialog` card (nodes `4985:12074` / `4988:1882`)
 * plus the overlay plumbing the library owns. Binds ONLY to the semantic token
 * layer (never primitives, never the mode plumbing); theme switching is
 * automatic via the `.dark` class, so no `dark:` variants are needed.
 *
 * Dialog is presentation-neutral: there is no `variation` prop (see the design
 * spec / ADR-0022). The "basic" vs "destructive" Figma looks come entirely from
 * the app-supplied header icon and footer `Button variation`, so these tables
 * carry no variant axes — they are static class sets composed with `cn`.
 */

/**
 * The full-viewport backdrop. Fixed over everything, flex-centres the card, and
 * paints the `--overlay` semantic token (a derived-alpha value, ADR-0005 — never
 * an ad-hoc `bg-black/50`). `p-4` (1rem each side = 2rem total) reserves the
 * viewport gutter the card's `max-w`/`max-h` calc subtract, so the card never
 * touches an edge.
 */
export const dialogOverlayVariants = cva([
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  "bg-overlay",
]);

/**
 * The centred card. `w-[438px]` is the Figma-exact default width; there is no
 * container token at 438px (closest is `--container-md` = 448px) and no width is
 * expressible on the 4px spacing grid, so an arbitrary value is used
 * deliberately (same posture as `scrollbarVariants`) and is `className`-
 * overridable. `max-w`/`max-h` are viewport calcs (no token can express
 * `100vw − gutter`) that keep the card inside the `p-4` overlay gutter; combined
 * with the flex column below they let `Dialog.Body` scroll internally rather
 * than let the card exceed the viewport.
 */
export const dialogContentVariants = cva([
  "relative flex w-[438px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] flex-col gap-6",
  "rounded-md border border-border bg-card-background p-6 shadow-s",
  // Programmatic-focus fallback target (no visible ring when focused as a last
  // resort by the focus trap — the card is not an interactive control).
  "outline-none",
]);

/**
 * Header block: a stacked 32px decorative icon above the title/description
 * column. `gap-4` (16px) between them, `items-start` left-aligns children.
 * `shrink-0` keeps it fixed while the body scrolls. NOT `relative` on purpose —
 * the close button positions against the card (`Dialog.Content`), so the header
 * must not become the positioning anchor.
 */
export const dialogHeaderVariants = cva([
  "flex shrink-0 flex-col items-start gap-4",
]);

/** Decorative 32px icon slot (`aria-hidden` on the element in `Dialog.Header`). */
export const dialogHeaderIconVariants = cva([
  "flex items-center text-foreground [&_svg]:size-8 [&_svg]:shrink-0",
]);

/**
 * Title + description column: `gap-2` (8px) between the two, `w-full` so both
 * span the header width. When the close X is shown on an icon-less header the
 * component adds `pr-8` here so a long title clears the corner button (with an
 * icon the title sits below the X, so no reservation is needed).
 */
export const dialogHeaderTextVariants = cva(["flex w-full flex-col gap-2"]);

/**
 * The 16px muted X close button. Absolutely positioned against the card
 * (`Dialog.Content` is the `relative` anchor) at `top-6 right-6` — always 24px
 * from the card's top and right regardless of whether the header has an icon, so
 * it never shifts with header content. Focus ring per ADR-0010.
 */
export const dialogCloseButtonVariants = cva([
  "absolute right-6 top-6 flex cursor-pointer items-center justify-center rounded-xs",
  "text-foreground-muted transition-colors hover:text-foreground",
  "[&_svg]:size-4 [&_svg]:shrink-0",
  // TW4 needs `outline-solid` to render a solid ring (a bare `outline` won't).
  "outline-none focus-visible:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
]);

/**
 * Body slot: sizes to content and, inside the card's bounded flex column,
 * becomes the scroll region (`min-h-0 flex-1 overflow-y-auto`) so overflowing
 * content scrolls internally and the dialog never exceeds the viewport. Custom
 * scrollbar is composed in via `scrollbarVariants` in the component.
 */
export const dialogBodyVariants = cva([
  "min-h-0 flex-1 overflow-y-auto text-foreground",
]);

/**
 * Footer action row: full width, `gap-2`, children stretched to equal width
 * (Figma's two-button layout — each button is `flex: 1 0 0`). `shrink-0` keeps
 * it pinned while the body scrolls.
 *
 * Two-level stretch: `[&>*]:flex-1` grows each direct child equally, but a cut-
 * corner `Button` renders an `inline-block` wrapper span around its `<button>`,
 * so the span fills the flex track while the inner button would stay content-
 * width. `[&_button]:w-full` stretches that inner button to fill the track (a
 * ghost button, which is the direct flex child, keeps its `flex:1 1 0%` basis).
 * Targets the element, not `[data-slot=button]`, because a `Dialog.Close asChild`
 * wrapper overrides the inner button's `data-slot` to `dialog-close`. The
 * button's own `justify-center` then centers the label, matching Figma.
 */
export const dialogFooterVariants = cva([
  "flex w-full shrink-0 gap-2 [&>*]:flex-1 [&_button]:w-full",
]);
