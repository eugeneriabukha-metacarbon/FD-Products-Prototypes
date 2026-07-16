import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CalendarIcon,
  DiamondsFourIcon,
  EnvelopeIcon,
  EyeIcon,
  LockIcon,
  MagnifyingGlassIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";

import { Input } from "./Input";

/**
 * Mirrors the Figma `BaseInput` component (node 4973:6816):
 * variation (field / line) × size (sm / lg) × runtime state — see the Design
 * tab for the live node. The Figma "states" (default / hover / focused /
 * filled / disabled) are real DOM states of the `<input>`, forced here via
 * `storybook-addon-pseudo-states` (hover/focus) and props (filled/disabled/
 * error). Placeholder icon slots use the same ❖ diamond Figma draws.
 *
 * Note on `hover`: this control treats hover as an I-beam cursor affordance
 * ONLY — hover does NOT recolour the border (a user-authorized deviation from
 * the Figma). The `hover` column therefore looks identical to `default`; the
 * accent border appears only under `focused`. Cursor changes aren't visible in
 * a static screenshot, so the column is kept for state coverage, not colour.
 */
const FIGMA_INPUT =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4973-6816";

/** The ❖ placeholder (Figma icon slot) — swap for a real Phosphor icon in app usage. */
const Slot = () => <DiamondsFourIcon weight="regular" />;

const meta = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    design: { type: "figma", url: FIGMA_INPUT },
  },
  args: {
    label: "Label",
    placeholder: "Placeholder",
    variation: "field",
    size: "lg",
    optional: false,
    error: false,
    disabled: false,
    hint: "Helper message",
    showBottomLine: true,
  },
  argTypes: {
    variation: { control: "inline-radio", options: ["field", "line"] },
    size: { control: "inline-radio", options: ["sm", "lg"] },
    // LINE-only: hides the resting bottom line (still shows on focus/error).
    showBottomLine: { control: "boolean" },
    leftSlot: { control: false },
    rightSlot: { control: false },
    wrapperClassName: { control: false },
    fieldClassName: { control: false },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Curated Phosphor icons offered by the Playground slot pickers. */
const PLAYGROUND_ICONS = {
  MagnifyingGlass: MagnifyingGlassIcon,
  DiamondsFour: DiamondsFourIcon,
  Eye: EyeIcon,
  User: UserIcon,
  Envelope: EnvelopeIcon,
  Lock: LockIcon,
  Calendar: CalendarIcon,
  X: XIcon,
} as const;

/** Phosphor icon weights (the `weight` prop). */
const ICON_WEIGHTS = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
] as const;

/**
 * Playground args = the real Input props plus slot proxy controls. `leftSlot`/
 * `rightSlot` are `ReactNode` and can't be Storybook controls, so these proxies
 * (show/hide toggle, icon picker, shared weight) build the icon nodes in
 * `render`.
 */
type PlaygroundArgs = React.ComponentProps<typeof Input> & {
  showLeftSlot: boolean;
  showRightSlot: boolean;
  leftIcon: keyof typeof PLAYGROUND_ICONS;
  rightIcon: keyof typeof PLAYGROUND_ICONS;
  iconWeight: (typeof ICON_WEIGHTS)[number];
};

/**
 * Playground — drive every prop from the controls panel, including the leading
 * and trailing slots: toggle each on/off, choose its icon, and choose the
 * shared Phosphor weight.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    showLeftSlot: true,
    showRightSlot: true,
    leftIcon: "MagnifyingGlass",
    rightIcon: "DiamondsFour",
    iconWeight: "regular",
  },
  argTypes: {
    showLeftSlot: { control: "boolean", table: { category: "Slots" } },
    showRightSlot: { control: "boolean", table: { category: "Slots" } },
    leftIcon: {
      control: "select",
      options: Object.keys(PLAYGROUND_ICONS),
      table: { category: "Slots" },
    },
    rightIcon: {
      control: "select",
      options: Object.keys(PLAYGROUND_ICONS),
      table: { category: "Slots" },
    },
    iconWeight: {
      control: "select",
      options: ICON_WEIGHTS,
      table: { category: "Slots" },
    },
  },
  render: ({
    showLeftSlot,
    showRightSlot,
    leftIcon,
    rightIcon,
    iconWeight,
    ...args
  }) => {
    const LeftIcon = PLAYGROUND_ICONS[leftIcon];
    const RightIcon = PLAYGROUND_ICONS[rightIcon];
    return (
      <Input
        {...args}
        leftSlot={showLeftSlot ? <LeftIcon weight={iconWeight} /> : undefined}
        rightSlot={
          showRightSlot ? <RightIcon weight={iconWeight} /> : undefined
        }
      />
    );
  },
};

// ── The full Figma matrix ────────────────────────────────────────────────────

const VARIATIONS = ["field", "line"] as const;
const SIZES = ["lg", "sm"] as const;
/**
 * Figma `state` values; hover/focused are forced by the pseudo-states addon.
 * `hover` is cursor-only here (no colour delta vs `default`); `focused` shows
 * the accent border.
 */
