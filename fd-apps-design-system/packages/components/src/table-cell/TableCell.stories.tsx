import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EthereumBgIcon } from "@financedistrict/apps-icons/networks";

import { Button } from "../button";
import { CellText } from "./CellText";
import { TableCell } from "./TableCell";

/**
 * TableCell — the atomic presentational cell for FD data tables (Layer 1). A
 * slot-based frame: `leading` / middle `children` / `trailing` are all
 * ReactNode, so any content composes in. Hover and the `active` prop apply the
 * brand-accent treatment; `last` omits the bottom row divider.
 *
 * `CellText` is the middle-slot helper (label + arbitrary-length `meta[]`).
 */
const FIGMA_TABLE_CELL =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4929-2411";

const meta = {
  title: "Data/TableCell",
  component: TableCell,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_TABLE_CELL },
  },
  args: {
    last: false,
    active: false,
  },
  argTypes: {
    leading: { control: false },
    trailing: { control: false },
    children: { control: false },
    asChild: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TableCell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Playground — drive `last` and `active` from the controls. */
export const Playground: Story = {
  render: (args) => (
    <TableCell
      {...args}
      leading={<EthereumBgIcon size={20} />}
      trailing={
        <Button variation="secondary" size="sm">
          Button
        </Button>
      }
    >
      <CellText label="Label" meta={["meta", "meta", "meta"]} />
    </TableCell>
  ),
};

/**
 * Matrix — the Figma 2×2 (state × position). The `active` column reproduces the
 * hover treatment; hover it live to see the same result driven by `:hover`.
 */
export const Matrix: Story = {
  render: () => {
    const cell = (last: boolean, active: boolean, label: string) => (
      <TableCell
        last={last}
        active={active}
        leading={<EthereumBgIcon size={20} />}
        trailing={
          <Button variation="secondary" size="sm">
            Button
          </Button>
        }
      >
        <CellText label={label} meta={["meta", "meta", "meta"]} />
      </TableCell>
    );
    return (
      <div className="flex flex-col gap-8">
        <div className="w-[360px]">
          <p className="body-mono-04 text-card-foreground-muted mb-1">
            default
          </p>
          {cell(false, false, "Label")}
          {cell(true, false, "Label")}
        </div>
        <div className="w-[360px]">
          <p className="body-mono-04 text-card-foreground-muted mb-1">active</p>
          {cell(false, true, "Label")}
          {cell(true, true, "Label")}
        </div>
      </div>
    );
  },
};

/**
 * Interactive — a focusable cell (rendered `asChild` as a `<button>`) that would
 * open a details panel. Tab to it: the keyboard focus state (`:focus-visible`) is
 * identical to hover. Note there is no nested interactive element (no trailing
 * Button) — the whole cell is the control.
 */
export const Interactive: Story = {
  render: () => (
    <div className="w-[360px]">
      <TableCell asChild leading={<EthereumBgIcon size={20} />}>
        <button type="button" className="cursor-pointer">
          <CellText label="Open details" meta={["0x1234…abcd"]} />
        </button>
      </TableCell>
      <TableCell asChild last leading={<EthereumBgIcon size={20} />}>
        <button type="button" className="cursor-pointer">
          <CellText label="Open details" meta={["0x5678…ef90"]} />
        </button>
      </TableCell>
    </div>
  ),
};

/** Slot combinations — leading-only, middle-only, all three, no meta. */
export const Slots: Story = {
  render: () => (
    <div className="w-[360px]">
      <TableCell leading={<EthereumBgIcon size={20} />}>
        <CellText label="Leading + middle" meta={["meta", "meta"]} />
      </TableCell>
      <TableCell>
        <CellText label="Middle only" />
      </TableCell>
      <TableCell
        leading={<EthereumBgIcon size={20} />}
        trailing={
          <Button variation="secondary" size="sm">
            Button
          </Button>
        }
      >
        <CellText label="All three slots" meta={["meta", "meta", "meta"]} />
      </TableCell>
      <TableCell
        last
        trailing={
          <Button variation="secondary" size="sm">
            Button
          </Button>
        }
      >
        <CellText label="No meta, trailing only" />
      </TableCell>
    </div>
  ),
};
