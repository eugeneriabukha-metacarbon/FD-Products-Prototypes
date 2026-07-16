import { cva, type VariantProps } from "class-variance-authority";

/**
 * Input styling — mirrors the Figma `BaseInput` component (node 4973:6816) and
 * binds ONLY to the semantic `--input-*` token layer (never primitives, never
 * arbitrary values). Theme switching is automatic via the `.dark` class, so no
 * `dark:` variants are needed.
 *
 * This cva styles the FIELD wrapper (the row that holds the leading icon, the
 * real `<input>`, and the trailing icon) — NOT the bare `<input>`, whose own
 * classes live in <Input> so the token that colours typed text
 * (`text-input-foreground-accent`) and the placeholder
 * (`text-input-foreground-muted`) can sit on the element itself.
 *
 * The 7 Figma "states" (default / hover / focused&active / active&filled /
 * filled …) are runtime DOM states of a real `<input>`, NOT a prop:
 * - hover  → a text (I-beam) cursor affordance ONLY (`cursor-text` in the
 *            base). Hover does NOT recolour the border/underline. This is a
 *            deliberate, user-authorized deviation from the Figma (which draws
 *            the accent border on hover): the team decided hover is a pointer
 *            affordance, not a colour change.
 * - focus  → `focus-within:` on the field wrapper recolours the border (field)
 *            / bottom line (line) to `input-border-accent`. The input is the
 *            focusable descendant; the visible treatment lives on its wrapper.
 *            There is NO system outline ring on this control (see below).
 * - filled → whether the input holds a value (no styling delta in this token
 *            set beyond the typed-text colour, applied on the input directly).
 * Only `disabled` and `error` are real props (handled below + in <Input>).
 *
 * Focus model — user-authorized exception to ADR-0010 #4 / ADR-0011:
 * text inputs do NOT use the system `:focus-visible` outline ring. A keyboard
 * user never triggers `:hover`, and (since hover no longer changes colour) the
 * gray→accent border recolour on ANY focus is itself a clear, unambiguous
 * WCAG 2.1 AA (2.4.7) focus indicator. Text inputs also hold focus while the
 * user types, so `focus-within` (any focus, not just `:focus-visible`) is the
 * correct trigger. The ring is intentionally omitted here; do NOT re-add it.
 *
 * Variant × size axes (both independent, 4 combinations):
 * - variation `field`: bordered rounded box (`bg-input-background`, `border`,
 *   `rounded-sm`, horizontal padding). Focus strengthens the border to
 *   `input-border-accent` (hover does not change colour).
 * - variation `line`: no box/background — a single bottom border only
 *   (`border-b`), no horizontal padding. Focus strengthens the bottom line
 *   (hover does not change colour).
 *
 * Sizes reuse the sibling sm/lg scale (Button = `h-8` / `h-10`):
 * - lg: `h-10`, `gap-2`, `py-2`; field adds `px-3` (Figma field-lg = 12px).
 * - sm: `h-8`, `gap-1`; line uses `py-2.5` (Figma line-sm = 10px), field uses
 *   `py-2` (matches lg vertical rhythm inside the shorter box).
 *
 *   field-sm horizontal padding is DERIVED (Figma only draws field-lg): we use
 *   `px-2` (8px = `spacing/2`), stepping down from field-lg's `px-3` (12px) and
 *   matching field-sm's own `py-2` (8px) for a uniform `spacing/2` inset on all
 *   sides. (This is a deliberate token-aligned choice; it does NOT match
 *   Button's sm `px-2.5`.)
 *
 * Error is a prop, not an interaction state: it recolours the border/bottom
 * line to the destructive accent and out-ranks focus (an errored field stays
 * red when focused — it never flips to the purple accent), so its border
 * utilities are declared with matching-but-later specificity via the `error`
 * variant below (a plain destructive border for the resting state plus a
 * `focus-within:` destructive form that out-ranks the variation's
 * `focus-within:` accent by class order).
 *
 * `showBottomLine` (LINE ONLY) toggles the resting visibility of the bottom
 * line without any layout shift. The `border-b` (1px width) is ALWAYS present;
 * only the border COLOUR changes. When `false`, a compound variant recolours
 * the resting bottom line to `border-transparent` (invisible), while focus
 * (`focus-within:border-input-border-accent`) and error still win — so the
 * line reappears on focus and on error. The compound is gated on `error:false`
 * so an errored field's destructive rest border is NOT overridden by
 * transparent (tailwind-merge last-wins would otherwise drop it). On the
 * `field` variation `showBottomLine` has NO effect: the compound is scoped to
 * `variation:line`, so `field`'s box border is untouched.
 */
