import { cva, type VariantProps } from "class-variance-authority";

/**
 * Switch styling — mirrors the Figma `toggle-switch` component set
 * (node 5050:2204: `state` default/hover/focused/disabled × `selected` yes/no,
 * one 56×24 size) and binds ONLY to the semantic token layer (never
 * primitives). Theme switching is automatic via the `.dark` class, so no
 * `dark:` variants are needed.
 *
 * As with Checkbox and Radio (ADR-0010), every Figma axis is an *interaction*
 * state, so there is no prop-driven variant table: `selected` maps to the
 * native `:checked` pseudo-class and `state` maps to `:hover` /
 * `:focus-visible` / `:disabled`. This cva styles the TRACK (the `appearance-
 * none` `<input>` itself); the sliding thumb is a sibling element revealed and
 * translated via `peer-checked:` in <Switch>.
 *
 * Track state → token map (from the Figma variants):
 * - off default:            `bg-button-secondary-background` + `border-button-secondary-border`
 * - off hover:              border strengthens to `button-secondary-border-accent`
 * - off focused:            border stays `button-secondary-border` (+ the shared focus ring)
 * - off disabled:           border weakens to `button-secondary-border-muted`
 * - on (default/focused):   `bg-brand-primary-background`, border removed
 * - on hover:               bg strengthens to `brand-primary-accent`
 * - on disabled:            neutral `bg-button-primary-muted`, border removed
 *
 * Checked × hover/disabled combinations are compound utilities
 * (`checked:hover:`, `checked:disabled:`) so precedence rides on selector
 * specificity, not Tailwind's stylesheet order. The border is always declared
 * (`border`) so the track's box model is identical on/off — the on states set
 * `border-transparent` rather than removing the border, keeping the 46px inner
 * track width (and therefore the 22px thumb travel) constant across states.
 *
 * Focus ring: the ADR-0010 system standard (2px `--focus` stroke, 2px offset,
 * `:focus-visible` only), following the track's `rounded-full` radius — the
 * same treatment as Checkbox/Radio, overriding whatever the Figma node draws.
 */
export const switchVariants = cva([
  // Track — 56×24 (`h-6 w-14`), fully round (Figma `radius/full`), 4px inset
  // (`p-1` = Figma `spacing/1`). `appearance-none` strips the native checkbox
  // box; `peer` lets the sibling thumb react to :checked / :disabled.
  "peer inline-flex h-6 w-14 shrink-0 items-center rounded-full border p-1",
  "appearance-none cursor-pointer transition-colors",
  // Off — default
  "bg-button-secondary-background border-button-secondary-border",
  // Off — hover strengthens the border (focused keeps the default border)
  "hover:border-button-secondary-border-accent",
  // Focus ring — suppress the native ring, draw the shared `--focus` ring the
  // same way Checkbox/Radio do: 2px stroke, 2px offset (`outline-solid`
  // restores what `outline-none` zeroed). Circular via the track's rounding.
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus",
  // On — brand fill, border made transparent (kept for a constant box model)
  "checked:bg-brand-primary-background checked:border-transparent",
  "checked:hover:bg-brand-primary-accent",
  // Disabled — off keeps the white track with a muted border; on drops to a
  // neutral muted fill (per Figma). Border transparent when on, muted when off.
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-button-secondary-border-muted",
  "checked:disabled:bg-button-primary-muted checked:disabled:border-transparent",
]);

export type SwitchVariantsProps = VariantProps<typeof switchVariants>;
