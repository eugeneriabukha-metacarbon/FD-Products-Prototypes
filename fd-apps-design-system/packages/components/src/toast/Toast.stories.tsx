import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Toast } from "./Toast";

/**
 * `Toast` (Figma `Toast`, node `5020:2203`) — a presentational dark
 * notification chip. It is a live region (`status`/`alert` by variation);
 * mounting, positioning, stacking, and auto-dismiss are the app's concern (no
 * toast manager here). Pass `onClose` to show the dismiss button.
 */
const FIGMA_TOAST =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5020-2203";

const meta = {
  title: "Feedback/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_TOAST },
  },
  args: {
    children: "Message.",
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Playground ───────────────────────────────────────────────────────────────

/** Toggle the variation and the close button from the controls panel. */
export const Playground: StoryObj<{
  variation: "success" | "error";
  message: string;
  withClose: boolean;
}> = {
  args: { variation: "success", message: "Message.", withClose: true },
  argTypes: {
    variation: { control: "inline-radio", options: ["success", "error"] },
    withClose: { control: "boolean" },
  },
  render: (args) => (
    <div className="w-[280px]">
      <Toast
        variation={args.variation}
        onClose={args.withClose ? () => {} : undefined}
      >
        {args.message}
      </Toast>
    </div>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

const VARIATIONS = ["success", "error"] as const;

/** The Figma variant set — `success` and `error`, each with a close button. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-3" style={{ gridTemplateColumns: "280px" }}>
      {VARIATIONS.map((variation) => (
        <div key={variation} className="grid gap-1">
          <span className="caption-03-medium text-foreground-muted">
            {variation}
          </span>
          <Toast variation={variation} onClose={() => {}}>
            Message.
          </Toast>
        </div>
      ))}
    </div>
  ),
};
