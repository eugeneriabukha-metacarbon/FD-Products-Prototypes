import { cva, type VariantProps } from "class-variance-authority";

/**
 * Select styling — the parts of the Select that are NOT already solved by
 * `inputVariants`. Binds ONLY to the semantic token layer (never primitives,
 * never arbitrary values); theme switching is automatic via the `.dark` class,
 * so no `dark:` variants are needed.
 *
 * The trigger's field-row styling (field/line × focus-border × error) is reused
 * verbatim from `../input/inputVariants` — the Figma Select field IS the
 * base-input field — so it is NOT re-declared here. This file owns only:
 *
 * - `selectListboxVariants` — the portaled dropdown panel (card surface).
 * - `selectOptionVariants` — the option rows (resting / active / selected /
 *   disabled), where "active" is the roving `aria-activedescendant` highlight
 *   (keyboard/pointer), NOT the browser `:focus` (focus never leaves the
 *   trigger in the activedescendant pattern).
 */

/**
 * The portaled dropdown surface. A card: white background, 1px card border,
 * 4px radius (`radius/sm`, matching the `field` trigger), and the Figma
 * `shadow/s` drop shadow. Vertical padding gives the first/last rows breathing
 * room; `max-height` + `overflow-y-auto` cap the list and scroll internally
 * (the pixel cap is applied inline in `SelectListbox` alongside the measured
 * position, since it is layout- not token-driven).
 */
export const selectListboxVariants = cva([
  "flex flex-col",
  "bg-card-background border border-card-border rounded-sm shadow-s",
  // Small vertical inset so the first/last option isn't flush to the border.
  "py-1",
  // Scroll when the list outgrows its max-height (set inline from the rect).
  "overflow-y-auto",
  // The panel is not itself focusable; focus stays on the trigger.
  "outline-none",
]);

export type SelectListboxVariantsProps = VariantProps<
  typeof selectListboxVariants
>;

/**
 * Footer-mode panel chrome. When `<SelectListbox>` gets a `footer` slot the
 * card surface (background/border/radius/shadow) moves from the `<ul>` to a
 * wrapping panel `<div>`, so the footer can pin BELOW the scrollable list while
 * the list scrolls under the `max-height` cap. The `<ul>` inside then carries
 * ONLY its scroll + `py-1` inset (see `selectListboxScrollVariants`), never the
 * chrome — keeping the no-footer path (the `<ul>` as the panel) byte-identical.
 *
 * The panel itself is a flex COLUMN clipping to its rounded corners
 * (`overflow-hidden`) so the footer's top border and the list's scroll both sit
 * inside the radius; `min-h-0` lets the `<ul>` shrink and scroll rather than
 * push the footer out of the capped panel.
 */
export const selectListboxPanelVariants = cva([
  "flex flex-col min-h-0",
  "bg-card-background border border-card-border rounded-sm shadow-s",
  "overflow-hidden",
  "outline-none",
]);

/**
 * The scrolling `<ul>` when it lives INSIDE a footer panel: it owns the scroll
 * and the `py-1` inset (moved off the panel chrome above), and `min-h-0` +
 * `flex-1` so it takes the remaining height and scrolls under the cap while the
 * footer stays pinned. No card chrome here — the panel owns it.
 */
export const selectListboxScrollVariants = cva([
  "flex flex-col min-h-0 flex-1",
  "py-1",
  "overflow-y-auto",
  "outline-none",
]);

/**
 * The pinned footer region under the list (Filter's Reset row). A top divider
 * (`border-t-card-border`) separates it from the scrolling list; it never
 * scrolls. Horizontal padding matches an option row's inset (`px-3`) so the
 * footer's content left-aligns with the option labels.
 */
export const selectListboxFooterVariants = cva([
  "shrink-0",
  "border-t border-t-card-border",
  "px-3 py-1",
]);

