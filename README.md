# FD Products — Prototypes

Client-facing product prototypes built on the Finance District design system.

## Prototypes

- [`ai-assistant/`](ai-assistant) — AI Assistant (chat, plan management, voice input).

## Design system

The DS is a **git submodule** at [`fd-apps-design-system/`](fd-apps-design-system)
(the real [`financedistrict-platform/fd-apps-design-system`](https://github.com/financedistrict-platform/fd-apps-design-system)
repo), shared by every prototype. Each prototype links its packages via `file:`
deps (`file:../fd-apps-design-system/packages/*`) so they always render against
the actual DS tokens + components.

Clone with submodules:

```bash
git clone --recurse-submodules <this-repo-url>
# already cloned? →  git submodule update --init
```

### Updating the design system

The submodule is pinned to a DS commit. To pull newer DS changes:

```bash
git -C fd-apps-design-system checkout main && git -C fd-apps-design-system pull
git add fd-apps-design-system && git commit -m "chore: bump DS submodule"
# then reinstall in any affected prototype if package contents changed
```

## Deploy (Vercel)

One Vercel project per prototype:

- **Root Directory**: the prototype folder (e.g. `ai-assistant`).
- **Framework preset**: Vite (build `npm run build`, output `dist`).
- Enable **Git Submodules** (default) so the DS is checked out at build time.
- Vercel's GitHub app needs **read access to the private DS repo** for the
  submodule clone to succeed.
