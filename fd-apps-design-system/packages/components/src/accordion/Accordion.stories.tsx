import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Accordion } from "./Accordion";

/**
 * Compound `Accordion` (Figma `Accordion`, node `4887:150988`). A vertically
 * stacked set of collapsible sections: each item's trigger (title + Plus/Minus
 * icon) toggles its content region. The Root owns the open-item model
 * (`single` = one open at a time, `multiple` = independent), matching the
 * Dialog / Panel compound + context precedent.
 *
 * The Figma frame shows one item in three states — Collapsed, Hover, Expanded —
 * mirrored by the `Matrix` story (Hover / focus are forced via
 * `storybook-addon-pseudo-states`).
 */
const FIGMA_ACCORDION =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4887-150988";

const meta = {
  title: "Surfaces/Accordion",
  component: Accordion.Root,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_ACCORDION },
  },
} satisfies Meta<typeof Accordion.Root>;

export default meta;

const ITEMS = [
  { value: "a", title: "Title", description: "Description" },
  { value: "b", title: "Title", description: "Description" },
  { value: "c", title: "Title", description: "Description" },
] as const;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Drive the selection mode and `collapsible` from the controls panel. Renders a
 * three-item accordion in a bordered card (the card chrome belongs to the
 * consumer — Root is a plain stack).
 */
export const Playground: StoryObj<{
  type: "single" | "multiple";
  collapsible: boolean;
}> = {
  args: { type: "single", collapsible: true },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    collapsible: { control: "boolean" },
  },
  render: (args) => (
    <Accordion.Root
      type={args.type}
      collapsible={args.collapsible}
      defaultValue={args.type === "multiple" ? ["a"] : "a"}
      className="w-[466px] rounded-md border border-card-border bg-card-background px-4"
    >
      {ITEMS.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Trigger>{item.title}</Accordion.Trigger>
          <Accordion.Content>{item.description}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

/**
 * Mirrors the Figma states: Collapsed, Hover (forced via the pseudo-states
 * addon), and Expanded — plus a disabled row. Each is a single-item accordion
 * so the state is pinned.
 */
export const Matrix: StoryObj<typeof meta> = {
  parameters: {
    controls: { disable: true },
    pseudo: { hover: [".s-hover [data-slot='accordion-trigger']"] },
  },
  render: () => (
    <div className="flex w-[466px] flex-col gap-8 rounded-md border border-card-border bg-card-background p-6">
      {(
        [
          { label: "Collapsed", open: false, cls: "" },
          { label: "Hover", open: false, cls: "s-hover" },
          { label: "Expanded", open: true, cls: "" },
          { label: "Disabled", open: false, cls: "", disabled: true },
        ] as {
          label: string;
          open: boolean;
          cls: string;
          disabled?: boolean;
        }[]
      ).map(({ label, open, cls, disabled }) => (
        <div key={label} className="flex flex-col gap-2">
          <span className="caption-03-medium text-foreground-muted uppercase">
            {label}
          </span>
          <div className={cls}>
            <Accordion.Root type="single" defaultValue={open ? "a" : null}>
              <Accordion.Item value="a" disabled={disabled}>
                <Accordion.Trigger>Title</Accordion.Trigger>
                <Accordion.Content>Description</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      ))}
    </div>
  ),
};