const STATES = [
  "default",
  "hover",
  "focused",
  "filled",
  "disabled",
  "error",
] as const;

function MatrixCell({
  variation,
  size,
  state,
}: {
  variation: (typeof VARIATIONS)[number];
  size: (typeof SIZES)[number];
  state: (typeof STATES)[number];
}) {
  const filled = state === "filled";
  return (
    <div className={`s-${state} w-48`}>
      <Input
        aria-label={`${variation} ${size} ${state}`}
        variation={variation}
        size={size}
        disabled={state === "disabled"}
        error={state === "error"}
        placeholder="Placeholder"
        defaultValue={filled ? "Typed value" : undefined}
        leftSlot={<Slot />}
        rightSlot={<Slot />}
      />
    </div>
  );
}

/** Every Figma variant: variation × size × state, forced via pseudo-states. */
export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".s-hover", ".s-hover *"],
      // Input signals focus via `focus-within:` (not the system ring), so force
      // `:focus-within` — `focusVisible` would not light the accent border.
      focusWithin: [".s-focused", ".s-focused *"],
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
            className="grid items-start gap-x-6 gap-y-6"
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
              </React.Fragment>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

// ── Usage patterns ───────────────────────────────────────────────────────────

/** Bordered box variant with leading + trailing icons. */
export const Field: Story = {
  args: {
    variation: "field",
    leftSlot: <MagnifyingGlassIcon weight="regular" />,
  },
};

/** Bottom-line-only variant (no box/background). */
export const Line: Story = {
  args: {
    variation: "line",
    leftSlot: <MagnifyingGlassIcon weight="regular" />,
  },
};

/**
 * `line` with `showBottomLine={false}` — the resting bottom line is hidden
 * (transparent), but the 1px `border-b` is kept so there is no layout shift.
 * The line still reappears on focus (accent) and on error (destructive); the
 * two lower instances demonstrate that.
 */
export const LineBorderless: Story = {
  parameters: {
    controls: { disable: true },
    // Focus is `focus-within:` on the field, so force `:focus-within`.
    pseudo: { focusWithin: [".s-focused", ".s-focused *"] },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <Input
        aria-label="Line borderless at rest"
        variation="line"
        showBottomLine={false}
        placeholder="No line at rest"
        leftSlot={<MagnifyingGlassIcon weight="regular" />}
      />
      <div className="s-focused">
        <Input
          aria-label="Line borderless focused"
          variation="line"
          showBottomLine={false}
          defaultValue="Focused — accent line shows"
          leftSlot={<MagnifyingGlassIcon weight="regular" />}
        />
      </div>
      <Input
        aria-label="Line borderless error"
        variation="line"
        showBottomLine={false}
        error
        defaultValue="Error — destructive line shows"
        hint="Still shows the line on error"
        leftSlot={<MagnifyingGlassIcon weight="regular" />}
      />
    </div>
  ),
};

/** Label row with the "Optional" tag on the right. */
export const Optional: Story = {
  args: { optional: true, hint: undefined },
};

/** Error: destructive label/border/icons + a warning hint icon. */
export const ErrorState: Story = {
  args: { error: true, hint: "Something needs your attention" },
};

/** Disabled: text + icons drop to the muted foreground. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Cannot edit" },
};

/** No label / no hint — just the bare field. */
export const FieldOnly: Story = {
  args: { label: undefined, hint: undefined },
};

/** Controlled via `value` + `onChange` (standard input contract). */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledExample() {
    const [value, setValue] = React.useState("");
    return (
      <Input
        label="Search"
        placeholder="Type to filter…"
        leftSlot={<MagnifyingGlassIcon weight="regular" />}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        hint={value ? `${value.length} characters` : "Start typing"}
      />
    );
  },
};
