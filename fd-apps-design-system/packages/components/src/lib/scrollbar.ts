import { cva, type VariantProps } from "class-variance-authority";

/**
 * Custom scrollbar styling — the Figma `scroll-bar` component (node 538:18165):
 * a **4px pill thumb** (`card-foreground-muted`, `rounded-full`) in a **12px
 * gutter**, with an optional **1px leading track stroke** (`card-border`).
 *
 * Apply to the SCROLLABLE element itself (the one carrying `overflow-*-auto`),
 * not a rendered child — the browser owns the scrollbar. Compose with `cn`:
 *
 * ```ts
 * className={cn("overflow-y-auto", scrollbarVariants())}
 * ```
 *
 * Arbitrary variants are used deliberately: the WebKit scrollbar pseudo-elements
 * (`::-webkit-scrollbar*`) and the Firefox `scrollbar-width`/`scrollbar-color`
 * properties have **no** Tailwind token utilities, so there is no non-arbitrary
 * way to reach them. Colours still bind to semantic tokens
 * (`card-foreground-muted` / `card-border`), never raw values.
 *
 * Fidelity by engine:
 * - **WebKit (Chrome/Safari):** near-exact — the 4px thumb is a 4px transparent
 *   border + `background-clip: content-box` inside the 12px gutter (12 − 4 − 4).
 * - **Firefox:** approximate — only `scrollbar-width: thin` + a thumb colour are
 *   supported; there is no exact 4px width and no track stroke. Degrades to a
 *   thin themed scrollbar. (A JS overlay would be required for pixel parity;
 *   out of scope — see the scrollbar design decision.)
 */
export const scrollbarVariants = cva(
  [
    // Firefox (approximate): thin themed scrollbar over a transparent track.
    "[scrollbar-width:thin]",
    "[scrollbar-color:var(--color-card-foreground-muted)_transparent]",
    // WebKit gutter — 12px, both axes so the utility is axis-agnostic.
    "[&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar]:h-3",
    // WebKit thumb — 4px pill: a 4px transparent border + content-box clip
    // leaves a 4px-wide fill centred in the 12px gutter.
    "[&::-webkit-scrollbar-thumb]:rounded-full",
    "[&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent",
    "[&::-webkit-scrollbar-thumb]:bg-clip-content",
    "[&::-webkit-scrollbar-thumb]:bg-card-foreground-muted",
    // WebKit track — transparent by default (stroke is the `stroke` variant).
    "[&::-webkit-scrollbar-track]:bg-transparent",
  ],
  {
    variants: {
      stroke: {
        // 1px leading-edge track stroke (Figma `stroke`, on by default).
        true: "[&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-card-border",
        false: "",
      },
    },
    defaultVariants: { stroke: true },
  },
);

export type ScrollbarVariantsProps = VariantProps<typeof scrollbarVariants>;
