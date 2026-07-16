import { cva, type VariantProps } from "class-variance-authority";

/**
 * Radio styling — mirrors the Figma `radio-control` component set
 * (node 5117:5677: `state` × `selected`, one 20×20 size) and binds ONLY to the
 * semantic token layer (never primitives). Theme switching is automatic via
 * the `.dark` class, so no `dark:` variants are needed.
 *
 * As with Checkbox (ADR-0010), every Figma axis here is an *interaction*
 * state, so there is no prop-driven variant table: `selected` maps to the
 * native `:checked` pseudo-class and `state` maps to `:hover` /
 * `:focus-visible` / `:disabled`.
 *
 * State → token map (from the Figma variants):
 * - default:                 `bg-background` + `border-border`
 * - hover (unselected):      border strengthens to `border-accent`
 * - focused:                 border stays at the default; the ring alone marks focus
 * - selected:                `bg-brand-primary-background` + `border-brand-primary-border`
 * - selected hover/focused:  bg strengthens to `brand-primary-accent`
 * - disabled (either):       shared neutral look — `bg-background` + `border-border-muted`
 * - focused additionally draws the shared 2px `--focus` ring, offset 2px from
 *   the circle — the ADR-0010 system standard (the Figma node draws its ring
 *   flush at inset −2px; component nodes do not override the system ring).
 *   The CSS outline follows `rounded-full`, so the ring is circular.
 *
 * Checked × hover/focus/disabled combinations are written as compound
 * utilities (`checked:hover:`, `checked:disabled:`) so precedence is decided
 * by selector specificity, not by Tailwind's stylesheet ordering.
 *
 * The ● indicator is a sibling of the input (an `<input>` can't have
 * children), revealed via `peer-checked:` in <Radio>.
 */
export const radioVariants = cva([
  // Circle — 20×20 (`size-5`), fully round (Figma `radius/full`), 1px border.
  // `peer` lets the sibling indicator react to :checked / :disabled.
  "peer size-5 shrink-0 appearance-none rounded-full border",
  "cursor-pointer transition-colors",
  // Default
  "bg-background border-border",
  // Hover (unselected) — focus keeps the DEFAULT border; only the ring signals
  // focus (so focus doesn't visually read as hover).
  "hover:border-border-accent",
  // Focus ring — suppress the native ring, draw the shared `--focus` ring the
  // same way Checkbox and ghost Button do: 2px stroke, 2px offset
  // (`outline-solid` restores what `outline-none` zeroed).
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus",
  // Selected
  "checked:bg-brand-primary-background checked:border-brand-primary-border",
  "checked:hover:bg-brand-primary-accent checked:hover:border-brand-primary-border",
  "checked:focus-visible:bg-brand-primary-accent checked:focus-visible:border-brand-primary-border",
  // Disabled — shared neutral-muted look whether selected or not (per Figma)
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-muted",
  "checked:disabled:bg-background checked:disabled:border-border-muted",
]);

export type RadioVariantsProps = VariantProps<typeof radioVariants>;
