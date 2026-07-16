# AI Assistant — Prototype

Vite + React 19 + Tailwind v4. Renders against the FD design system, consumed
from the shared `fd-apps-design-system/` submodule at the repo root (see the
[root README](../README.md) for DS / submodule details).

The DS components are consumed as **source**, so their runtime deps
(`clsx`, `class-variance-authority`, `tailwind-merge`, the `@fontsource` fonts)
are declared in this `package.json` too — otherwise a clean install (e.g. on
Vercel, where the submodule ships no `node_modules`) can't resolve them.

## Develop

```bash
# from the repo root, with submodules initialised:
cd ai-assistant
npm install
npm run dev        # http://localhost:5173
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build
