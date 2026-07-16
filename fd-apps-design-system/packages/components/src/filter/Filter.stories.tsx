import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Filter } from "./Filter";

/**
 * Mirrors the Figma `base-filter` (node 5026:36907): state (default / hover /
 * focused&active / active) × selected (no / yes), for BOTH single and multi
 * select. The Filter is a filter-chip dropdown (a pill trigger over the shared
 * select listbox), NOT a form field.
 *
 * - Single-select: the trigger shows the selected option's label (or the filter
 *   `label` when empty); no badge.
 * - Multi-select: the trigger always shows the static `label`, plus a count
 *   badge when ≥1 selected.
 *
 * Focus is the ADR-0010/0014 system ring (a chip is a button-shaped control),
 * forced in the Matrix via `storybook-addon-pseudo-states` (`focusVisible`). The
 * `focused&active` and `active` Figma states are the OPEN dropdown; the Matrix
 * shows the resting/hover/focus chip (open is covered by the `Open*` stories).
 */
const FIGMA_FILTER =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5026-36907";

const CATEGORIES = [
  { value: "equities", label: "Equities" },
  { value: "bonds", label: "Bonds" },
  { value: "crypto", label: "Crypto" },
  { value: "forex", label: "Forex" },
  { value: "commodities", label: "Commodities", disabled: true },
  { value: "reits", label: "REITs" },
];

const meta = {
  title: "Base/Filter",
  component: Filter,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_FILTER },
  },
  args: {
    options: CATEGORIES,
    label: "Asset class",
    multiple: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Playground — drive every prop from the controls panel. Extra bottom space so
 *  the dropdown stays in frame when opened. */
export const Playground: Story = {
  render: (args) => (
    <div className="pb-80">
      <Filter {...args} />
    </div>
  ),
};

// ── The full Figma matrix ────────────────────────────────────────────────────

const MODES = [
  { multiple: false, title: "single" },
  { multiple: true, title: "multi" },
] as const;
/**
 * Figma `state` values. `hover`/`focused&active` are forced by the pseudo-states
 * addon (focus is the system ring, so force `:focus-visible`). `active` shows a
 * pressed/chosen chip. `selected` is a second axis (no value vs a value).
 */
const STATES = ["default", "hover", "focused", "active"] as const;
const SELECTED = ["no", "yes"] as const;

function MatrixCell({
  multiple,
  state,
  selected,
}: {
  multiple: boolean;
  state: (typeof STATES)[number];
  selected: (typeof SELECTED)[number];
}) {
  // "yes" seeds a selection: one value in single, two in multi (so the badge
  // reads "2"). "no" leaves it empty.
  const defaultValue =
    selected === "no"
      ? undefined
      : multiple
        ? ["equities", "bonds"]
        : "equities";
  return (
    <div className={`s-${state}`}>
      <Filter
        aria-label={`${multiple ? "multi" : "single"} ${state} ${selected}`}
        options={CATEGORIES}
        label="Asset class"
        multiple={multiple}
        defaultValue={defaultValue}
      />
    </div>
  );
}

/** Every Figma variant: (single | multi) × state × selected, forced via
 *  pseudo-states. */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      focusVisible: [".s-focused [data-slot=filter-trigger]"],
    },
  },
  render: () => (
    <div className="flex flex-col gap-10">
      {MODES.map(({ multiple, title }) => (
        <section key={title} className="flex flex-col gap-3">
          <h4 className="caption-02-medium text-foreground-muted uppercase">
            {title}
          </h4>
          <div
            className="grid items-center gap-x-8 gap-y-4"
            style={{
              gridTemplateColumns: "max-content repeat(4, max-content)",
            }}
          >
            {/* header row: blank corner + state names */}
            <span />
            {STATES.map((state) => (
              <span
                key={state}
                className="caption-03-medium text-foreground-muted"
              >
                {state}
              </span>
            ))}
            {/* one row per `selected` value */}
            {SELECTED.map((selected) => (
              <React.Fragment key={selected}>
                <span className="caption-03-medium text-foreground-muted">
                  selected={selected}
                </span>
                {STATES.map((state) => (
                  <MatrixCell
                    key={state}
                    multiple={multiple}
                    state={state}
                    selected={selected}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

// ── Usage patterns ───────────────────────────────────────────────────────────

/** Single-select — the trigger shows the chosen option's label; the dropdown
 *  stays open on pick (a pick replaces the prior selection). */
export const SingleOpen: Story = {
  parameters: { controls: { disable: true } },
  render: function SingleExample() {
    const [value, setValue] = React.useState<string | string[]>("equities");
    return (
      <div className="pb-80">
        <Filter
          options={CATEGORIES}
          label="Asset class"
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

/** Multi-select — the trigger keeps the static label + a count badge; rows show
 *  leading checkboxes and the dropdown stays open across picks. */
export const MultiOpen: Story = {
  parameters: { controls: { disable: true } },
  render: function MultiExample() {
    const [value, setValue] = React.useState<string | string[]>([
      "equities",
      "bonds",
    ]);
    return (
      <div className="pb-80">
        <Filter
          options={CATEGORIES}
          label="Asset class"
          multiple
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

/** Disabled — muted, not-allowed cursor, can't open. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "equities" },
  render: (args) => (
    <div className="inline-block p-4">
      <Filter {...args} />
    </div>
  ),
};
