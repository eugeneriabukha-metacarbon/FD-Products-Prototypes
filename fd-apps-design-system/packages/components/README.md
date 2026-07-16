# @financedistrict/apps-ui

The **single shared base-component library** for all FD apps (Button, Input, Modal, DataTable, etc.). App-specific _semantic_ components do NOT live here — they live in each app.

**React + Tailwind v4** (ADR-0001), styled via Tailwind utility classes — semantic tokens from `@financedistrict/apps-tokens` where a value is meant to be shared, plain Tailwind utilities and arbitrary values for everything component-specific (see Authoring rules below). Components are authored RSC-safe **unless they measure their own geometry** — anything with a cut corner (`clip-path` measured via `useLayoutEffect`/`ResizeObserver`) is `"use client"` (a standard RSC opt-out, not a framework-specific API). See ADR-0009.

## Components

### Button (`@financedistrict/apps-ui/button`)

`cva` variant table + `cn`, bound to the `--button-*` semantic tokens (ADR-0009). Cut corners via `@financedistrict/apps-ui/cut-corner`.

```tsx
import { Button } from "@financedistrict/apps-ui/button";
import { PlusIcon } from "@phosphor-icons/react";

<Button variation="primary" size="lg" onClick={...}>Save</Button>
<Button variation="secondary" leftSlot={<PlusIcon />}>Add</Button>
<Button variation="brand" loading>Submitting</Button>
<Button variation="ghost" iconOnly aria-label="More"><PlusIcon /></Button>
<Button asChild variation="primary"><a href="/x">Link</a></Button>
```

- **`variation`**: `primary` (black) · `secondary` (outline) · `brand` (purple) · `ghost` · `destructive`. **`size`**: `sm` · `lg`. Plus `iconOnly`, `loading`, `asChild`, `leftSlot`/`rightSlot`.
- Cut corners on every variation except `ghost`; the `secondary` border follows the chamfer as an SVG stroke.

## Storybook

Local authoring environment (never a CI gate):

```bash
npm run storybook            # from the repo root (or this package) — http://localhost:6006
```

- **Framework: `@storybook/nextjs-vite`** (Vite under the hood). **Preview = an app's CSS entry:** `.storybook/preview.css` runs Tailwind v4 and imports `@financedistrict/apps-ui/fonts.css` + `@financedistrict/apps-tokens/theme.css`, so Archivo / Chakra Petch resolve through the portable `@fontsource` default (ADR-0008) exactly as in an app.
- **Theme toolbar** toggles the `light`/`dark` ancestor class — the same mechanism apps use, so stories need no `dark:` variants.
- Stories are colocated: `src/<component>/<Component>.stories.tsx`.

## Fonts

This package doesn't own font _loading_ — only `@financedistrict/apps-tokens`
`theme.css`'s CSS variable contract (`--font-archivo`, `--font-chakra-petch`), which
is all it actually reads (see [ADR-0008](../../docs/adr/0008-framework-agnostic-fonts.md)).
`fonts.css` is one _optional_ way to satisfy that contract, using
[`@fontsource`](https://fontsource.org/) — self-hosted `@font-face` rules, no
compiler-specific transform, so it works identically under Vite, Next, a UMD build,
or a plain static HTML file with no build step.

```css
/* app's main CSS entry */
@import "@financedistrict/apps-ui/fonts.css";
@import "@financedistrict/apps-tokens/theme.css";
```

That's it — no JS wrapper, no root-element `className` to apply. Importing the CSS
registers the `@font-face` rules and defines the two variables globally.

Any app is free to load these fonts a different way instead — a plain Google Fonts
`<link>` tag (what zero-build CDN prototypes already do), `next/font/google` in a
Next app's own root layout, whatever fits — as long as it ends up defining the same
two variable names.

## Icons

Phosphor only — see `.claude/rules/icons.md` (regular + fill weights, no inline SVG).

## Authoring rules

This package ships two builds from one source (see
[`docs/guides/standalone-prototype-consumption.md`](../../docs/guides/standalone-prototype-consumption.md))
— a normal ESM/CJS build for the four apps, and a UMD bundle for zero-build CDN
prototypes. A few rules exist specifically so both builds stay possible from the same
component code:

- **Style entirely through Tailwind utility classes in `className` — not through a
  separate CSS file or CSS-in-JS.** This is _not_ "everything must be a shared
  token." Three tiers, all fine, all just utility classes:
  1. Shared semantic tokens for values that repeat across components/apps and need
     to change consistently (`bg-card-background`, `text-focus`) — these come from
     `@financedistrict/apps-tokens`.
  2. Plain Tailwind utilities that aren't tokens at all (`flex`, `gap-2`,
     `items-center`, `rounded-md`) — completely normal for a component's own layout,
     nothing to promote anywhere.
  3. A genuine one-off value that isn't worth sharing — use Tailwind's arbitrary-value
     syntax (`top-[3px]`, `mt-[7px]`) directly in the component. Still just a utility
     class, still lives entirely in that one component.
     Never primitives (`--purple-500`) or raw inline hex/pixel `style` props — anything
     expressible as a class should be one, from whichever of the three tiers actually
     fits.
- **What's actually disallowed: a standalone CSS file or CSS-in-JS
  (`Button.module.css`, styled-components, emotion, `<style jsx>`).** Not because
  components can't have their own styling (they can, extensively — see above) but
  because the CDN path has exactly one CSS delivery mechanism: `dist/tokens.css`,
  produced by scanning every component's utility classes (see the content-scan
  requirement in the consumption guide). A separate stylesheet or runtime-injected
  styles has no way to reach a prototype that only ever loads that one file.
- **Never `import` `@financedistrict/apps-tokens`'s CSS from inside component
  source**, for the same reason — the CSS gets loaded separately by whoever consumes
  the component (an app importing `theme.css` itself, or a prototype linking
  `dist/tokens.css` itself). A component should never assume it's responsible for
  loading its own tokens.
- **No framework-specific APIs.** Nothing that only runs under Next.js, nothing that
  assumes RSC. Components must render correctly in a plain client-rendered
  environment, since the CDN path is exactly that and the four real apps are Vite,
  not Next. This is the rule `next/font/google` violated (see
  [ADR-0008](../../docs/adr/0008-framework-agnostic-fonts.md)) — fixed by not
  repeating the mistake with a different framework-specific API later.
- **Don't assume a specific React renderer wiring beyond the `react`/`react-dom` peer
  dependencies.** The UMD build declares both external — it will not bundle its own
  copy of React. Relying on anything Next- or Vite-specific breaks that assumption.

## Consuming from a zero-build prototype (CDN)

This README covers the normal `npm install` + `import` path, used by the four real
apps. Standalone HTML/JSX prototypes (Metacarbon's screen deliveries) consume a
different build of this same package — a UMD bundle loaded via `<script src>`, no
bundler involved. See
[`docs/guides/standalone-prototype-consumption.md`](../../docs/guides/standalone-prototype-consumption.md)
for the exact `index.html` shape and the global variable name (`window.FDAppsUI`).
