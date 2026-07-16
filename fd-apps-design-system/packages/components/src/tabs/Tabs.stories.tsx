import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiamondsFourIcon } from "@phosphor-icons/react";

import { Tabs } from "./Tabs";

/**
 * Compound underline-indicator `Tabs` (Figma `tab`, node `906-78043`),
 * following the WAI-ARIA Tabs pattern: a horizontal `tablist` of `tab` buttons,
 * each controlling a `tabpanel`. Single selection, horizontal, **automatic
 * activation** (arrow keys move focus AND select). Sibling of `Accordion` —
 * same stateful-compound shape (Root state owner + context, roving keyboard,
 * generated id wiring).
 *
 * The Figma frame shows a tab in its state × selected matrix, mirrored by the
 * `Matrix` story (hover / focus / active are forced via
 * `storybook-addon-pseudo-states`).
 */
const FIGMA_TABS =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=906-78043";

/** ❖ placeholder leading icon — swap for a real Phosphor icon in app usage. */
const Slot = () => <DiamondsFourIcon weight="regular" />;

const meta = {
  title: "Navigation/Tabs",
  component: Tabs.Root,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_TABS },
  },
} satisfies Meta<typeof Tabs.Root>;

export default meta;

const SECTIONS = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
] as const;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Drive the initial selection from the controls panel. Renders a three-tab set
 * (the last tab disabled) with a panel under each.
 */
export const Playground: StoryObj<{ defaultValue: string }> = {
  args: { defaultValue: "overview" },
  argTypes: {
    defaultValue: {
      control: "inline-radio",
      options: ["overview", "activity", "settings"],
    },
  },
  render: (args) => (
    <Tabs.Root defaultValue={args.defaultValue} className="w-[420px] gap-4">
      <Tabs.List aria-label="Account sections">
        {SECTIONS.map((section) => (
          <Tabs.Trigger key={section.value} value={section.value}>
            {section.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {SECTIONS.map((section) => (
        <Tabs.Content
          key={section.value}
          value={section.value}
          className="body-03 text-foreground-muted"
        >
          {section.label} panel content.
        </Tabs.Content>
      ))}
    </Tabs.Root>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

const STATES = ["default", "hover", "active", "focus", "disabled"] as const;

const SELECTIONS = [
  { selected: false, label: "not selected" },
  { selected: true, label: "selected" },
] as const;

/**
 * Mirrors the Figma variant set: selected/unselected (rows) × each interaction
 * state (columns). Each cell is a standalone single-tab `Tabs` so its selected
 * state is pinned; hover / active / focus are forced via
 * `storybook-addon-pseudo-states`.
 */
export const Matrix: StoryObj<typeof meta> = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover [data-slot='tabs-trigger']"],
      active: [".s-active [data-slot='tabs-trigger']"],
      focusVisible: [".s-focus [data-slot='tabs-trigger']"],
    },
  },
  render: () => (
    <div
      className="grid items-center gap-x-8 gap-y-4"
      style={{
        gridTemplateColumns: `6rem repeat(${STATES.length}, max-content)`,
      }}
    >
      <span />
      {STATES.map((state) => (
        <span key={state} className="caption-03-medium text-foreground-muted">
          {state}
        </span>
      ))}
      {SELECTIONS.map(({ selected, label }) => (
        <React.Fragment key={label}>
          <span className="caption-03-medium text-foreground-muted">
            {label}
          </span>
          {STATES.map((state) => {
            const cls = ["hover", "active", "focus"].includes(state)
              ? `s-${state}`
              : "";
            const disabled = state === "disabled";
            return (
              <div key={state} className={cls}>
                <Tabs.Root defaultValue={selected ? "a" : undefined}>
                  <Tabs.List aria-label={`${state} ${label}`}>
                    <Tabs.Trigger value="a" disabled={disabled}>
                      Tab
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs.Root>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  ),
};

// ── WithIcons ──────────────────────────────────────────────────────────────

/** Leading icons are passed as `children`; they inherit the tab's text color. */
export const WithIcons: StoryObj<typeof meta> = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs.Root defaultValue="overview" className="w-[420px] gap-4">
      <Tabs.List aria-label="Account sections">
        {SECTIONS.map((section) => (
          <Tabs.Trigger key={section.value} value={section.value}>
            <Slot />
            {section.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {SECTIONS.map((section) => (
        <Tabs.Content
          key={section.value}
          value={section.value}
          className="body-03 text-foreground-muted"
        >
          {section.label} panel content.
        </Tabs.Content>
      ))}
    </Tabs.Root>
  ),
};
