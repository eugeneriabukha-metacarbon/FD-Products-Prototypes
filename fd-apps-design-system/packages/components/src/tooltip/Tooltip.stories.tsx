import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button";
import { Tooltip } from "./Tooltip";
import type { TooltipAlign, TooltipSide } from "./Tooltip";

/**
 * Compound `Tooltip` (Figma `Tooltip`, node `5153:4063`). A small floating label
 * that describes its trigger, shown on hover (after `delayDuration`) or keyboard
 * focus (immediately). The Root owns the open state, timing, and placement; the
 * Trigger is any focusable anchor (default `<button>`, or `asChild`); the Content
 * is the portaled dark "reversed" bubble.
 *
 * The Figma frame shows only the bubble (a dark surface with 12px centered text,
 * no arrow). The `Matrix` story mirrors the four placement sides with the bubble
 * forced open.
 */
const FIGMA_TOOLTIP =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5153-4063";

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip.Root,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_TOOLTIP },
  },
} satisfies Meta<typeof Tooltip.Root>;

export default meta;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Drive `side`, `align`, `delayDuration`, and `disabled` from the controls
 * panel. Hover or tab to the trigger to show the bubble.
 */
export const Playground: StoryObj<{
  side: TooltipSide;
  align: TooltipAlign;
  delayDuration: number;
  disabled: boolean;
}> = {
  args: { side: "top", align: "center", delayDuration: 600, disabled: false },
  argTypes: {
    side: {
      control: "inline-radio",
      options: ["top", "bottom", "left", "right"],
    },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    delayDuration: { control: { type: "number", min: 0, step: 100 } },
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <div className="p-24">
      <Tooltip.Root
        side={args.side}
        align={args.align}
        delayDuration={args.delayDuration}
        disabled={args.disabled}
      >
        <Tooltip.Trigger asChild>
          <Button variation="secondary">Hover or focus me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          A short description of what this control does.
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

const SIDES: TooltipSide[] = ["top", "bottom", "left", "right"];

/**
 * The four placement sides with the bubble forced open (`open`), so every
 * position is visible at once. Generous padding keeps the bubbles inside the
 * viewport (no flip). A long label demonstrates the `max-w-[244px]` wrap.
 */
export const Matrix: StoryObj<typeof meta> = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-24 p-24">
      {SIDES.map((side) => (
        <div key={side} className="flex flex-col items-center gap-2">
          <span className="caption-03-medium text-foreground-muted uppercase">
            {side}
          </span>
          <Tooltip.Root open side={side}>
            <Tooltip.Trigger asChild>
              <Button variation="secondary">{side}</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              Tooltip on the {side} — long enough to show the 244px wrap
              boundary.
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      ))}
    </div>
  ),
};
