import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TokenInput } from "./TokenInput";

/**
 * TokenInput — a domain-agnostic token / tag input. Text commits into removable
 * badges on a configurable separator (default comma). The component knows
 * nothing about emails or any domain; validation, copy and separators are all
 * supplied at the call site (mirrors SearchBar-over-Input layering).
 *
 * It is fixed to Input's `field`/`lg` styling (the only Figma configuration —
 * `variation`/`size` are NOT exposed). The Figma "states" (default / hover /
 * focus / selected / disabled / error) are runtime DOM states, forced in the
 * Matrix via `storybook-addon-pseudo-states` (hover/focus) and props.
 *
 * Value model: committed tokens are a `string[]` (controlled `value`+`onChange`
 * or uncontrolled `defaultValue`); the draft text lives in the native `<input>`.
 */
const FIGMA_TOKEN_INPUT =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5104-13632";

const meta = {
  title: "Forms/TokenInput",
  component: TokenInput,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_TOKEN_INPUT },
  },
  args: {
    label: "Invite teammates",
    placeholder: "name@company.com, …",
    hint: "Separate entries with a comma",
    optional: false,
    error: false,
    disabled: false,
    commitOnBlur: false,
  },
  argTypes: {
    // Fixed to field/lg — no variation/size axes to expose.
    separators: { control: false },
    validate: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { table: { category: "Events" } },
    wrapperClassName: { control: false },
    fieldClassName: { control: false },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof TokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Playground — an uncontrolled TokenInput. Type text and a comma (or paste
 * comma-separated text) to commit tokens; ✕ or Backspace-on-empty removes them.
 * Drive `label`, `hint`, `error`, `disabled`, `commitOnBlur` from the controls.
 */
export const Playground: Story = {
  args: {
    defaultValue: ["ada@acme.com", "grace@acme.com"],
  },
};

// ── State matrix ─────────────────────────────────────────────────────────────

/**
 * Runtime states (TokenInput has no variation/size axes — it's fixed to Input's
 * `field`/`lg`). `hover`/`focus` are forced via `storybook-addon-pseudo-states`:
 * `hover` is cursor-only (reads like `default`), `focus` shows the accent border.
 * `with-tokens` shows committed badges; `invalid-flagged` supplies a `validate`
 * that rejects entries missing an `@` ("flag but allow"); `error` is the
 * field-level error prop; `disabled` blocks typing + removal.
 */
const STATES = [
  "default",
  "hover",
  "focus",
  "with-tokens",
  "invalid-flagged",
  "error",
  "disabled",
] as const;

/** A consumer-supplied predicate — the DS ships no domain validator. */
const looksLikeEmail = (token: string) => /^[^@\s]+@[^@\s]+$/.test(token);

function MatrixCell({ state }: { state: (typeof STATES)[number] }) {
  const withTokens =
    state === "with-tokens" ||
    state === "invalid-flagged" ||
    state === "disabled";
  return (
    <div className={`s-${state} w-72`}>
      <TokenInput
        aria-label={state}
        label="Recipients"
        hint="Separate entries with a comma"
        disabled={state === "disabled"}
        error={state === "error"}
        placeholder="name@company.com, …"
        validate={state === "invalid-flagged" ? looksLikeEmail : undefined}
        defaultValue={
          state === "invalid-flagged"
            ? ["ada@acme.com", "not-an-email"]
            : withTokens
              ? ["ada@acme.com", "grace@acme.com"]
              : undefined
        }
      />
    </div>
  );
}

/** Every runtime state, forced via pseudo-states where needed. */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      // Focus is signalled via `focus-within:` (not the system ring), so force
      // `:focus-within` — `focusVisible` would not light the accent border.
      focusWithin: [".s-focus", ".s-focus *"],
    },
  },
  render: () => (
    <div
      className="grid items-start gap-x-6 gap-y-3"
      style={{ gridTemplateColumns: "repeat(7, max-content)" }}
    >
      {STATES.map((state) => (
        <span
          key={`label-${state}`}
          className="caption-03-medium text-foreground-muted"
        >
          {state}
        </span>
      ))}
      {STATES.map((state) => (
        <MatrixCell key={state} state={state} />
      ))}
    </div>
  ),
};

// ── Usage patterns ───────────────────────────────────────────────────────────

/** Empty field — placeholder shown, no tokens yet. */
export const Empty: Story = {
  args: { defaultValue: undefined },
};

/** With committed tokens. */
export const WithTokens: Story = {
  args: { defaultValue: ["ada@acme.com", "grace@acme.com", "alan@acme.com"] },
};

/**
 * Opt-in validation — the app supplies a predicate; failing tokens are KEPT but
 * flagged destructive ("flag but allow"). The DS exports no email validator.
 */
export const InvalidFlagged: Story = {
  args: {
    validate: looksLikeEmail,
    defaultValue: ["ada@acme.com", "not-an-email", "grace@acme.com"],
    hint: "Invalid entries are flagged but kept",
  },
};

/** Field-level error (distinct from per-token invalid): destructive chrome. */
export const ErrorState: Story = {
  args: {
    error: true,
    defaultValue: ["ada@acme.com"],
    hint: "At least one recipient is required",
  },
};

/** Disabled — blocks typing and removal, muted styling. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: ["ada@acme.com", "grace@acme.com"] },
};

/**
 * Space-separated free tags — a consumer passing `separators={[",", " "]}` so
 * either a comma or a space commits the draft (the DS default is comma-only).
 */
export const SpaceSeparated: Story = {
  args: {
    label: "Tags",
    placeholder: "type and press space…",
    hint: "Comma or space commits a tag",
    separators: [",", " "],
    defaultValue: ["design", "system"],
  },
};

/** Controlled via `value` + `onChange` (parent owns the tokens array). */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledExample() {
    const [tokens, setTokens] = React.useState<string[]>(["ada@acme.com"]);
    return (
      <TokenInput
        label="Invite teammates"
        placeholder="name@company.com, …"
        value={tokens}
        onChange={setTokens}
        hint={`${tokens.length} recipient${tokens.length === 1 ? "" : "s"}`}
      />
    );
  },
};
