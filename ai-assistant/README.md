# AI Assistant — Prototype

Vite + React 19 + Tailwind v4. Renders against the FD design system, vendored
under `fd-apps-design-system/packages/` at the repo root (see the
[root README](../README.md) for DS details).

The DS components are consumed as **source**, so their runtime deps
(`clsx`, `class-variance-authority`, `tailwind-merge`, the `@fontsource` fonts)
are declared in this `package.json` too — otherwise a clean install (e.g. on
Vercel, where the submodule ships no `node_modules`) can't resolve them.

## Develop

```bash
cd ai-assistant
npm install
npm run dev        # http://localhost:5173
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build
