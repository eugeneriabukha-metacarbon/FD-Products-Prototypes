import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./Checkbox";

/**
 * Mirrors the Figma `checkbox-control` component set (`state` × `selected`,
 * one 20×20 size) — see the Design tab for the live node. Hover / focused
 * columns are forced via `storybook-addon-pseudo-states`; `selected` is the
 * native `:checked` state.
 */
const FIGMA_CHECKBOX_SET =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5066-9964";

const meta = {
  title: "Base/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_CHECKBOX_SET },
  },
  args: {
    defaultChecked: false,
    disabled: false,
    "aria-label": "Checkbox",
  },
  argTypes: {
    // Controlled escape hatch — driving it from a control without a change
    // handler would just lock the input, so keep it out of the panel.
    checked: { control: false },
    onCheckedChange: { control: false },
    wrapperClassName: { control: false },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Playground — drive every prop from the controls panel. */
export const Playground: Story = {};

// ── The full Figma matrix ────────────────────────────────────────────────────

/** Figma `state` values; hover/focused are forced by the pseudo-states addon. */
const STATES = ["default", "hover", "focused", "disabled"] as const;
const SELECTED = [false, true] as const;

/** Every Figma variant: state × selected. */
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
              <Checkbox
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

/** The control ships bare (as in Figma) — associate a label by wrapping. */
export const WithLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <label className="body-03 text-foreground flex items-center gap-2">
        <Checkbox defaultChecked />
        Remember me
      </label>
      <label className="body-03 text-foreground-muted flex items-center gap-2">
        <Checkbox disabled />
        Unavailable option
      </label>
    </div>
  ),
};

/** Controlled via the `checked` escape hatch + `onCheckedChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledExample() {
    const [checked, setChecked] = React.useState(true);
    return (
      <label className="body-03 text-foreground flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        {checked ? "Subscribed" : "Unsubscribed"}
      </label>
    );
  },
};
