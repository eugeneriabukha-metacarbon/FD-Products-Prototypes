import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { SearchBar } from "./SearchBar";

/**
 * SearchBar composes `<Input>` (field variation, `lg` size, no label) with a
 * leading MagnifyingGlass icon and a trailing clear (X) button that appears only
 * when the field has a value. It is NOT a Figma variant set — there are no
 * variation/size axes to matrix; the meaningful axes are runtime STATES (empty,
 * with-value + clear, disabled), shown below. There is no error state — search
 * has no invalid value; "no results" is an empty-state message shown elsewhere
 * (the field stays filled).
 *
 * Value model (ADR-0010): the native input is the source of truth. `onChange`
 * fires immediately per keystroke; `onSearch` fires DEBOUNCED (default 300ms),
 * alongside `onChange`. Enter flushes the pending search; clearing fires
 * `onSearch("")` immediately.
 */
const FIGMA_INPUT =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4973-6816";

const meta = {
  title: "Forms/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_INPUT },
  },
  args: {
    placeholder: "Search…",
    debounceMs: 300,
    disabled: false,
    hint: undefined,
    onSearch: fn(),
  },
  argTypes: {
    debounceMs: { control: { type: "number", min: 0, step: 50 } },
    disabled: { control: "boolean" },
    hint: { control: "text" },
    // onSearch is logged via the Storybook action set in `args`.
    onSearch: { table: { category: "Events" } },
    wrapperClassName: { control: false },
    fieldClassName: { control: false },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Playground — drive `debounceMs`, `placeholder`, `disabled`, `hint`
 * from the controls panel; `onSearch` is logged to the Actions tab (type, then
 * pause to see the debounced fire; press Enter to flush immediately).
 */
export const Playground: Story = {};

// ── State matrix ─────────────────────────────────────────────────────────────

/**
 * Runtime states (SearchBar has no variation/size axes to matrix — it's fixed to
 * Input's `field`/`lg`). Mirrors the Input matrix **minus the error state**.
 * `hover`/`focused` are forced via `storybook-addon-pseudo-states`: `hover` is
 * cursor-only (no colour change, so it reads like `default` in a static shot),
 * `focused` shows the accent border, and `filled` shows the trailing clear (X)
 * button. `disabled` keeps a value to show the muted styling (no clear button).
 */
const STATES = ["default", "hover", "focused", "filled", "disabled"] as const;

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      focusWithin: [".s-focused", ".s-focused *"],
    },
  },
  render: () => (
    <div
      className="grid items-start gap-x-6 gap-y-3"
      style={{ gridTemplateColumns: "repeat(5, max-content)" }}
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
        <div key={state} className={`s-${state} w-64`}>
          <SearchBar
            aria-label={`Search ${state}`}
            placeholder="Search…"
            disabled={state === "disabled"}
            defaultValue={
              state === "filled"
                ? "Acme Corp"
                : state === "disabled"
                  ? "Cannot edit"
                  : undefined
            }
          />
        </div>
      ))}
    </div>
  ),
};

/** Empty state — no value, so no clear button. */
export const Empty: Story = {
  args: { placeholder: "Search transactions…" },
};

/** With a value — the trailing clear (X) button is shown. */
export const WithValue: Story = {
  args: { defaultValue: "Acme Corp" },
};

/** Disabled — no clear button, muted styling. */
export const Disabled: Story = {
  args: { defaultValue: "Cannot edit", disabled: true },
};

/**
 * Controlled — `value` + `onChange` own the value; the hint shows the live
 * character count and the debounced `onSearch` result.
 */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledExample() {
    const [value, setValue] = React.useState("");
    const [searched, setSearched] = React.useState<string | null>(null);
    return (
      <div className="flex flex-col gap-2">
        <SearchBar
          placeholder="Type to search…"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onSearch={setSearched}
          hint={
            searched === null
              ? "Start typing"
              : searched === ""
                ? "Cleared"
                : `Searched for: “${searched}”`
          }
        />
      </div>
    );
  },
};
