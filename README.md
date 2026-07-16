# FD Products — Prototypes

Client-facing product prototypes built on the Finance District design system.

## Prototypes

- [`ai-assistant/`](ai-assistant) — AI Assistant (chat, plan management, voice input).

## Design system

The DS is **vendored** at [`fd-apps-design-system/packages/`](fd-apps-design-system/packages)
(a snapshot of the `financedistrict-platform/fd-apps-design-system` repo,
`packages/` only), shared by every prototype. Each prototype links its packages
via `file:` deps (`file:../fd-apps-design-system/packages/*`) so they render
against the real DS tokens + components — with **nothing private to fetch at
build time** (so Vercel builds cleanly).

The DS components are consumed as **source**, so their runtime deps
(`clsx`, `class-variance-authority`, `tailwind-merge`, the `@fontsource` fonts)
are declared in each prototype's `package.json` too, and resolved from the
out-of-tree vendored source via `tsconfig` `paths` + Vite `resolve.alias`.

### Re-syncing the design system

The vendored copy drifts from the DS over time. To refresh it, replace
`fd-apps-design-system/packages/` with the latest from the DS repo, e.g.:

```bash
rsync -a --delete \
  "/path/to/fd-apps-design-system/packages/" \
  fd-apps-design-system/packages/
git add fd-apps-design-system && git commit -m "chore: re-sync DS snapshot"
```

## Deploy (Vercel)

One Vercel project per prototype:

- **Root Directory**: the prototype folder (e.g. `ai-assistant`).
- **Framework preset**: Vite (build `npm run build`, output `dist`).

No submodules / private access needed — the DS ships in the repo.
