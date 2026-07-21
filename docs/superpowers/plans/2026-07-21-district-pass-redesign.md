# District Pass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the District Pass screen from three plain edit rows into a richer identity product — a hero "Pass" card, regrouped account details, Connected apps, an authentication audit log, and a danger-zone account deletion.

**Architecture:** `components/DistrictPass.tsx` stays the state host (owns the shared success toast and account-row edit state) and composes a stack of presentational section components extracted into `components/district-pass/`. All data is simulated in a single `mockData.ts`. New overlays reuse the shipped DS `Panel` (audit log slide-over) and `Dialog` (delete confirmation).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, `motion/react`, `@financedistrict/apps-ui` (DS components via `file:` link), `@phosphor-icons/react`.

## Global Constraints

- **No test runner exists in this app.** The correctness gate for every task is `npm run build` (runs `tsc -b` typecheck + `vite build`) from `ai-assistant/`, followed by browser-preview verification. Do **not** add a test framework.
- **All data is simulated.** No backend, no real auth events, no real account deletion, no navigation on delete.
- **Reuse shipped DS components only** — do not author new DS primitives. Import via subpath: `@financedistrict/apps-ui/{button,input,toast,feature-card,dialog,panel,cut-corner}`.
- **Preserve existing account-row behavior verbatim:** inline expand-to-edit (Edit → Cancel/Save), sibling-lock (other rows' Edit disabled while one edits), live password-rules checklist, reveal toggles, success toast on save (~3.2s auto-dismiss) with timer cleanup.
- **No plan/subscription concept on District Pass.** The hero shows identity + verification only. Do not touch the shared `ProductHeader` / profile menu.
- **`DistrictPassProps` contract is unchanged:** `onOpenLaunchpad: () => void`, `onUpgrade: () => void`, `hasPaidPlan?: boolean`.
- **Fonts/tokens:** mono Pass ID uses the `font-mono` utility (Chakra Petch). Reuse existing tokens seen in `DistrictPass.tsx`: `bg-surface`, `text-primary-foreground`, `text-primary-foreground-muted`, `body-03`, `display-03`, `border-card-border`, `text-success-primary-foreground`, `text-destructive-primary-foreground`. Avatar treatment matches `ProfileMenu`: `bg-brand-primary-accent text-brand-primary-foreground`.
- **Working directory** for all commands: `FD Products Prototypes/ai-assistant/`. Commit from repo root `FD Products Prototypes/` on branch `feat/district-pass-redesign` (already created).

---

### Task 1: Mock data module

**Files:**
- Create: `ai-assistant/src/components/district-pass/mockData.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ConnectedApp = { id: string; name: string; icon: string; scope: string; connected: string }`
  - `type ActivityStatus = "success" | "failed"`
  - `type ActivityEvent = { id: string; label: string; device: string; location: string; time: string; status: ActivityStatus }`
  - `const CONNECTED_APPS: ConnectedApp[]`
  - `const ACTIVITY_EVENTS: ActivityEvent[]` (full log, newest first)
  - `const PASS_ID: string`, `const MEMBER_SINCE: string`

- [ ] **Step 1: Create the mock-data module**

```ts
// ai-assistant/src/components/district-pass/mockData.ts
import aiAssistantIcon from "../../assets/app-ai-assistant.svg";
import agentWalletIcon from "../../assets/app-agent-wallet.svg";
import prismIcon from "../../assets/app-prism.svg";

export interface ConnectedApp {
  id: string;
  name: string;
  /** Imported SVG asset URL. */
  icon: string;
  /** What the app can access via this District Pass. */
  scope: string;
  /** Human-readable "connected on" label. */
  connected: string;
}

export type ActivityStatus = "success" | "failed";

export interface ActivityEvent {
  id: string;
  label: string;
  device: string;
  location: string;
  /** Human-readable relative/absolute time. */
  time: string;
  status: ActivityStatus;
}

/** Third-party entry has no bundled icon asset; ConnectedApps renders a fallback. */
export const CONNECTED_APPS: ConnectedApp[] = [
  {
    id: "ai-assistant",
    name: "AI Assistant",
    icon: aiAssistantIcon,
    scope: "Trade, swap & transfer execution",
    connected: "Connected Mar 2024",
  },
  {
    id: "agent-wallet",
    name: "Agent Wallet",
    icon: agentWalletIcon,
    scope: "Read balances & spending controls",
    connected: "Connected Apr 2024",
  },
  {
    id: "prism",
    name: "Prism Payment Gateway",
    icon: prismIcon,
    scope: "Initiate stablecoin payments",
    connected: "Connected Jun 2024",
  },
  {
    id: "ledgerlink",
    name: "LedgerLink (third-party)",
    icon: "",
    scope: "Read profile & email",
    connected: "Connected Jul 2024",
  },
];

/** Newest first. Includes a failed attempt from an unfamiliar location. */
export const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "e1",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Today, 09:24",
    status: "success",
  },
  {
    id: "e2",
    label: "New device authorized",
    device: "iPhone 15 · FD app",
    location: "Tallinn, EE",
    time: "Yesterday, 18:02",
    status: "success",
  },
  {
    id: "e3",
    label: "Failed sign-in attempt",
    device: "Unknown · Firefox",
    location: "Lagos, NG",
    time: "Jul 19, 03:11",
    status: "failed",
  },
  {
    id: "e4",
    label: "Password changed",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 15, 11:47",
    status: "success",
  },
  {
    id: "e5",
    label: "Signed in",
    device: "iPad Air · Safari",
    location: "Helsinki, FI",
    time: "Jul 12, 08:30",
    status: "success",
  },
  {
    id: "e6",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 08, 14:15",
    status: "success",
  },
];

export const PASS_ID = "FD · 4C7A · 9E21";
export const MEMBER_SINCE = "Member since 2024";
```

- [ ] **Step 2: Verify typecheck/build passes**

Run: `npm run build`
Expected: build succeeds (module is unused so far — that is fine; no TS errors).

- [ ] **Step 3: Commit**

```bash
git add ai-assistant/src/components/district-pass/mockData.ts
git commit -m "Add District Pass mock data (connected apps, audit events)"
```

---

### Task 2: Extract account rows (no behavior change)

Mechanical refactor: move the three `<form>` blocks (Nickname / Email / Password) and their state/handlers out of `DistrictPass.tsx` into `AccountRows.tsx`, so the orchestrator file stays focused as sections are added. Behavior must be identical.

**Files:**
- Create: `ai-assistant/src/components/district-pass/AccountRows.tsx`
- Modify: `ai-assistant/src/components/DistrictPass.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `function AccountRows({ onToast }: { onToast: (message: string) => void }): JSX.Element` — self-contained; owns all nickname/email/password state internally and calls `onToast` on each save.

- [ ] **Step 1: Create `AccountRows.tsx`**

Move, **verbatim**, from the current `DistrictPass.tsx`: the `PasswordField` type, `PASSWORD_RULES`, `PasswordRules`, `ICON_BUTTON_CLASS`, and all nickname/email/password state, refs, effects, and handlers (`startEditNickname`, `cancelEditNickname`, `toggleReveal`, `revealButton`, `revealToggle`, `startEditEmail`, `cancelEditEmail`, `handleSaveEmail`, `handleSaveProfile`, `resetPasswordForm`, `startEditPassword`, `cancelEditPassword`, `handleSavePassword`) and the three `<form>` blocks. Replace the local `showToast` calls with `onToast(...)`. The component returns the `<div className="flex flex-col">…three forms…</div>` wrapper only (no page chrome).

```tsx
// ai-assistant/src/components/district-pass/AccountRows.tsx
import * as React from "react";
import {
  AtIcon, CheckCircleIcon, CircleIcon, EyeIcon, EyeSlashIcon,
  LockIcon, UserIcon, XCircleIcon,
} from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";

const ICON_BUTTON_CLASS =
  "text-input-foreground-muted hover:text-input-foreground focus-visible:outline-focus flex cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid";

type PasswordField = "current" | "new" | "confirm";

const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
];

