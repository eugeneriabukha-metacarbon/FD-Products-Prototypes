# Launchpad page — design

**Date:** 2026-07-16
**Figma:** `NBhzZUogCYnp8vnqHFC9nw` node `473:32358` (Launchpad)
**Repo:** FD-Products-Prototypes / `ai-assistant/`

## Summary

Add the FD **Launchpad** — the app-switcher landing reached by clicking the
`SquaresFourIcon` in the AI Assistant header. It presents an FD-branded hero
("Welcome back, Janno" + doc chips) on the left and a vertical list of product
cards on the right. Only **AI Assistant** and **District Pass** are interactive;
**Agent Wallet**, **Prism Payment Gateway**, and **Keychain** are disabled
(Keychain also shows a "Soon" badge).

## Decisions (confirmed with user)

- App still **lands in the AI Assistant** on load. The Launchpad is reached via
  the header app-switcher icon.
- Clicking **District Pass** navigates to a minimal **coming-soon placeholder**
  (fleshed out later).
- Left-column doc chips and footer links are **decorative** (styled, with
  hover/focus states, no destination).

## Navigation model

Add a top-level `view` state to `App.tsx`:

```
type AppView = "assistant" | "launchpad" | "district-pass";
```

Default `"assistant"`. The existing `paywallOpen` overlay is unchanged.

- Header `SquaresFourIcon` → `setView("launchpad")` (today a dead button).
- Launchpad "AI Assistant" card → `setView("assistant")`.
- Launchpad "District Pass" card → `setView("district-pass")`.
- Agent Wallet / Prism / Keychain cards → disabled, no handler.

`App` renders one of: the assistant shell (current, `view === "assistant"`),
`<Launchpad>` (`"launchpad"`), or `<DistrictPassComingSoon>` (`"district-pass"`).
Paywall early-return stays above this switch.

## Components

### `components/ProfileMenu.tsx` (refactor)

Extract the profile avatar button + dropdown (JJ avatar, "Upgrade/View plans",
"Sign out") out of `Header.tsx` into a shared component so both headers reuse
identical behavior. Props: `onUpgrade`, `hasPaidPlan`. Owns its own open/outside-
click/Escape state (moved verbatim from `Header`).

### `components/Header.tsx` (app header, edited)

Keeps app-switcher icon + divider + AI Assistant logo; delegates the profile
button to `<ProfileMenu>`. New prop `onOpenLaunchpad` wired to the app-switcher
button.

### `components/LaunchpadHeader.tsx` (new)

"Finance District" wordmark (left) + `<ProfileMenu>` (right). No app-switcher, no
divider. Same `p-4` / layout rhythm as `Header`.

### `components/LaunchpadAppCard.tsx` (new)

Prototype-local. Base FeatureCard is unsuitable (truncates subtitle to one line,
24px leading slot only, no `disabled`). Layout: 56px brand-tint avatar (24px icon)
+ title (`body-02-medium`) + 2-line subtitle (`body-03`, muted) + trailing
`CaretRightIcon` **or** a "Soon" badge.

Props:

```
interface LaunchpadAppCardProps {
  icon: React.ReactNode;      // 24px
  title: string;
  subtitle: string;
  onClick?: () => void;       // present only for interactive cards
  disabled?: boolean;
  badge?: string;             // e.g. "Soon"; replaces the caret when present
}
```

Behavior:
- Interactive (not disabled): `<button>`, hover surface, focus-visible ring,
  trailing caret.
- Disabled: `disabled` attr, reduced opacity, no pointer/focus, no caret.
- `badge`: renders the brand-tint pill in the trailing slot instead of the caret.

Tokens (from Figma variable defs): avatar bg `card/brand/normal/background`
(#f0e8ff → brand-tint surface), icon `brand/primary/foreground` (#371659),
title `card-foreground`, subtitle `card-foreground-muted`, card border
`card-border`, badge bg #dbc8fe / fg #371659 / `body-04`. Exact DS class names
verified against `theme.css` during implementation.

### `components/Launchpad.tsx` (new)

Composes `LaunchpadHeader`, body, footer.

- **Left / hero:** `display-*` "Welcome back, Janno", muted subtitle
  ("Choose the app you wish to explore or check our documentation:"), and three
  decorative doc chips (Developer hub / API reference / FAQs) — bordered pills
  with trailing caret, hover/focus states, no destination.
- **Right / app list:** the 5 `LaunchpadAppCard`s (copy from Figma).
- **Footer:** "FD Technologies • Agentic payments infrastructure" (left),
  "Docs · Support · Terms · Privacy · FAQ" (right). Decorative.

Content container mirrors Figma: 906px max width, two 437px columns, gap 32.

## Assets / icons

Export from Figma (`download_assets`) or map to Phosphor where exact:
- FD "Finance District" wordmark (LaunchpadHeader).
- 5 app icons (AI Assistant, Agent Wallet, Prism, District Pass, Keychain) —
  24px, rendered in brand-tint avatars.
Store SVGs under `ai-assistant/src/assets/`.

## Motion

Reuse the app's existing pattern: card list stagger + fade-up on Launchpad mount,
hero fade-up, under the root `<MotionConfig reducedMotion="user">`. No `layoutId`
cross-fades (per prior jank note).

## Out of scope

Real routing/URLs; functional doc/footer links; Agent Wallet / Prism / Keychain
content; District Pass beyond the coming-soon stub; any DS package change.

## Verification

Browser preview (`ai-assistant-prototype`, :5173): app-switcher opens Launchpad;
AI Assistant card returns to the assistant; District Pass opens the stub and its
back control returns; disabled cards are non-interactive; layout matches Figma at
desktop width. Confirm no Vite error overlay.
