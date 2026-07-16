# FD AI Assistant — Prototype

Client-facing prototype of the AI Assistant product, built on the Finance
District design system. Vite + React 19 + Tailwind v4.

## Design system

The DS is consumed as a **git submodule** at `fd-apps-design-system/` (the real
[`financedistrict-platform/fd-apps-design-system`](https://github.com/financedistrict-platform/fd-apps-design-system)
repo). The three packages are linked via `file:` deps, so the prototype always
renders against the actual DS tokens + components.

The DS components are consumed as **source**, so their runtime deps
(`clsx`, `class-variance-authority`, `tailwind-merge`, the `@fontsource` fonts)
are declared here in `package.json` too — otherwise a clean install (e.g. on
Vercel, where the submodule ships no `node_modules`) can't resolve them.

## Setup

```bash
git clone --recurse-submodules <this-repo-url>
cd "AI Assistant Prototype"
npm install
npm run dev        # http://localhost:5173
```

Already cloned without submodules? `git submodule update --init`.

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build

## Updating the design system

The submodule is pinned to a specific DS commit. To pull newer DS changes:

```bash
git -C fd-apps-design-system checkout main && git -C fd-apps-design-system pull
npm install                 # re-link if package contents changed
git add fd-apps-design-system && git commit -m "chore: bump DS submodule"
```

## Deploy (Vercel)

- Framework preset: **Vite** (build `npm run build`, output `dist`).
- Enable **Git Submodules** in project settings (default on) so the DS submodule
  is checked out at build time.
- Vercel must have **read access to the private DS repo** for the submodule
  clone to succeed (grant the Vercel GitHub app access to
  `financedistrict-platform/fd-apps-design-system`).
