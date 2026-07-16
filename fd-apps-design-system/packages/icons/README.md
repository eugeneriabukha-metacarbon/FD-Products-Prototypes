# @financedistrict/apps-icons

Full-color SVG icon libraries for FD apps. Colors are baked in from Figma —
no color/weight prop. Tree-shakeable React components.

    import { BitcoinIcon } from "@financedistrict/apps-icons/networks";
    <BitcoinIcon size={32} title="Bitcoin" />

Three libraries: `/networks`, `/logos`, `/currencies`.

## Props

- `size?: number | string` — width & height (default 24). viewBox is 0 0 32 32.
- `title?: string` — accessible label (adds role="img" + <title>). Omit for decorative icons (aria-hidden).
- plus any native `<svg>` prop (className, style, onClick, …). Ref forwards to the `<svg>`.

## Adding a new icon (manual — there is no committed generator)

1. In Figma (file `zuahrKaTRfeamriRIvTLSg`), export the symbol as SVG.
2. Keep only the `<g id="<SymbolName>">…</g>` group (drop the section background rect/frame paths).
3. Optimize with SVGO (keep viewBox, prefix ids with the component name).
4. Create `src/<library>/<Name>Icon.tsx` following an existing icon, pasting the optimized inner markup into `BODY`.
5. Re-export it from `src/<library>/index.ts`. It is picked up by the gallery story and test automatically.
