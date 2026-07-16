import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiamondsFourIcon } from "@phosphor-icons/react";

import { Button } from "./Button";

/**
 * Mirrors the Figma `button` component set (`01. Buttons`):
 * variation × size × state × iconOnly — see the Design tab for the live node.
 * Placeholder icons are the same ❖ diamonds Figma uses for its icon slots.
 * Hover / focus / active columns are forced via `storybook-addon-pseudo-states`.
 */
const FIGMA_BUTTON_SET =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4865-4956";

/** The ❖ placeholder (Figma: `DiamondsFourIcon / weight=Regular`) — swap for a real Phosphor icon in app usage. */
const Slot = () => <DiamondsFourIcon weight="regular" />;

const meta = {
  title: "Buttons/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_BUTTON_SET },
  },
  args: {
    children: "Button",
    variation: "primary",
    size: "md",
    iconOnly: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    variation: {
      control: "select",
      options: ["primary", "secondary", "brand", "ghost", "destructive"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    asChild: { table: { disable: true } },
    leftSlot: { control: false },
    rightSlot: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Playground — drive every prop from the controls panel. */
export const Playground: Story = {
  args: { leftSlot: <Slot />, rightSlot: <Slot /> },
};

// ── The full Figma matrix ────────────────────────────────────────────────────

const VARIATIONS = [
  "primary",
  "secondary",
  "brand",
  "ghost",
  "destructive",
] as const;
const SIZES = ["lg", "md", "sm"] as const;
/** Figma `state` values; hover/focus/active are forced by the pseudo-states addon. */
const STATES = [
  "default",
  "hover",
  "focus",
  "active",
  "disabled",
  "loading",
] as const;

function MatrixCell({
  variation,
  size,
  state,
  iconOnly,
}: {
  variation: (typeof VARIATIONS)[number];
  size: (typeof SIZES)[number];
  state: (typeof STATES)[number];
  iconOnly?: boolean;
}) {
  const disabled = state === "disabled";
  const loading = state === "loading";
  return (
    <div className={`s-${state}`}>
      {iconOnly ? (
        <Button
          variation={variation}
          size={size}
          iconOnly
          disabled={disabled}
          loading={loading}
          aria-label="Placeholder"
        >
          <Slot />
        </Button>
      ) : (
        <Button
          variation={variation}
          size={size}
          disabled={disabled}
          loading={loading}
          leftSlot={<Slot />}
          rightSlot={<Slot />}
        >
          Button
        </Button>
      )}
    </div>
  );
}

/** Every Figma variant: variation × size × state, text + icon-only rows. */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    // Force the interactive states per column (class on the cell wrapper).
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      focusVisible: [".s-focus *"],
      active: [".s-active", ".s-active *"],
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
            className="grid items-center gap-x-6 gap-y-3"
            style={{ gridTemplateColumns: "2rem repeat(6, max-content)" }}
          >
            <span />
            {STATES.map((state) => (
              <span
                key={state}
                className="caption-03-medium text-foreground-muted"
              >
                {state}
              </span>
            ))}
            {SIZES.map((size) => (
              <React.Fragment key={size}>
                <span className="caption-03-medium text-foreground-muted">
                  {size}
                </span>
                {STATES.map((state) => (
                  <MatrixCell
                    key={state}
                    variation={variation}
                    size={size}
                    state={state}
                  />
                ))}
                <span className="caption-03-medium text-foreground-muted" />
                {STATES.map((state) => (
                  <MatrixCell
                    key={state}
                    variation={variation}
                    size={size}
                    state={state}
                    iconOnly
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

// ── Per-variation stories (applypass pattern) ───────────────────────────────

export const Primary: Story = {
  args: { variation: "primary", leftSlot: <Slot />, rightSlot: <Slot /> },
};

export const Secondary: Story = {
  args: { variation: "secondary", leftSlot: <Slot />, rightSlot: <Slot /> },
};

export const Brand: Story = {
  args: { variation: "brand", leftSlot: <Slot />, rightSlot: <Slot /> },
};

export const Ghost: Story = {
  args: { variation: "ghost", leftSlot: <Slot />, rightSlot: <Slot /> },
};

export const Destructive: Story = {
  args: { variation: "destructive", leftSlot: <Slot />, rightSlot: <Slot /> },
};

/** Icon-only footprint is square (w-8 / w-10 / w-12) with no horizontal padding. */
export const IconOnly: Story = {
  args: { iconOnly: true, "aria-label": "Placeholder" },
  render: (args) => (
    <Button {...args}>
      <Slot />
    </Button>
  ),
};

/** Loading: the spinner replaces the LEFT icon; the right icon persists (Figma). */
export const Loading: Story = {
  args: { loading: true, rightSlot: <Slot /> },
};

/** `asChild` keeps a button-styled link a real anchor. */
export const AsLink: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Button asChild variation="brand">
      <a href="#storybook">Open docs</a>
    </Button>
  ),
};
