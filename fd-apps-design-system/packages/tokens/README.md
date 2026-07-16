# @financedistrict/apps-tokens

The **single source of truth** for FD design tokens. Consumed by every FD app as Tailwind v4 CSS.

## How it works

```
Figma Variables  ──MCP read + transform──▶  src/*.css  ──Tailwind v4──▶  utility classes in each app
```

- **`src/base.css`** — tier 1: primitives (raw color ramps) under `:root`, in OKLCH. Names like `--purple-500`, `--gray-950`. Never theme-dependent. (No `--alpha-*` — transparency is derived at the semantic layer, ADR-0005.)
- **`src/theme.css`** — tier 2: semantic tokens that reference primitives, split into `:root,.light { }` and `.dark { }`, plus the Tailwind `@theme` registration that turns each token into a utility class. Imports `base.css`.

Both files are **generated from Figma** (file `FD Products Styleguide / UI Kit`) — do not hand-edit. See [ADR-0003](../../docs/adr/0003-token-pipeline.md) for the naming rules and [ADR-0004](../../docs/adr/0004-oklch-and-token-naming.md) for OKLCH + naming cleanup.

## Regenerating from Figma

There is no headless generator — regeneration is a guided MCP session, driven by the **`/sync-figma-token`** skill (`.claude/skills/sync-figma-token/`), which holds the full deterministic algorithm (name transform, value/unit mapping, alpha derivation, alias resolution, and the mapping-validation check). Summary of the steps, in order:

1. **Read the 4 collections** via the Figma MCP (`use_figma` + variable APIs): `base-palette`, `theme-colors`, `theme-modes` (light/dark), `theme-values`.
2. **Write `base.css`** (primitives, sRGB hex under `:root`) and **`theme.css`** (semantic `:root,.light` / `.dark` + `@theme` scales), applying the naming rules: strip noise words (`neutral`/`normal`/`main`/`gradients`/`effect`), dedupe repeated segments, kebab-case; keep the renamed conflict tokens (`fader-0X`, `effect-0X`, `data-{c}-2`).
   - **Alpha is derived, not baked** (ADR-0005). Do **not** emit `--alpha-*` primitives. Where a semantic token needs transparency, write it as relative-color from the solid primitive: `oklch(from var(--gray-950) l c h / 50%)` instead of `var(--alpha-gray-950-50)`.
3. **Convert to OKLCH:** `node scripts/hex-to-oklch.mjs` (idempotent — safe to re-run; skips already-converted values).
4. **Pull styles:** read local text / effect / paint styles → composite type `@utility` classes, `shadow-s`/`shadow-xs`, `fader-*`.
5. **Verify:** `npm run verify` — must pass (utilities generate, golden values intact, OKLCH-only base, dark mode).
6. If a golden value changed **intentionally**, update the `golden` list in `verify/check.mjs`.

## Consuming in an app (Tailwind v4)

```css
/* app's main CSS entry */
@import "tailwindcss";
@import "@financedistrict/apps-tokens/theme.css";
```

Then use semantic utilities directly — theme-switch aware via `.dark`:

```html
<button
  class="bg-button-brand-primary-background text-button-brand-primary-foreground rounded-md"
>
  …
</button>
<div
  class="bg-card-background text-card-foreground border border-card-border rounded-xl"
>
  …
</div>
```

## Token tiers

| Tier      | File        | Example                                      | Use in components? |
| --------- | ----------- | -------------------------------------------- | ------------------ |
| Primitive | `base.css`  | `--purple-500`                               | ❌ never           |
| Semantic  | `theme.css` | `--card-foreground` → `text-card-foreground` | ✅ always          |

## Verify the build

```bash
npm run verify   # Tailwind v4 over a probe file; asserts utilities generate,
                 # golden values intact, base is OKLCH-only, dark mode works
```

## Source collections (Figma)

`base-palette` → `base.css`. `theme-colors` + `theme-modes` (light/dark) → semantic layer in `theme.css`. `theme-values` → the `@theme` static scales (radius, typography). Fonts: **Archivo** (sans), **Chakra Petch** (mono).

## Consuming from a zero-build prototype (CDN)

The section above (`@import "@financedistrict/apps-tokens/theme.css"`) needs the
consuming app's own Tailwind v4 build to resolve `@theme`/`@utility` into real
utility classes — it won't work in a bare browser with no build step. Standalone
HTML/JSX prototypes instead reference a separate, pre-compiled `dist/tokens.css` via
a plain `<link>` tag. See
[`docs/guides/standalone-prototype-consumption.md`](../../docs/guides/standalone-prototype-consumption.md)
for the exact shape.
