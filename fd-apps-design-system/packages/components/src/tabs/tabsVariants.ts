import { cva } from "class-variance-authority";

/**
 * Tabs styling — the Figma `tab` component (node `906-78043`), an
 * underline-indicator tab. Binds ONLY to the semantic token layer (never
 * primitives, never mode plumbing); theme switching is automatic via `.dark`,
 * so no `dark:` variants are needed.
 *
 * Only the trigger carries visual state (text color + underline). The state ×
 * selected matrix from the spec is expressed as two `cva` axes (`selected`,
 * `disabled`) plus compound variants for the hover/active interactions and the
 * disabled-selected underline.
 */

/** Root container — a plain vertical stack (tablist above, panel below). */
export const tabsRootVariants = cva(["flex flex-col"]);

/**
 * The tablist row. `inline-flex items-center` with NO `gap` — the tabs sit
 * adjacent and each carries its own horizontal padding (Figma shows no
 * full-width bottom-border track; the indicator is per-tab).
 */
export const tabsListVariants = cva(["inline-flex items-center"]);

/**
 * One trigger (`role="tab"`). Base holds the layout, type, the transparent
 * baseline underline (`border-b-2`, colored per state so all tabs keep the same
 * height with no layout shift), and the focus ring. Per repo TW4 precedent the
 * ring needs `outline-solid`. Corners are square (no radius) — the tab and its
 * focus ring have sharp corners. The ring is offset outward so it frames the
 * tab clear of the underline.
 */
export const tabsTriggerVariants = cva(
  [
    "group inline-flex cursor-pointer items-center justify-center gap-1 px-2 py-2.5",
    "body-03-medium border-b-2 transition-colors",
    "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      selected: {
        true: "border-card-brand-border-accent text-foreground-accent",
        false: "border-transparent text-foreground",
      },
      disabled: {
        true: "text-foreground-muted",
        false: "",
      },
    },
    compoundVariants: [
      // Unselected + enabled: faint underline on hover, purple text+underline
      // while pressed (Figma hover / active states).
      {
        selected: false,
        disabled: false,
        className:
          "hover:border-card-brand-border active:border-card-brand-border-accent active:text-foreground-accent",
      },
      // Selected + disabled: the underline drops from accent to the faint token
      // (Figma disabled-selected). Wins over the accent border from
      // `selected:true` because compound variants are appended last.
      {
        selected: true,
        disabled: true,
        className: "border-card-brand-border",
      },
    ],
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  },
);

/**
 * The tabpanel (`role="tabpanel"`). Content is arbitrary (no forced type
 * style); the panel is a focus stop (`tabIndex=0`) so it shows the same
 * `:focus-visible` ring as the triggers.
 */
export const tabsContentVariants = cva([
  "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
]);
