import { cva } from "class-variance-authority";

/**
 * Accordion styling — the Figma `Accordion` item (node `4887:150988`), shown in
 * Collapsed / Hover / Expanded. Binds ONLY to the `card-*` semantic token layer
 * (never primitives, never mode plumbing); theme switching is automatic via
 * `.dark`, so no `dark:` variants are needed.
 *
 * Accordion is presentation-neutral (no `variation`/`size` axes). The only style
 * axis is open-vs-closed, which drives the trigger's bottom padding so the
 * Figma spacing holds in both states (see `accordionTriggerVariants`).
 */

/** Root container — a plain vertical stack; the card chrome belongs to the consumer. */
export const accordionRootVariants = cva(["flex flex-col"]);

/**
 * One item row. `border-b border-card-border` is the Figma divider (present on
 * every item, including the last). `disabled` dims the whole row (matching the
 * `has-[:disabled]:opacity-60` precedent in SelectableFeatureCard).
 */
export const accordionItemVariants = cva(["border-b border-card-border"], {
  variants: {
    disabled: {
      true: "opacity-60",
      false: "",
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

/**
 * The trigger button — the full-width clickable header row (`flex gap-4
 * items-start`, `pt-3` = spacing/3). It is a `group` so the trailing icon can
 * darken on row hover (see `accordionTriggerIconVariants`).
 *
 * Bottom padding is the `open` axis, reproducing the Figma spacing exactly:
 * - closed → `pb-3` (12px), so the collapsed row reads as `py-3`.
 * - open   → `pb-2` (8px), which becomes the `gap-2` between the title and the
 *   description in `Accordion.Content` (the content carries the row's `pb-3`).
 *
 * Focus ring uses the repo TW4 pattern (`outline-solid` is required — see
 * Panel/Select and ADR-0010).
 */
export const accordionTriggerVariants = cva(
  [
    "group flex w-full cursor-pointer items-start gap-4 pt-3 text-left",
    "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      open: {
        true: "pb-2",
        false: "pb-3",
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

/** Title slot — `body-02-medium` foreground, takes the row's free width. */
export const accordionTriggerTitleVariants = cva([
  "body-02-medium min-w-0 flex-1 break-words text-card-foreground",
]);

/**
 * Trailing 16px icon slot (`aria-hidden` on the element). Muted by default,
 * darkening to foreground on row `:hover` (the Figma "Hover" state — driven by
 * the trigger `group`, done in CSS, not a prop). `shrink-0` keeps it from
 * collapsing.
 */
export const accordionTriggerIconVariants = cva([
  "flex shrink-0 items-center text-card-foreground-muted transition-colors",
  "group-hover:text-card-foreground",
  "[&_svg]:size-4 [&_svg]:shrink-0",
]);

/**
 * The collapsible region. `pb-3` (12px) matches the Figma row's bottom padding;
 * top spacing comes from the trigger's `pb-2` so title→description reads as
 * `gap-2`. Default text style is `body-03` muted (overridable — the slot accepts
 * arbitrary children).
 */
export const accordionContentVariants = cva([
  "body-03 pb-3 text-card-foreground-muted",
]);