export const inputVariants = cva(
  [
    // Field row layout — icons + input on one line, vertically centred.
    "flex w-full items-center",
    // Colour transitions for the focus border change.
    "transition-colors",
    // I-beam text cursor over the WHOLE field row (not just the inner input),
    // so clicking anywhere in the padding/icon area reads as "type here". This
    // is the only hover affordance — hover intentionally does NOT recolour the
    // border (user-authorized deviation from the Figma). `cursor-text` sits in
    // the base; `has-[:disabled]:cursor-not-allowed` below is declared AFTER it
    // so it wins on a disabled field (same-specificity utilities, later class
    // takes precedence — confirmed by tailwind-merge ordering).
    "cursor-text",
    // Disabled: not-allowed cursor + block pointer interaction on the whole
    // field (the native `disabled` on the input already stops typing; icons are
    // dimmed separately by the `disabled`-derived `iconStateClass` in <Input>).
    // Declared after `cursor-text` so it overrides the I-beam when disabled.
    "has-[:disabled]:cursor-not-allowed",
  ],
  {
    variants: {
      variation: {
        field: [
          "bg-input-background border border-input-border rounded-sm",
          // Focus (mouse or keyboard) strengthens the whole border to the
          // accent. Hover does NOT change colour (cursor-only affordance).
          "focus-within:border-input-border-accent",
        ],
        line: [
          "border-b border-input-border",
          // Focus (mouse or keyboard) strengthens the bottom line to the
          // accent. Hover does NOT change colour (cursor-only affordance).
          "focus-within:border-input-border-accent",
        ],
      },
      size: {
        // sm/lg heights reuse the Button scale; gap follows Figma per size.
        sm: "h-8 gap-1",
        lg: "h-10 gap-2",
      },
      error: {
        // Error out-ranks focus: declare the destructive border for the resting
        // state AND its `focus-within:` form so an errored field never recolours
        // to the accent when focused (a bare `border-…` alone would lose to the
        // variation's `focus-within:` accent utility above). No `hover:` form is
        // needed — hover no longer changes colour on any variation. The `error`
        // variant's classes are emitted after the variation's, so at equal
        // specificity the destructive `focus-within:` wins by order.
        true: "border-input-destructive-foreground-accent focus-within:border-input-destructive-foreground-accent",
        false: "",
      },
      // Bottom-line visibility toggle. LINE ONLY — the hide effect is applied
      // via a compound variant below (scoped to `variation:line`), so `field`
      // is unaffected. Boolean → `true`/`false`; `true` (default) keeps today's
      // behaviour. No classes here: `true` is the resting `border-input-border`
      // from the variation, and `false`'s hide is the compound variant.
      showBottomLine: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // field padding — Figma field-lg = px-3 (12px) / py-2 (8px).
      { variation: "field", size: "lg", className: "px-3 py-2" },
      // field-sm: DERIVED. px-2 (8px = spacing/2) steps down from field-lg's
      // px-3 (12px) and equals py-2 for a uniform spacing/2 inset all around.
      { variation: "field", size: "sm", className: "px-2 py-2" },
      // line — no horizontal padding (Figma px-0); vertical padding per size.
      { variation: "line", size: "lg", className: "py-2" },
      { variation: "line", size: "sm", className: "py-2.5" },
      // Hide the resting bottom line (LINE ONLY): recolour to transparent while
      // keeping `border-b` for a stable 1px width (no layout shift). Gated on
      // `error:false` so an errored field keeps its destructive rest border
      // (transparent would otherwise last-win over it). Focus still wins:
      // `focus-within:border-input-border-accent` out-ranks `border-transparent`
      // (later in class order), so the line reappears on focus. `field` is
      // untouched — this compound only matches `variation:line`.
      {
        variation: "line",
        showBottomLine: false,
        error: false,
        className: "border-transparent",
      },
    ],
    defaultVariants: {
      variation: "field",
      size: "lg",
      error: false,
      showBottomLine: true,
    },
  },
);

export type InputVariantsProps = VariantProps<typeof inputVariants>;
