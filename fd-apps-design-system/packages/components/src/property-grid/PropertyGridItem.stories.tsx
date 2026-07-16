import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfoIcon, CopyIcon, TagIcon } from "@phosphor-icons/react";

import { PropertyGridContent } from "./PropertyGridContent";
import { PropertyGridItem } from "./PropertyGridItem";
import { PropertyGridTitle } from "./PropertyGridTitle";

/**
 * PropertyGridItem — one key/value row for a property grid: a `title` (left,
 * muted) and `content` (right, foreground), each a slot-based cell (leading /
 * middle / trailing). Static, read-only. The row owns the bottom divider; `last`
 * omits it. Stacked items align columns automatically (each is grid-cols-2 1fr/1fr).
 */
const FIGMA_PROPERTY_GRID =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5041-4506";

const meta = {
  title: "Data/PropertyGridItem",
  component: PropertyGridItem,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_PROPERTY_GRID },
  },
  args: {
    last: false,
  },
  argTypes: {
    children: { control: false },
    ref: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PropertyGridItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Playground — toggle `last` to show/hide the row divider. */
export const Playground: Story = {
  render: (args) => (
    <PropertyGridItem {...args}>
      <PropertyGridTitle leading={<TagIcon />}>Network</PropertyGridTitle>
      <PropertyGridContent trailing={<CopyIcon />}>
        Ethereum
      </PropertyGridContent>
    </PropertyGridItem>
  ),
};

/**
 * Grid — several stacked rows (the last uses `last`); columns align because each
 * row is a 1fr/1fr grid. Shows slot combinations across rows.
 */
export const Grid: Story = {
  render: () => (
    <div>
      <PropertyGridItem>
        <PropertyGridTitle leading={<TagIcon />}>Network</PropertyGridTitle>
        <PropertyGridContent>Ethereum</PropertyGridContent>
      </PropertyGridItem>
      <PropertyGridItem>
        <PropertyGridTitle>Status</PropertyGridTitle>
        <PropertyGridContent trailing={<InfoIcon />}>
          Active
        </PropertyGridContent>
      </PropertyGridItem>
      <PropertyGridItem>
        <PropertyGridTitle leading={<TagIcon />}>Address</PropertyGridTitle>
        <PropertyGridContent trailing={<CopyIcon />}>
          0x1234…abcd
        </PropertyGridContent>
      </PropertyGridItem>
      <PropertyGridItem last>
        <PropertyGridTitle>Amount</PropertyGridTitle>
        <PropertyGridContent>1,250.00</PropertyGridContent>
      </PropertyGridItem>
    </div>
  ),
};

/** Slots — every slot combination on a single row. */
export const Slots: Story = {
  render: () => (
    <div>
      <PropertyGridItem>
        <PropertyGridTitle>Bare title</PropertyGridTitle>
        <PropertyGridContent>Bare content</PropertyGridContent>
      </PropertyGridItem>
      <PropertyGridItem>
        <PropertyGridTitle leading={<TagIcon />} trailing={<InfoIcon />}>
          Both slots
        </PropertyGridTitle>
        <PropertyGridContent leading={<TagIcon />} trailing={<CopyIcon />}>
          Both slots
        </PropertyGridContent>
      </PropertyGridItem>
      <PropertyGridItem last>
        <PropertyGridTitle trailing={<InfoIcon />}>
          Title trailing
        </PropertyGridTitle>
        <PropertyGridContent leading={<TagIcon />}>
          Content leading
        </PropertyGridContent>
      </PropertyGridItem>
    </div>
  ),
};
