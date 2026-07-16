import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Radio } from "./Radio";

/**
 * Mirrors the Figma `radio-control` component set (`state` × `selected`,
 * one 20×20 size) — see the Design tab for the live node. Hover / focused
 * columns are forced via `storybook-addon-pseudo-states`; `selected` is the
 * native `:checked` state.
 */
const FIGMA_RADIO_SET =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5117-5677";

const meta = {
  title: "Base/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_RADIO_SET },
  },
  args: {
    defaultChecked: false,
    disabled: false,
    "aria-label": "Radio",
  },
  argTypes: {
    // Controlled escape hatch — driving it from a control without a change
    // handler would just lock the input, so keep it out of the panel.
    checked: { control: false },
    onCheckedChange: { control: false },
    wrapperClassName: { control: false },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Playground — drive every prop from the controls panel. A lone radio can be
 * selected but not deselected by clicking (radio semantics); use the
 * `defaultChecked` control to reset it.
 */
export const Playground: Story = {};

// ── The full Figma matrix ────────────────────────────────────────────────────

/** Figma `state` values; hover/focused are forced by the pseudo-states addon. */
const STATES = ["default", "hover", "focused", "disabled"] as const;
const SELECTED = [false, true] as const;

/**
 * Every Figma variant: state × selected. The cells carry no `name`, so each
 * radio is its own group and the checked cells stay checked.
 */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    // Force the interactive states per column (class on the cell wrapper).
    pseudo: {
      hover: [".s-hover *"],
      focusVisible: [".s-focused *"],
    },
  },
  render: () => (
    <div
      className="grid items-center gap-x-6 gap-y-3"
      style={{ gridTemplateColumns: "6rem repeat(4, max-content)" }}
    >
      <span />
      {STATES.map((state) => (
        <span key={state} className="caption-03-medium text-foreground-muted">
          {state}
        </span>
      ))}
      {SELECTED.map((selected) => (
        <React.Fragment key={String(selected)}>
          <span className="caption-03-medium text-foreground-muted">
            selected={selected ? "yes" : "no"}
          </span>
          {STATES.map((state) => (
            <div key={state} className={`s-${state}`}>
              <Radio
                defaultChecked={selected}
                disabled={state === "disabled"}
                aria-label={`${state}, ${selected ? "selected" : "unselected"}`}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  ),
};

// ── Usage patterns ───────────────────────────────────────────────────────────

/**
 * Grouping is the native `name` attribute — no RadioGroup wrapper. Wrap the
 * set in a `<fieldset>`/`<legend>` for the group label; arrow keys move the
 * selection within the group.
 */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="caption-02-medium text-foreground-muted mb-3 p-0 uppercase">
        Network
      </legend>
      <label className="body-03 text-foreground flex items-center gap-2">
        <Radio name="network" value="mainnet" defaultChecked />
        Mainnet
      </label>
      <label className="body-03 text-foreground flex items-center gap-2">
        <Radio name="network" value="testnet" />
        Testnet
      </label>
      <label className="body-03 text-foreground-muted flex items-center gap-2">
        <Radio name="network" value="devnet" disabled />
        Devnet (unavailable)
      </label>
    </fieldset>
  ),
};

/** Controlled group via the `checked` escape hatch + `onCheckedChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledExample() {
    const [plan, setPlan] = React.useState("basic");
    const options = ["basic", "pro", "enterprise"] as const;
    return (
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="caption-02-medium text-foreground-muted mb-3 p-0 uppercase">
          Plan: {plan}
        </legend>
        {options.map((option) => (
          <label
            key={option}
            className="body-03 text-foreground flex items-center gap-2 capitalize"
          >
            <Radio
              name="plan"
              value={option}
              checked={plan === option}
              onCheckedChange={(checked) => checked && setPlan(option)}
            />
            {option}
          </label>
        ))}
      </fieldset>
    );
  },
};
