# District Pass redesign — design

**Date:** 2026-07-21
**Repo:** FD-Products-Prototypes / `ai-assistant/`
**Supersedes:** the plain three-row District Pass shipped in `a79a185` /
`68b47c9` (`components/DistrictPass.tsx`).

## Summary

Rework the **District Pass** screen from a plain list of three edit rows
(Nickname / Email / Password) into a richer identity product. Stakeholder
feedback: the page "looks too plain" and needs to feel more exciting, plus two
committed features need a home — an **authentication audit log** and
**irreversible account deletion** (a "danger zone"). We also add one on-brand
extra: **Connected apps** (which FD products use this District Pass identity).

The screen becomes a vertical stack of labeled sections inside the existing
~480px centered column:

1. **Hero — "The Pass"** (identity credential card)
2. **Account details** (existing Nickname / Email / Password rows, regrouped)
3. **Connected apps** (new)
4. **Security activity** — the audit log (new)
5. **Danger zone** — account deletion (new)

All data is **simulated** — this is a prototype. No backend, no real auth
events, no real deletion.

## Decisions (confirmed with user)

- **Scope:** visual redesign **plus** both committed features (audit log +
  account deletion), **plus** the Connected apps extra.
- **Ambition:** go bold — a distinctive membership-pass hero, not just tidier
  spacing.
- **No plan tier on the hero.** Plans/subscriptions are treated as an
  **AI-Assistant** concern, not a District Pass one. District Pass is an
  _identity_ product; the hero expresses identity + verification only.
- **Fidelity:** rich, believable mock data (real-looking device names, cities,
  timestamps, a failed sign-in among the events).
- **Audit log presentation:** inline preview of the latest events + a "View all
  activity" button that opens the full log in a DS **Panel** (right slide-over).
- **Out of scope (flagged, not changed):** the shared `ProductHeader` profile
  menu still shows "Upgrade your plan" on District Pass. Left as-is this
  iteration since it lives in shared chrome.

## Existing behavior to preserve

From the current `DistrictPass.tsx`, keep intact:

- Inline **expand-to-edit** on each account row (Edit → Cancel / Save; the row
  header stays visible and the form expands beneath it).
- **Sibling lock:** while one row is being edited, the other rows' Edit buttons
  are disabled.
- **Live password rules** checklist (`PASSWORD_RULES` / `PasswordRules`).
- **Password/email reveal toggles** (`EyeIcon` / `EyeSlashIcon`).
- **Success toast** on save (DS `Toast`, auto-dismiss ~3.2s), including the
  toast timer cleanup effect.
- `ProductHeader` chrome and the `DistrictPassProps` contract
  (`onOpenLaunchpad`, `onUpgrade`, `hasPaidPlan`) — unchanged.

## Layout

`main` keeps the centered, scrollable `max-w-[480px]` column with the entry
`motion.div` fade/slide-in. The page `<h1>` "District Pass / Manage your Finance
District identity" is **replaced by the hero card** as the visual anchor;
sections below each get a small section header (label + optional caption)
instead of floating rows.

## Sections

### 1 · Hero — "The Pass"

A credential/membership-pass card at the top of the column.

- **Shape/treatment:** FD **16px cut-corner** motif; subtle brand gradient /
  holographic accent; `fd-brandmark.svg` as a low-opacity corner watermark.
- **Avatar:** the `JJ` initials chip (matches the header/profile avatar), sized
  large. Structured so a future uploaded photo can drop in.
- **Name:** "Janno Jaerv" with a **Verified** seal badge beside it
  (`SealCheckIcon`, filled).
- **Pass ID:** monospace, Chakra Petch (already a dependency) — e.g.
  `FD · 4C7A · ••••` — plus "Member since 2024".
- **Connected-apps stat:** a small "3 connected apps" figure in place of the
  (removed) plan chip; reinforces "one identity across all FD products" and
  points at the Connected apps section.

New file: `components/district-pass/PassCard.tsx` (presentational; props for
name, initials, pass id, member-since, connected count).

### 2 · Account details

