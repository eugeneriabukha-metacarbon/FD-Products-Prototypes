import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CurrencyDollarIcon,
  DiamondsFourIcon,
  GlobeIcon,
  TagIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { Select } from "./Select";

/**
 * Mirrors the Figma Select (node 4985:13547): variation (`field` / `line`) ×
 * the six trigger states (default / hover / focused&active / selected /
 * disabled / error), single + multi, plus the open dropdown. The trigger reuses
 * the base-input field styling; hover/focus are forced via
 * `storybook-addon-pseudo-states` (`focusWithin` for the accent border, matching
 * Input).
 */
const FIGMA_SELECT =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4985-13547";

const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry", disabled: true },
  { value: "fig", label: "Fig" },
];

const meta = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_SELECT },
  },
  args: {
    options: FRUITS,
    label: "Fruit",
    placeholder: "Select",
    variation: "field",
    multiple: false,
    error: false,
    disabled: false,
    hint: "Pick your favourite",
  },
  argTypes: {
    variation: { control: "inline-radio", options: ["field", "line"] },
    multiple: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    leadingSlot: { control: false },
    wrapperClassName: { control: false },
    fieldClassName: { control: false },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Curated Phosphor icons offered by the Playground leading-slot picker. */
const PLAYGROUND_ICONS = {
  DiamondsFour: DiamondsFourIcon,
  Globe: GlobeIcon,
  User: UserIcon,
  Tag: TagIcon,
  CurrencyDollar: CurrencyDollarIcon,
} as const;

type PlaygroundArgs = React.ComponentProps<typeof Select> & {
  showLeadingSlot: boolean;
  leadingIcon: keyof typeof PLAYGROUND_ICONS;
};

/**
 * Playground — drive every prop from the controls panel, including the leading
 * slot (toggle on/off + pick an icon; a `ReactNode` can't be a Storybook
 * control, so it is built in `render`).
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    showLeadingSlot: false,
    leadingIcon: "Globe",
  },
  argTypes: {
    showLeadingSlot: { control: "boolean", table: { category: "Slots" } },
    leadingIcon: {
      control: "select",
      options: Object.keys(PLAYGROUND_ICONS),
      table: { category: "Slots" },
    },
  },
  render: ({ showLeadingSlot, leadingIcon, ...args }) => {
    const LeadingIcon = PLAYGROUND_ICONS[leadingIcon];
    return (
      <div className="max-w-xs">
        <Select
          {...args}
          leadingSlot={
            showLeadingSlot ? <LeadingIcon weight="regular" /> : undefined
          }
        />
      </div>
    );
  },
};

// ── The full Figma matrix ────────────────────────────────────────────────────

const VARIATIONS = ["field", "line"] as const;
/**
 * Figma `state` values. `hover`/`focused` are forced by the pseudo-states
 * addon; `selected` shows a chosen value; `disabled`/`error` are props.
 * `hover` is cursor-only (no colour delta vs `default`, matching Input).
 */
const STATES = [
  "default",
  "hover",
  "focused",
  "selected",
  "disabled",
  "error",
] as const;

function MatrixCell({
  variation,
  state,
}: {
  variation: (typeof VARIATIONS)[number];
  state: (typeof STATES)[number];
}) {
  const selected = state === "selected";
  return (
    <div className={`s-${state} w-56`}>
      <Select
        aria-label={`${variation} ${state}`}
        options={FRUITS}
        variation={variation}
        disabled={state === "disabled"}
        error={state === "error"}
        defaultValue={selected ? "banana" : undefined}
        placeholder="Select"
      />
    </div>
  );
}

/** Every Figma variant: variation × state (single trigger), forced via pseudo-states. */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      // The trigger signals focus via `focus-within:` (Input's model), so force
      // `:focus-within` — `focusVisible` would not light the accent border.
      focusWithin: [".s-focused", ".s-focused *"],
    },
  },
  render: () => (
    <div className="flex flex-col gap-10">
      {VARIATIONS.map((variation) => (
        <section key={variation} className="flex flex-col gap-3">
          <h4 className="caption-02-medium text-foreground-muted uppercase">
            {variation}
          </h4>
          <div
            className="grid items-start gap-x-6 gap-y-6"
            style={{ gridTemplateColumns: "repeat(6, max-content)" }}
          >
            {STATES.map((state) => (
              <span
                key={state}
                className="caption-03-medium text-foreground-muted"
              >
                {state}
              </span>
            ))}
            {STATES.map((state) => (
              <MatrixCell key={state} variation={variation} state={state} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

// ── Usage patterns ───────────────────────────────────────────────────────────

/** Bordered box variant. */
export const Field: Story = {
  args: { variation: "field" },
  render: (args) => (
    <div className="max-w-xs">
      <Select {...args} />
    </div>
  ),
};

/** Bottom-line-only variant (no box/background). */
export const Line: Story = {
  args: { variation: "line" },
  render: (args) => (
    <div className="max-w-xs">
      <Select {...args} />
    </div>
  ),
};

/**
 * `line` with `showBottomLine={false}` — the resting bottom line is hidden
 * (transparent) but the 1px `border-b` is kept so there is no layout shift. The
 * line still reappears on focus (accent) and on error (destructive); the two
 * lower instances show that. Mirrors Input's `LineBorderless`.
 */
export const LineBorderless: Story = {
  parameters: {
    controls: { disable: true },
    // Focus shows via `focus-within:` on the trigger (no ring), so force it.
    pseudo: { focusWithin: [".s-focused", ".s-focused *"] },
  },
  render: () => (
    <div className="flex max-w-xs flex-col gap-6">
      <Select
        aria-label="Line borderless at rest"
        variation="line"
        showBottomLine={false}
        options={FRUITS}
      />
      <div className="s-focused">
        <Select
          aria-label="Line borderless focused"
          variation="line"
          showBottomLine={false}
          options={FRUITS}
          defaultValue="banana"
        />
      </div>
      <Select
        aria-label="Line borderless error"
        variation="line"
        showBottomLine={false}
        error
        options={FRUITS}
        defaultValue="banana"
        hint="Still shows the line on error"
      />
    </div>
  ),
};

/** Error: destructive label / border / hint (with a warning hint icon). */
export const ErrorState: Story = {
  args: { error: true, hint: "Please choose a fruit" },
  render: (args) => (
    <div className="max-w-xs">
      <Select {...args} />
    </div>
  ),
};

/** Disabled: trigger + text drop to the muted foreground; can't open. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "banana" },
  render: (args) => (
    <div className="max-w-xs">
      <Select {...args} />
    </div>
  ),
};

/**
 * Open (single) — the portaled dropdown; the selected row is brand-tinted with
 * a 3px left accent bar (Figma node 4921:8203), no check icon. The story mounts
 * open so the dropdown itself is captured; extra bottom space keeps it in frame.
 */
export const Open: Story = {
  parameters: { controls: { disable: true } },
  render: function OpenExample() {
    const [value, setValue] = React.useState("banana");
    return (
      <div className="max-w-xs pb-72">
        <Select
          options={FRUITS}
          label="Fruit"
          value={value}
          onValueChange={(v) => setValue(v as string)}
          hint="Single select — choosing closes the list"
        />
      </div>
    );
  },
};

/**
 * Multi (open) — leading checkboxes mirror selection, the trigger shows a
 * count, and choosing keeps the list open.
 */
export const Multi: Story = {
  parameters: { controls: { disable: true } },
  render: function MultiExample() {
    const [value, setValue] = React.useState<string[]>(["apple", "cherry"]);
    return (
      <div className="max-w-xs pb-72">
        <Select
          options={FRUITS}
          multiple
          label="Fruit"
          value={value}
          onValueChange={(v) => setValue(v as string[])}
          hint="Multi select — the list stays open"
        />
      </div>
    );
  },
};

/**
 * Per-option `leadingSlot` / `trailingSlot` — decorative 16px icons that inherit
 * the row's text colour (so the leading icon turns brand on the single-select
 * selected row). Leading sits after the checkbox in multi mode.
 */
const ACCOUNTS = [
  {
    value: "usd",
    label: "US Dollar",
    leadingSlot: <CurrencyDollarIcon weight="regular" />,
    trailingSlot: <TagIcon weight="regular" />,
  },
  {
    value: "global",
    label: "Global",
    leadingSlot: <GlobeIcon weight="regular" />,
  },
  {
    value: "personal",
    label: "Personal",
    leadingSlot: <UserIcon weight="regular" />,
  },
];

export const WithOptionIcons: Story = {
  parameters: { controls: { disable: true } },
  render: function WithOptionIconsExample() {
    const [value, setValue] = React.useState("global");
    return (
      <div className="max-w-xs pb-64">
        <Select
          options={ACCOUNTS}
          label="Account"
          value={value}
          onValueChange={(v) => setValue(v as string)}
          hint="Options carry leading + trailing icon slots"
        />
      </div>
    );
  },
};

/**
 * Scrolling — a long option list overflows the `--container-4xs` (208px)
 * max-height and scrolls, showing the custom scrollbar (`scrollbarVariants`):
 * a 4px `card-foreground-muted` pill in a 12px gutter with a leading track
 * stroke. Near-exact in Chrome/Safari; a thin themed scrollbar in Firefox.
 */
const MANY = Array.from({ length: 20 }, (_, i) => ({
  value: `opt-${i + 1}`,
  label: `Option ${i + 1}`,
}));

export const Scrolling: Story = {
  parameters: { controls: { disable: true } },
  render: function ScrollingExample() {
    const [value, setValue] = React.useState("opt-3");
    return (
      <div className="max-w-xs pb-72">
        <Select
          options={MANY}
          label="Long list"
          value={value}
          onValueChange={(v) => setValue(v as string)}
          hint="Scrolls past 208px with the custom scrollbar"
        />
      </div>
    );
  },
};
