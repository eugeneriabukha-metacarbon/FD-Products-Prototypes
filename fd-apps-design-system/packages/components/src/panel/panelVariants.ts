import { cva } from "class-variance-authority";

/**
 * Panel styling — the Figma `panel` card (node `5041:4303`). Binds ONLY to the
 * `card-*` semantic token layer (never primitives, never mode plumbing); theme
 * switching is automatic via `.dark`, so no `dark:` variants are needed.
 *
 * Panel is presentation-neutral: no `variation` prop (see ADR-0023). The basic
 * vs branded looks come from the app-supplied header icon + footer `Button`
 * variation, so these tables carry no variant axes.
 */

/**
 * The card. `w-80` = 320px (Figma-exact default width; overridable via
 * `className`). `p-5` = spacing/5 (20px), `gap-4` = spacing/4 (16px),
 * `rounded-md` = radius/md (6px), `border` = border-width/1 (1px).
 */
export const panelVariants = cva([
  "flex w-80 flex-col gap-4 rounded-md border border-card-border bg-card-background p-5",
]);

/**
 * Header row — a HORIZONTAL row (the key divergence from Dialog's vertical
 * stack). `items-start` so the close button pins to the top of the row while
 * the content block's icon+text center against each other. `gap-4` = 16px.
 */
export const panelHeaderVariants = cva(["flex items-start gap-4"]);

/**
 * Header content block: inline icon + title/description column, vertically
 * centered against each other (`items-center`), `gap-3` = 12px. `flex-1 min-w-0`
 * takes the row's free space and lets long titles truncate rather than push the
 * close button out.
 */
export const panelHeaderContentVariants = cva([
  "flex min-w-0 flex-1 items-center gap-3",
]);

/** Inline 24px decorative icon slot (`aria-hidden` on the element). */
export const panelHeaderIconVariants = cva([
  "flex items-center text-card-foreground [&_svg]:size-6 [&_svg]:shrink-0",
]);

/** Title + description column (stacked). `min-w-0` enables text truncation. */
export const panelHeaderTextVariants = cva(["flex min-w-0 flex-col"]);

/**
 * The 16px muted close X — INLINE at the row's end (not absolute like Dialog).
 * `shrink-0` keeps it from collapsing. Focus ring per ADR-0010 (TW4 needs
 * `outline-solid`).
 */
export const panelCloseButtonVariants = cva([
  "flex shrink-0 cursor-pointer items-center justify-center rounded-xs",
  "text-card-foreground-muted transition-colors hover:text-card-foreground",
  "[&_svg]:size-4 [&_svg]:shrink-0",
  "outline-none focus-visible:text-card-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
]);

/** Body slot: sizes to content (no fixed height — Figma's 160px is demo-only). */
export const panelBodyVariants = cva(["text-card-foreground"]);

/**
 * Footer action row: `gap-2` = 8px, buttons CONTENT-WIDTH and LEFT-ALIGNED
 * (Figma `items-start`). Unlike `Dialog.Footer`, buttons are NOT stretched to
 * equal width.
 */
export const panelFooterVariants = cva(["flex items-start gap-2"]);
