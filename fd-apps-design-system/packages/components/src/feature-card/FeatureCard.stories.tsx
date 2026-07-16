import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiamondsFourIcon } from "@phosphor-icons/react";

import { FeatureCard } from "./FeatureCard";

/**
 * `FeatureCard` (Figma `feature-card`, node `4854:144741`) — a compact
 * navigation card. The whole surface is the click target (renders an `<a>`
 * from `href`, or a router `<Link>` via `asChild`). Icons are decorative; the
 * link is named by its title + subtitle text.
 */
const FIGMA_FEATURE_CARD =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4854-144741";

const meta = {
  title: "Surfaces/FeatureCard",
  component: FeatureCard,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_FEATURE_CARD },
  },
  args: {
    href: "#",
    title: "Title",
    subtitle: "Subtitle text",
    caret: true,
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Toggle the card's pieces from the controls panel. `leading`/`trailing` are
 * fixed sample icons here; flip them via the boolean args below.
 */
export const Playground: StoryObj<{
  title: string;
  subtitle: string;
  caret: boolean;
  withLeading: boolean;
  withTrailing: boolean;
}> = {
  args: {
    title: "Title",
    subtitle: "Subtitle text",
    caret: true,
    withLeading: true,
    withTrailing: true,
  },
  render: (args) => (
    <div className="w-[302px]">
      <FeatureCard
        href="#"
        title={args.title}
        subtitle={args.subtitle}
        caret={args.caret}
        leading={args.withLeading ? <DiamondsFourIcon /> : undefined}
        trailing={args.withTrailing ? <DiamondsFourIcon /> : undefined}
      />
    </div>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

/** The Figma `state` values; `hover` is forced by the pseudo-states addon. */
const STATES = ["default", "hover"] as const;

/**
 * The two Figma states — `default` and `hover` — side by side, each labelled.
 * `hover` is forced via `storybook-addon-pseudo-states` (the `.s-hover`
 * wrapper), so the cell shows the real `hover:bg-card-accent` styling rather
 * than a hard-coded class. Each card sits in a bordered frame so the subtle
 * accent background is legible against the canvas.
 */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    // Force the hover state on the card inside the `.s-hover` wrapper.
    pseudo: { hover: [".s-hover", ".s-hover *"] },
  },
  render: () => (
    <div
      className="grid items-start gap-x-6 gap-y-3"
      style={{ gridTemplateColumns: "repeat(2, 302px)" }}
    >
      {STATES.map((state) => (
        <span key={state} className="caption-03-medium text-foreground-muted">
          {state}
        </span>
      ))}
      {STATES.map((state) => (
        <div
          key={state}
          className={`s-${state} overflow-hidden rounded-md border border-border`}
        >
          <FeatureCard
            href="#"
            title="Title"
            subtitle="Subtitle text"
            leading={<DiamondsFourIcon />}
            trailing={<DiamondsFourIcon />}
          />
        </div>
      ))}
    </div>
  ),
};