/**
 * An option row. Layout is a horizontal flex row (leading checkbox in multi);
 * typography is `body-03` (Archivo 14/20). Colours bind to the Figma
 * `selectable-list-item` (node 4921:8203) tokens — the **card/neutral** family
 * (this is content on a card surface), NOT the `input-*` family the trigger
 * borrows: resting text `text-foreground`, disabled text `text-foreground-muted`
 * (the row is also skipped by keyboard nav in `Select`). The `active` state is
 * the keyboard/pointer highlight driven by `aria-activedescendant` — it fills
 * with `bg-card-accent` (Figma `card/neutral/normal/accent`) so the highlight
 * reads as "this row is targeted".
 *
 * `selected` differs by mode (`multiple`):
 * - **single**: the single-select selected state — a brand-tinted row
 *   (`bg-card-brand-accent`), a 3px left accent bar
 *   (`border-l-3 border-l-card-brand-border-accent`), and brand foreground text
 *   (`text-card-brand-foreground`). NO trailing check — the fill + bar are the
 *   affordance. This wins over the neutral `active` highlight so a selected row
 *   stays branded on hover.
 * - **multi**: no row tint — the leading checkbox carries the selected look
 *   (matching the Figma multiselect/selected state), and the neutral `active`
 *   highlight still applies on hover.
 */
export const selectOptionVariants = cva(
  [
    "body-03",
    "flex w-full items-center gap-2",
    "px-3 py-2",
    "cursor-pointer select-none",
    "transition-colors",
    // Reserve the 3px left accent bar on EVERY row (transparent by default,
    // recoloured only when single-selected). Keeping the border-box constant
    // across rows means selecting one never shifts its text right — same
    // no-layout-shift trick Input uses for its `showBottomLine` bottom line.
    "border-l-3",
    // Mirror the 3px on the right (always transparent) so content is inset
    // equally on both sides — the left accent bar would otherwise make the left
    // padding read 3px larger than the right.
    "border-r-3 border-r-transparent",
    // NOTE: no text-/border-colour in the base. cva concatenates class strings
    // without resolving conflicting Tailwind utilities, so a base colour + a
    // compound colour would both survive and CSS source-order (not our intent)
    // would pick the winner. Every state below sets exactly ONE text colour and
    // ONE left-border colour via compound variants.
  ],
  {
    variants: {
      active: { true: "", false: "" },
      selected: { true: "", false: "" },
      multiple: { true: "", false: "" },
      disabled: { true: "cursor-not-allowed", false: "" },
    },
    compoundVariants: [
      // ── Text colour (exactly one matches per state) ──
      { disabled: true, className: "text-foreground-muted" },
      { disabled: false, selected: false, className: "text-foreground" },
      // Multi keeps the normal foreground when selected (the checkbox marks it).
      {
        disabled: false,
        selected: true,
        multiple: true,
        className: "text-foreground",
      },
      // Single-select selected → brand foreground (Figma node 4921:8203).
      {
        disabled: false,
        selected: true,
        multiple: false,
        className: "text-card-brand-foreground",
      },

      // ── Left accent bar colour (exactly one matches per state) ──
      // Invisible on every row except the single-select selected one, where it
      // becomes the brand accent. Width is reserved in the base, so this is a
      // pure colour change — no content shift.
      { selected: false, className: "border-l-transparent" },
      { selected: true, multiple: true, className: "border-l-transparent" },
      {
        selected: true,
        multiple: false,
        className: "border-l-card-brand-border-accent",
      },

      // ── Background ──
      // Neutral hover/keyboard highlight (Figma card/neutral/normal/accent) —
      // every row EXCEPT a single-select selected one (which stays branded).
      { active: true, selected: false, className: "bg-card-accent" },
      {
        active: true,
        selected: true,
        multiple: true,
        className: "bg-card-accent",
      },
      // Single-select selected: brand-tinted row. No neutral `active` bg matches
      // this combo, so it stays branded on hover.
      { selected: true, multiple: false, className: "bg-card-brand-accent" },
    ],
    defaultVariants: {
      active: false,
      selected: false,
      multiple: false,
      disabled: false,
    },
  },
);

export type SelectOptionVariantsProps = VariantProps<
  typeof selectOptionVariants
>;