function PasswordRules({ value }: { value: string }) {
  /* …copy verbatim from current DistrictPass.tsx… */
}

export function AccountRows({ onToast }: { onToast: (message: string) => void }) {
  /* …all nickname/email/password state + handlers copied verbatim,
     showToast(x) calls replaced with onToast(x)… */
  return (
    <div className="flex flex-col">
      {/* the three <form> blocks, copied verbatim */}
    </div>
  );
}
```

- [ ] **Step 2: Update `DistrictPass.tsx` to use `AccountRows`**

Remove the moved code from `DistrictPass.tsx`. Keep the toast host, `showToast`, and `toastTimer` cleanup effect in `DistrictPass`. Render `<AccountRows onToast={showToast} />` where the three forms used to be. Keep the existing `<h1>`/subtitle block for now (removed in Task 3).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds, no unused-import errors (remove now-unused imports from `DistrictPass.tsx`, e.g. `AtIcon`, `LockIcon`, `UserIcon`, `Input`, the password-rule icons).

- [ ] **Step 4: Verify behavior unchanged in preview**

Preview is served at `http://localhost:5173`. Open Launchpad → District Pass. Confirm: each row's Edit expands a form; Save shows the success toast; while editing one row the others' Edit buttons are disabled; password rules update live; reveal toggles work. Take a screenshot.