Section header "Account details". Renders the existing Nickname / Email /
Password rows with **behavior unchanged** (see "Existing behavior to
preserve"). The only change is grouping them under a labeled section and the
divider treatment matching the new section rhythm.

To keep `DistrictPass.tsx` focused as it grows, extract the three rows into a
small internal module (e.g. `components/district-pass/AccountRows.tsx`) or
per-row components, preserving current state/handlers. Mechanical refactor —
no behavior change.

### 3 · Connected apps (new)

Section header "Connected apps" + caption "Apps using your District Pass."

A list of rows, each: app icon · app name · access summary · "Connected {date}",
with a **Revoke** action (secondary/destructive-tinted button) that removes the
row and fires a success toast ("Access revoked for {app}.").

Mock data (rich): FD products using existing SVGs —
`app-ai-assistant.svg`, `app-agent-wallet.svg`, `app-prism.svg` — plus one
believable third-party entry. Each with a plausible scope line ("Trade & swap
execution", "Read balances", etc.) and a connected date.

New file: `components/district-pass/ConnectedApps.tsx` + a mock-data module.

### 4 · Security activity — audit log (new)

Section header "Recent activity".

- **Inline preview:** latest ~4 auth events. Each row: status icon
  (`CheckCircleIcon` success / `XCircleIcon` failed, reusing the existing color
  tokens) · event label ("Signed in", "Password changed", "Failed sign-in
  attempt", "New device authorized") · device + location · relative timestamp.
- **"View all activity"** button opens the full log in a DS **`Panel`**
  (right slide-over) with the complete, scrollable list.

Mock data (rich): believable device names ("MacBook Pro · Chrome", "iPhone 15 ·
FD app"), cities, staggered timestamps, and at least one **failed** attempt from
an unfamiliar location to make the log feel real.

New files: `components/district-pass/SecurityActivity.tsx`,
`components/district-pass/ActivityLogPanel.tsx`, + a mock-data module.

### 5 · Danger zone — account deletion (new)

Visually quarantined block at the very bottom: destructive-tinted border/heading,
clearly separated from the sections above.

- Heading "Danger zone" + copy: deleting the account is **permanent and
  irreversible**.
- A **Delete account** (destructive) button opens a confirmation **`Dialog`**
  that:
  - warns the action is permanent,
  - lists what is lost (District Pass identity, all connected-app access,
    activity history),
  - requires the user to **type `DELETE`** _and_ enter their **password**,
  - keeps the destructive confirm button **disabled** until both are satisfied.
- On confirm (simulated): close dialog, show a toast; no real navigation/data
  change. (We do not actually delete or route anywhere — prototype.)

New file: `components/district-pass/DangerZone.tsx` (owns the confirmation
Dialog + type-to-confirm state).

## Component / file plan

```
components/
  DistrictPass.tsx                 (orchestrator: hero + sections + toast host)
  district-pass/
    PassCard.tsx                   (hero)
    AccountRows.tsx                (existing Nickname/Email/Password, extracted)
    ConnectedApps.tsx
    SecurityActivity.tsx
    ActivityLogPanel.tsx           (Panel slide-over: full log)
    DangerZone.tsx                 (Dialog: type-to-confirm delete)
    mockData.ts                    (connected apps + audit events)
```

`DistrictPass.tsx` stays the state/host: owns the shared toast, composes the
hero + sections, and continues to own the account-row edit state (or passes it
into `AccountRows`).

## Design system usage

Reuse shipped DS components — no new DS primitives:
`FeatureCard`, `Button`, `Input`, `Toast`, `Dialog`, `Panel`, and Phosphor
icons (`SealCheckIcon`, `CheckCircleIcon`, `XCircleIcon`, existing set). Fonts:
Chakra Petch (already a dependency) for the mono Pass ID.

## Non-goals / YAGNI

- No real authentication, persistence, or account deletion.
- No avatar upload flow (hero just leaves room for it).
- No 2FA/passkeys, active-sessions, data-export, or recovery-options sections
  this iteration (considered, deferred).
- No change to the shared `ProductHeader` / profile menu.
- No new routes; District Pass stays a `view` in `App.tsx`.

## Success criteria

- The page no longer reads as "plain": a clear hero anchors it and sections have
  hierarchy.
- Audit log: preview shows rich events incl. a failed attempt; "View all" opens
  a Panel with the full list.
- Connected apps: lists FD products + a third party, each revocable (with toast).
- Danger zone: Delete opens a Dialog that only enables its destructive action
  after typing `DELETE` + a password.
- All prior account-editing behavior (inline edit, sibling lock, password rules,
  reveal toggles, save toasts) still works.
