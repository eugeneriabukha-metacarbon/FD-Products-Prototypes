import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CurrencyDollarIcon,
  DiamondsFourIcon,
  GlobeIcon,
  TagIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { InlineSelect } from "./InlineSelect";

/**
 * Mirrors the Figma InlineSelect (node 4926:5462): variation (`primary` /
 * `secondary`) × state (default / hover / focused / active / disabled). Unlike
 * `Select`, this is inline text (no field box) — the value label + a 12px
 * filled caret. Focus is the ADR-0010 system ring (2px `--focus`, 2px offset,
 * `:focus-visible` only), forced in the Matrix via `storybook-addon-pseudo-states`
 * (`focusVisible`). `secondary` shows on a dark card surface, so those cells are
 * placed on a contrasting panel to read correctly.
 */
const FIGMA_INLINE_SELECT =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4926-5462";

const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry", disabled: true },
  { value: "fig", label: "Fig" },
];

const meta = {
  title: "Base/InlineSelect",
  component: InlineSelect,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_INLINE_SELECT },
  },
  args: {
    options: FRUITS,
    placeholder: "Select",
    variation: "primary",
    disabled: false,
  },
  argTypes: {
    variation: { control: "inline-radio", options: ["primary", "secondary"] },
    disabled: { control: "boolean" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    leadingSlot: { control: false },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof InlineSelect>;

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

type PlaygroundArgs = React.ComponentProps<typeof InlineSelect> & {
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
    defaultValue: "banana",
  },
  argTypes: {
    showLeadingSlot: { control: "boolean", table: { category: "Slots" } },
    leadingIcon: {
      control: "select",
      options: Object.keys(PLAYGROUND_ICONS),
      table: { category: "Slots" },
    },
  },
  render: ({ showLeadingSlot, leadingIcon, variation, ...args }) => {
    const LeadingIcon = PLAYGROUND_ICONS[leadingIcon];
    // `secondary` renders light text for dark surfaces — put it on a dark card.
    const onDark = variation === "secondary";
    return (
      <div
        className={
          onDark
            ? "bg-card-brand-secondary-background inline-block rounded-md p-4"
            : "inline-block p-4"
        }
      >
        <InlineSelect
          {...args}
          variation={variation}
          leadingSlot={
            showLeadingSlot ? <LeadingIcon weight="regular" /> : undefined
          }
        />
      </div>
    );
  },
};

// ── The full Figma matrix ────────────────────────────────────────────────────

const VARIATIONS = ["primary", "secondary"] as const;
/**
 * Figma `state` values. `hover`/`focused` are forced by the pseudo-states
 * addon; `active` shows a chosen value; `disabled` is a prop. Focus is the
 * system ring, so force `:focus-visible` (NOT `focus-within`, unlike Select).
 */
const STATES = ["default", "hover", "focused", "active", "disabled"] as const;

function MatrixCell({
  variation,
  state,
}: {
  variation: (typeof VARIATIONS)[number];
  state: (typeof STATES)[number];
}) {
  const hasValue = state === "active";
  return (
    <div className={`s-${state}`}>
      <InlineSelect
        aria-label={`${variation} ${state}`}
        options={FRUITS}
        variation={variation}
        disabled={state === "disabled"}
        defaultValue={hasValue ? "banana" : undefined}
        placeholder="Select"
      />
    </div>
  );
}

/** Every Figma variant: variation × state, forced via pseudo-states. */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      // The trigger signals focus with the system ring on `:focus-visible`.
      focusVisible: [".s-focused [data-slot=inline-select-trigger]"],
    },
  },
  render: () => (
    <div className="flex flex-col gap-10">
      {VARIATIONS.map((variation) => {
        const onDark = variation === "secondary";
        return (
          <section
            key={variation}
            className={
              onDark
                ? "bg-card-brand-secondary-background flex flex-col gap-3 rounded-md p-4"
                : "flex flex-col gap-3"
            }
          >
            <h4
              className={
                onDark
                  ? "caption-02-medium text-card-brand-secondary-foreground-muted uppercase"
                  : "caption-02-medium text-foreground-muted uppercase"
              }
            >
              {variation}
            </h4>
            <div
              className="grid items-start gap-x-8 gap-y-4"
              style={{ gridTemplateColumns: "repeat(5, max-content)" }}
            >
              {STATES.map((state) => (
                <span
                  key={state}
                  className={
                    onDark
                      ? "caption-03-medium text-card-brand-secondary-foreground-muted"
                      : "caption-03-medium text-foreground-muted"
                  }
                >
                  {state}
                </span>
              ))}
              {STATES.map((state) => (
                <MatrixCell key={state} variation={variation} state={state} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  ),
};

// ── Usage patterns ───────────────────────────────────────────────────────────

/** Primary — neutral card foreground; sits inline in body text. */
export const Primary: Story = {
  args: { variation: "primary", defaultValue: "banana" },
  render: (args) => (
    <p className="body-03 text-foreground">
      Sort by <InlineSelect {...args} aria-label="Sort by" />
    </p>
  ),
};

/** Secondary — brand foreground, shown on a dark brand card surface. */
export const Secondary: Story = {
  args: { variation: "secondary", defaultValue: "banana" },
  render: (args) => (
    <div className="bg-card-brand-secondary-background inline-block rounded-md p-6">
      <InlineSelect {...args} aria-label="Secondary inline select" />
    </div>
  ),
};

/** Disabled — muted foreground, not-allowed cursor, can't open. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "banana" },
  render: (args) => (
    <div className="inline-block p-4">
      <InlineSelect {...args} aria-label="Disabled inline select" />
    </div>
  ),
};

/**
 * Open — the portaled dropdown (reusing `Select`'s `SelectListbox`); the
 * selected row is brand-tinted with a 3px left accent bar (no check icon). The
 * story mounts with extra bottom space so the dropdown stays in frame.
 */
export const Open: Story = {
  parameters: { controls: { disable: true } },
  render: function OpenExample() {
    const [value, setValue] = React.useState("banana");
    return (
      <div className="pb-72">
        <InlineSelect
          options={FRUITS}
          value={value}
          onValueChange={setValue}
          aria-label="Fruit"
        />
      </div>
    );
  },
};