- [ ] **Step 5: Commit**

```bash
git add ai-assistant/src/components/district-pass/AccountRows.tsx ai-assistant/src/components/DistrictPass.tsx
git commit -m "Extract District Pass account rows into AccountRows (no behavior change)"
```

---

### Task 3: Hero "Pass" card

**Files:**
- Create: `ai-assistant/src/components/district-pass/PassCard.tsx`
- Modify: `ai-assistant/src/components/DistrictPass.tsx`

**Interfaces:**
- Consumes: `PASS_ID`, `MEMBER_SINCE` from `mockData.ts`; `useCutCornerClipPath` from `@financedistrict/apps-ui/cut-corner` (signature: `useCutCornerClipPath<T>(cut: number, opts: { radius: number; radiusCuts: number }) => { ref, clipPath, pathD }`).
- Produces: `function PassCard({ name, initials, connectedCount }: { name: string; initials: string; connectedCount: number }): JSX.Element`.

- [ ] **Step 1: Create `PassCard.tsx`**

A credential card: 16px cut-corner clipped surface (matching the Composer's `FIELD_CUT`), large avatar, name + Verified seal, mono Pass ID, member-since, and a connected-apps stat. `fd-brandmark.svg` sits as a low-opacity corner watermark.

```tsx
// ai-assistant/src/components/district-pass/PassCard.tsx
import { SealCheckIcon } from "@phosphor-icons/react";
import { useCutCornerClipPath } from "@financedistrict/apps-ui/cut-corner";
import brandmark from "../../assets/fd-brandmark.svg";
import { PASS_ID, MEMBER_SINCE } from "./mockData";

const CARD_CUT = { cut: 16, radius: 2, radiusCuts: 0 } as const;

export function PassCard({
  name,
  initials,
  connectedCount,
}: {
  name: string;
  initials: string;
  connectedCount: number;
}) {
  const { ref, clipPath } = useCutCornerClipPath<HTMLDivElement>(CARD_CUT.cut, {
    radius: CARD_CUT.radius,
    radiusCuts: CARD_CUT.radiusCuts,
  });

  return (
    <div
      ref={ref}
      style={{ clipPath }}
      className="bg-primary-foreground text-surface relative flex flex-col gap-6 overflow-hidden p-6"
    >
      {/* brand watermark */}
      <img
        src={brandmark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-6 size-40 opacity-[0.06]"
      />

      <div className="flex items-center gap-4">
        <span className="button-01 bg-brand-primary-accent text-brand-primary-foreground flex size-14 items-center justify-center rounded-sm text-xl">
          {initials}
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold">{name}</span>
            <SealCheckIcon
              size={18}
              weight="fill"
              className="text-brand-primary-accent"
              aria-label="Verified identity"
            />
          </div>
          <span className="body-03 opacity-70">{MEMBER_SINCE}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span className="font-mono text-sm tracking-widest opacity-80">
          {PASS_ID}
        </span>
        <span className="body-03 opacity-70">
          {connectedCount} connected {connectedCount === 1 ? "app" : "apps"}
        </span>
      </div>
    </div>
  );
}
```

> Note on colors: `bg-primary-foreground` / `text-surface` invert the card to a dark credential against the white page. If those tokens don't resolve to a dark-on-light inversion at build time, fall back to `bg-[#151515] text-white` (the DS base ink is `#151515`, per the icons package). Verify visually in Step 3.

- [ ] **Step 2: Mount the hero in `DistrictPass.tsx`**

Replace the `<h1>`/subtitle block with the hero. Import `CONNECTED_APPS` to derive the count:

```tsx
import { PassCard } from "./district-pass/PassCard";
import { CONNECTED_APPS } from "./district-pass/mockData";
// …inside the motion.div, first child:
<PassCard name={nickname} initials="JJ" connectedCount={CONNECTED_APPS.length} />
```

Keep passing `nickname` so the hero name tracks nickname edits. (If `nickname` now lives in `AccountRows`, lift the display name: pass a `name` prop down, or keep a `displayName` state in `DistrictPass` seeded to "Janno Jaerv" — simplest: hardcode `name="Janno Jaerv"` in the hero for this prototype and note it.)

- [ ] **Step 3: Verify build + preview**

Run: `npm run build` (expect success). Then in preview open District Pass; confirm the hero renders as a dark credential card with cut corners, avatar `JJ`, name + seal, mono Pass ID, "4 connected apps", and a faint brandmark. Screenshot. If colors look wrong, apply the fallback from Step 1's note and rebuild.

- [ ] **Step 4: Commit**

```bash
git add ai-assistant/src/components/district-pass/PassCard.tsx ai-assistant/src/components/DistrictPass.tsx
git commit -m "Add District Pass hero identity card"
```

---

### Task 4: Section scaffolding + Connected apps

Introduce a reusable `Section` wrapper (label + optional caption + children) and the Connected apps list with revoke.

**Files:**
- Create: `ai-assistant/src/components/district-pass/Section.tsx`
- Create: `ai-assistant/src/components/district-pass/ConnectedApps.tsx`
- Modify: `ai-assistant/src/components/DistrictPass.tsx`

**Interfaces:**
- Produces:
  - `function Section({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }): JSX.Element`
  - `function ConnectedApps({ onToast }: { onToast: (message: string) => void }): JSX.Element` — owns its own list state (revocable).

- [ ] **Step 1: Create `Section.tsx`**

```tsx
// ai-assistant/src/components/district-pass/Section.tsx
import * as React from "react";

export function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-primary-foreground text-base font-semibold">
          {title}
        </h2>
        {caption && (
          <p className="body-03 text-primary-foreground-muted">{caption}</p>
        )}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Create `ConnectedApps.tsx`**

```tsx
// ai-assistant/src/components/district-pass/ConnectedApps.tsx
import * as React from "react";
import { PlugsIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { CONNECTED_APPS, type ConnectedApp } from "./mockData";

export function ConnectedApps({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [apps, setApps] = React.useState<ConnectedApp[]>(CONNECTED_APPS);

  const revoke = (app: ConnectedApp) => {
    setApps((prev) => prev.filter((a) => a.id !== app.id));
    onToast(`Access revoked for ${app.name}.`);
  };

  if (apps.length === 0) {
    return (
      <p className="body-03 text-primary-foreground-muted">
        No apps are using your District Pass.
      </p>
    );
  }

  return (
    <ul className="border-card-border flex flex-col border-t">
      {apps.map((app) => (
        <li
          key={app.id}
          className="border-card-border flex items-center gap-3 border-b py-3"
        >
          <span className="bg-brand-primary-background flex size-9 shrink-0 items-center justify-center rounded-sm">
            {app.icon ? (
              <img src={app.icon} alt="" className="size-5" />
            ) : (
              <PlugsIcon size={18} className="text-primary-foreground-muted" />
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-primary-foreground truncate text-sm font-medium">
              {app.name}
            </span>
            <span className="body-03 text-primary-foreground-muted truncate">
              {app.scope} · {app.connected}
            </span>
          </div>
          <Button
            variation="secondary"
            size="sm"
            type="button"
            onClick={() => revoke(app)}
          >
            Revoke
          </Button>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Wire sections into `DistrictPass.tsx`**

Wrap `AccountRows` in `<Section title="Account details">` and add `<Section title="Connected apps" caption="Apps using your District Pass.">` containing `<ConnectedApps onToast={showToast} />`. Ensure the `motion.div` children stack with the existing `gap-8`.

- [ ] **Step 4: Verify build + preview**

Run: `npm run build` (expect success). In preview, confirm Connected apps lists 4 rows (AI Assistant, Agent Wallet, Prism, LedgerLink with fallback plug icon); clicking **Revoke** removes the row and fires a success toast. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add ai-assistant/src/components/district-pass/Section.tsx ai-assistant/src/components/district-pass/ConnectedApps.tsx ai-assistant/src/components/DistrictPass.tsx
git commit -m "Add District Pass section wrapper + Connected apps"
```

---

### Task 5: Security activity (audit log) + Panel slide-over

Inline preview of recent events + a "View all activity" button opening the full log in a DS `Panel` inside a right-anchored overlay (Panel is non-modal, so the overlay/backdrop/animation is provided here — mirroring the existing toast overlay pattern in `DistrictPass.tsx`).

**Files:**
- Create: `ai-assistant/src/components/district-pass/SecurityActivity.tsx`
- Create: `ai-assistant/src/components/district-pass/ActivityLogPanel.tsx`
- Modify: `ai-assistant/src/components/DistrictPass.tsx`

**Interfaces:**
- Produces:
  - `function ActivityRow({ event }: { event: ActivityEvent }): JSX.Element` (shared row renderer, exported from `SecurityActivity.tsx`)
  - `function SecurityActivity({ onViewAll }: { onViewAll: () => void }): JSX.Element`
  - `function ActivityLogPanel({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element`

- [ ] **Step 1: Create `SecurityActivity.tsx`**

```tsx
// ai-assistant/src/components/district-pass/SecurityActivity.tsx
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { ACTIVITY_EVENTS, type ActivityEvent } from "./mockData";

const PREVIEW_COUNT = 4;

export function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon = event.status === "success" ? CheckCircleIcon : XCircleIcon;
  const color =
    event.status === "success"
      ? "text-success-primary-foreground"
      : "text-destructive-primary-foreground";
  return (
    <li className="border-card-border flex items-center gap-3 border-b py-3">
      <Icon size={18} weight="fill" className={`shrink-0 ${color}`} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-primary-foreground truncate text-sm font-medium">
          {event.label}
        </span>
        <span className="body-03 text-primary-foreground-muted truncate">
          {event.device} · {event.location}
        </span>
      </div>
      <span className="body-03 text-primary-foreground-muted shrink-0">
        {event.time}
      </span>
    </li>
  );
}

export function SecurityActivity({ onViewAll }: { onViewAll: () => void }) {
  const preview = ACTIVITY_EVENTS.slice(0, PREVIEW_COUNT);
  return (
    <div className="flex flex-col gap-4">
      <ul className="border-card-border flex flex-col border-t">
        {preview.map((event) => (
          <ActivityRow key={event.id} event={event} />
        ))}
      </ul>
      <div>
        <Button variation="secondary" size="sm" type="button" onClick={onViewAll}>
          View all activity
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ActivityLogPanel.tsx`**

Right-anchored slide-over. Backdrop click and Escape close it; body scrolls. Uses `Panel.Root`/`Panel.Header`/`Panel.Body` for the DS chrome.

```tsx
// ai-assistant/src/components/district-pass/ActivityLogPanel.tsx
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Panel } from "@financedistrict/apps-ui/panel";
import { ACTIVITY_EVENTS } from "./mockData";
import { ActivityRow } from "./SecurityActivity";

export function ActivityLogPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="bg-overlay absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative h-full w-full max-w-[420px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Panel.Root className="h-full">
              <Panel.Header title="Security activity" onClose={onClose} />
              <Panel.Body>
                <ul className="border-card-border flex flex-col border-t">
                  {ACTIVITY_EVENTS.map((event) => (
                    <ActivityRow key={event.id} event={event} />
                  ))}
                </ul>
              </Panel.Body>
            </Panel.Root>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

> Verify `Panel.Header` accepts `title` + `onClose` (per DS Panel API — header renders an inline close X when `onClose` is provided). If the prop name differs, read `fd-apps-design-system/packages/components/src/panel/Panel.tsx` and adjust. If `bg-overlay` isn't a resolvable token, use `bg-black/40`.

- [ ] **Step 3: Wire into `DistrictPass.tsx`**

Add `const [logOpen, setLogOpen] = React.useState(false);`. Add `<Section title="Recent activity"><SecurityActivity onViewAll={() => setLogOpen(true)} /></Section>`. Render `<ActivityLogPanel open={logOpen} onClose={() => setLogOpen(false)} />` near the toast host (outside the centered column).

- [ ] **Step 4: Verify build + preview**

Run: `npm run build` (expect success). In preview: the Recent activity section shows 4 rows incl. the red failed-attempt from Lagos; **View all activity** slides in a panel listing all 6 events; backdrop click and Escape close it. Screenshot both states (check `read_console_messages` for errors).

- [ ] **Step 5: Commit**

```bash
git add ai-assistant/src/components/district-pass/SecurityActivity.tsx ai-assistant/src/components/district-pass/ActivityLogPanel.tsx ai-assistant/src/components/DistrictPass.tsx
git commit -m "Add District Pass security activity log + panel slide-over"
```

---

### Task 6: Danger zone — account deletion

Destructive-styled block + a confirmation `Dialog` requiring the user to type `DELETE` and enter a password before the destructive confirm button enables. Deletion is simulated (toast only).

**Files:**
- Create: `ai-assistant/src/components/district-pass/DangerZone.tsx`
- Modify: `ai-assistant/src/components/DistrictPass.tsx`

**Interfaces:**
- Consumes: `Dialog` from `@financedistrict/apps-ui/dialog` (compound: `Dialog.Root` with `open`/`onOpenChange`, `Dialog.Content`, `Dialog.Header` with `icon`/`title`/`description`/`showClose`, `Dialog.Body`, `Dialog.Footer`, `Dialog.Close` with `asChild`).
- Produces: `function DangerZone({ onDeleted }: { onDeleted: () => void }): JSX.Element`.

- [ ] **Step 1: Create `DangerZone.tsx`**

```tsx
// ai-assistant/src/components/district-pass/DangerZone.tsx
import * as React from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Input } from "@financedistrict/apps-ui/input";
import { Dialog } from "@financedistrict/apps-ui/dialog";

const CONFIRM_WORD = "DELETE";

export function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [password, setPassword] = React.useState("");

  const canDelete = confirmText.trim() === CONFIRM_WORD && password.length > 0;

  const reset = () => {
    setConfirmText("");
    setPassword("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleDelete = () => {
    if (!canDelete) return;
    handleOpenChange(false);
    onDeleted();
  };

  return (
    <div className="border-destructive-primary-foreground/40 flex flex-col gap-3 rounded-sm border p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-destructive-primary-foreground text-base font-semibold">
          Danger zone
        </h2>
        <p className="body-03 text-primary-foreground-muted">
          Deleting your District Pass is permanent and cannot be undone.
        </p>
      </div>
      <div>
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            <Button variation="destructive" size="sm" type="button">
              Delete account
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header
              icon={<WarningIcon weight="fill" />}
              title="Delete your District Pass?"
              description="This permanently removes your identity, revokes all connected-app access, and erases your activity history. This cannot be undone."
              showClose
            />
            <Dialog.Body>
              <div className="flex flex-col gap-6">
                <Input
                  label={`Type ${CONFIRM_WORD} to confirm`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variation="secondary" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variation="destructive"
                type="button"
                disabled={!canDelete}
                onClick={handleDelete}
              >
                Delete account
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  );
}
```

> Verify the `Dialog.Header` prop names (`icon`/`title`/`description`/`showClose`) against `fd-apps-design-system/packages/components/src/dialog/Dialog.tsx` (the JSDoc example uses exactly these). Adjust if the shipped API differs.

- [ ] **Step 2: Wire into `DistrictPass.tsx`**

Add as the last section (no `Section` wrapper — it carries its own heading/border):

```tsx
import { DangerZone } from "./district-pass/DangerZone";
// …last child of the motion.div:
<DangerZone onDeleted={() => showToast("Your account has been deleted.")} />
```

- [ ] **Step 3: Verify build + preview**

Run: `npm run build` (expect success). In preview: the danger-zone block is red-outlined at the page bottom; **Delete account** opens the dialog; the confirm button stays disabled until `DELETE` is typed **and** a password entered; Cancel/close/Escape dismiss and clear the fields; confirming shows the deletion toast and closes. Screenshot the dialog. Check console for errors.

- [ ] **Step 4: Commit**

```bash
git add ai-assistant/src/components/district-pass/DangerZone.tsx ai-assistant/src/components/DistrictPass.tsx
git commit -m "Add District Pass danger zone (account deletion dialog)"
```

---

### Task 7: Full-page integration pass

Verify the whole page reads as a cohesive redesign and nothing regressed.

**Files:**
- Modify (if needed): `ai-assistant/src/components/DistrictPass.tsx`

- [ ] **Step 1: Confirm section order + spacing**

In `DistrictPass.tsx`, the `motion.div` children, top to bottom, are: `PassCard` → `Section("Account details")` → `Section("Connected apps")` → `Section("Recent activity")` → `DangerZone`. Confirm the column keeps `gap-8` and `max-w-[480px]`, and the page still fades/slides in.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: success, no TS or unused-import warnings.

- [ ] **Step 3: End-to-end preview verification**

In preview, scroll the full page and confirm every acceptance criterion from the spec:
- Hero credential card anchors the page (no old `<h1>`).
- Account rows still edit inline with sibling-lock, password rules, reveal toggles, save toasts.
- Connected apps revoke works.
- Recent-activity preview + Panel slide-over work.
- Danger-zone dialog gating works.
Take a full-height screenshot. Resize to `mobile` (375px) and screenshot to confirm the column reflows and the panel/dialog fit.

- [ ] **Step 4: Commit any adjustments**

```bash
git add ai-assistant/src/components/DistrictPass.tsx
git commit -m "Polish District Pass full-page integration"
```

---

## Self-Review

**Spec coverage:**
- Hero "The Pass" → Task 3 ✓ (avatar, name+seal, mono Pass ID, member-since, connected-apps stat; no plan tier ✓).
- Account details (preserve behavior) → Task 2 (extract, verbatim) ✓.
- Connected apps → Task 4 ✓ (FD products + third-party fallback, revoke + toast).
- Security activity / audit log → Task 5 ✓ (preview + Panel slide-over, rich data incl. failed attempt).
- Danger zone / deletion → Task 6 ✓ (Dialog, type `DELETE` + password gate, simulated).
- Section grouping + hierarchy → Task 4 `Section` ✓.
- Simulated data / no backend → `mockData.ts` (Task 1), delete is toast-only ✓.
- Shared `ProductHeader` untouched ✓ (not in any task).
- Verification via `npm run build` + preview (no test runner) → every task ✓.

**Placeholder scan:** The only intentional "copy verbatim" is Task 2's mechanical move of existing, already-written code (source is the current `DistrictPass.tsx` in the repo) — not a placeholder for new logic. All new components have complete code. No TBD/TODO.

**Type consistency:** `ActivityEvent`/`ConnectedApp`/`ActivityStatus` defined in Task 1 are consumed with matching field names in Tasks 4–5. `ActivityRow` exported from `SecurityActivity.tsx` (Task 5 Step 1) is imported by `ActivityLogPanel.tsx` (Step 2). `onToast`/`onViewAll`/`onDeleted`/`onClose` callback names are consistent across tasks and the `DistrictPass` host.

**Open API confirmations flagged for the implementer** (verify against DS source, fall back as noted): `Panel.Header` `title`/`onClose`; `Dialog.Header` `icon`/`title`/`description`/`showClose`; `bg-overlay` and `bg-primary-foreground`/`text-surface` token resolution.
