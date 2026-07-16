import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiamondsFourIcon } from "@phosphor-icons/react";

import { SelectableFeatureCard } from "./SelectableFeatureCard";

/**
 * `SelectableFeatureCard` (Figma `SelectableFeatureCard`, node `5075:8855`) — a
 * single-select card whose leading slot is a real radio. Selecting it flips the
 * card to the brand-bordered look; the `editable` variation reveals an
 * expandable bottom slot while selected. Group cards by giving them the same
 * `name`.
 */
const FIGMA_SELECTABLE_FEATURE_CARD =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5075-8855";

const meta = {
  title: "Surfaces/SelectableFeatureCard",
  component: SelectableFeatureCard,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_SELECTABLE_FEATURE_CARD },
  },
  args: {
    title: "Title",
    subtitle: "Subtitle text",
  },
} satisfies Meta<typeof SelectableFeatureCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Toggle the card's pieces from the controls panel. `trailing` is a fixed
 * sample icon; the bottom slot appears when `variation="editable"` and the card
 * is selected.
 */
export const Playground: StoryObj<{
  title: string;
  subtitle: string;
  variation: "basic" | "editable";
  withTrailing: boolean;
}> = {
  args: {
    title: "Title",
    subtitle: "Subtitle text",
    variation: "editable",
    withTrailing: true,
  },
  argTypes: {
    variation: { control: "inline-radio", options: ["basic", "editable"] },
    withTrailing: { control: "boolean" },
  },
  render: (args) => (
    <div className="w-[440px]">
      <SelectableFeatureCard
        name="playground"
        title={args.title}
        subtitle={args.subtitle}
        variation={args.variation}
        trailing={args.withTrailing ? <DiamondsFourIcon /> : undefined}
      >
        <p className="body-03 text-card-foreground-muted">
          Editable content goes here.
        </p>
      </SelectableFeatureCard>
    </div>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

const VARIATIONS = ["basic", "editable"] as const;
const STATES = ["default", "selected"] as const;

/**
 * The Figma variant set — `variation` (basic / editable) × `state`
 * (default / selected). `selected` is a real `defaultChecked` radio (not a
 * forced pseudo-state); each card gets a unique `name` so the cells don't group
 * with one another. The `editable` + `selected` cell shows the revealed bottom
 * slot.
 */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      className="grid items-start gap-x-6 gap-y-3"
      style={{ gridTemplateColumns: "repeat(2, 440px)" }}
    >
      {STATES.map((state) => (
        <span key={state} className="caption-03-medium text-foreground-muted">
          {state}
        </span>
      ))}
      {VARIATIONS.map((variation) =>
        STATES.map((state) => (
          <SelectableFeatureCard
            key={`${variation}-${state}`}
            name={`matrix-${variation}-${state}`}
            title="Title"
            subtitle="Subtitle text"
            variation={variation}
            defaultChecked={state === "selected"}
            trailing={<DiamondsFourIcon />}
          >
            <p className="body-03 text-card-foreground-muted">
              Editable content goes here.
            </p>
          </SelectableFeatureCard>
        )),
      )}
    </div>
  ),
};
