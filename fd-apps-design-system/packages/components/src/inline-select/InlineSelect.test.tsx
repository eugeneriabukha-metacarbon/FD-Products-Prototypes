import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { InlineSelect } from "./InlineSelect";

// --- Accessibility helper (mirrors the Select suite) ---
// The open listbox is portaled to `document.body`, so the axe scan targets
// `baseElement`. `region` is a page-level landmark best-practice rule
// irrelevant to an isolated component mounted at the document root — turned off
// here; all component-scoped rules (roles, ARIA attrs, nesting, contrast,
// names) stay on.
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { region: { enabled: false } },
  });
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

const OPTS = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry" },
];

describe("InlineSelect — rendering", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(
      <InlineSelect options={OPTS} placeholder="Pick" aria-label="Fruit" />,
    );
    expect(
      screen.getByRole("combobox", { name: /fruit/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pick")).toBeInTheDocument();
  });

  it("renders the selected label (uncontrolled)", () => {
    render(<InlineSelect options={OPTS} defaultValue="c" aria-label="Fruit" />);
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("renders the primary variation foreground token for a value", () => {
    render(
      <InlineSelect
        options={OPTS}
        defaultValue="a"
        variation="primary"
        aria-label="Fruit"
      />,
    );
    const value = document.querySelector("[data-slot=inline-select-value]");
    expect(value?.className).toContain("text-card-primary-foreground");
  });

  it("renders the secondary variation foreground token for a value", () => {
    render(
      <InlineSelect
        options={OPTS}
        defaultValue="a"
        variation="secondary"
        aria-label="Fruit"
      />,
    );
    const value = document.querySelector("[data-slot=inline-select-value]");
    expect(value?.className).toContain("text-card-brand-secondary-foreground");
  });

  it("uses the muted variation token for the placeholder + caret (primary)", () => {
    render(
      <InlineSelect options={OPTS} variation="primary" aria-label="Fruit" />,
    );
    const value = document.querySelector("[data-slot=inline-select-value]");
    const caret = document.querySelector("[data-slot=inline-select-caret] svg");
    expect(value?.className).toContain("text-card-primary-foreground-muted");
    expect(caret?.getAttribute("class")).toContain(
      "text-card-primary-foreground-muted",
    );
  });

  it("uses the muted variation token for the placeholder + caret (secondary)", () => {
    render(
      <InlineSelect options={OPTS} variation="secondary" aria-label="Fruit" />,
    );
    const value = document.querySelector("[data-slot=inline-select-value]");
    const caret = document.querySelector("[data-slot=inline-select-caret] svg");
    expect(value?.className).toContain(
      "text-card-brand-secondary-foreground-muted",
    );
    expect(caret?.getAttribute("class")).toContain(
      "text-card-brand-secondary-foreground-muted",
    );
  });

  it("carries the :focus-visible system ring classes (not a border recolor)", () => {
    render(<InlineSelect options={OPTS} aria-label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    // `outline-solid` must be present: in Tailwind v4 the base `outline-none`
    // sets `--tw-outline-style: none`, so `outline-2` alone (width only) leaves
    // the ring at `outline-style: none` and it never paints.
    expect(trigger.className).toContain("focus-visible:outline-solid");
    expect(trigger.className).toContain("focus-visible:outline-2");
    expect(trigger.className).toContain("focus-visible:outline-offset-2");
    expect(trigger.className).toContain("focus-visible:outline-focus");
    expect(trigger.className).toContain("rounded-xs");
    // It is NOT a bordered field.
    expect(trigger.className).not.toContain("border-input-border");
  });

  it("renders a decorative leading slot (aria-hidden)", () => {
    render(
      <InlineSelect
        options={OPTS}
        aria-label="Fruit"
        leadingSlot={<span data-testid="lead" />}
      />,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot=inline-select-leading]"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards a ref to the trigger button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<InlineSelect options={OPTS} ref={ref} aria-label="Fruit" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("is disabled and applies the not-allowed cursor when disabled", () => {
    render(<InlineSelect options={OPTS} disabled aria-label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(trigger.className).toContain("cursor-not-allowed");
  });
});

describe("InlineSelect — open/close + selection", () => {
  it("opens on click and shows the options", async () => {
    const user = userEvent.setup();
    render(<InlineSelect options={OPTS} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("sizes the dropdown to its content ('auto' width mode), not the inline trigger", async () => {
    const user = userEvent.setup();
    render(<InlineSelect options={OPTS} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    // jsdom can't compute `max-content`, so assert the inline style object, not
    // rendered pixels: content-sized width, floored at the trigger width
    // (0px measured in jsdom), and NO fixed pixel `width` (that is Select's
    // "trigger" mode).
    expect(listbox.style.width).toBe("max-content");
    expect(listbox.style.minWidth).toMatch(/px$/);
    expect(listbox.style.maxWidth).toMatch(/px$/);
  });

  it("opens on Enter, Space, and ArrowDown", async () => {
    const user = userEvent.setup();
    render(<InlineSelect options={OPTS} aria-label="Fruit" />);
    const trigger = screen.getByRole("combobox");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("selects an option with the mouse, emits a string, and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InlineSelect
        options={OPTS}
        aria-label="Fruit"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(onValueChange.mock.calls[0][0]).toBeTypeOf("string");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects an option with the keyboard (arrow + Enter)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InlineSelect
        options={OPTS}
        aria-label="Fruit"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    // Seeds on Apple (0); ArrowDown → Banana; Enter selects.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("b");
  });

  it("closes on Escape and on outside click", async () => {
    const user = userEvent.setup();
    render(
      <>
        <InlineSelect options={OPTS} aria-label="Fruit" />
        <button>outside</button>
      </>,
    );
    await user.click(screen.getByRole("combobox", { name: /fruit/i }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: /fruit/i }));
    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports a controlled value + onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InlineSelect
        options={OPTS}
        value="a"
        onValueChange={onValueChange}
        aria-label="Fruit"
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Cherry" }));
    expect(onValueChange).toHaveBeenLastCalledWith("c");
    // Controlled: display does not change until the parent updates `value`.
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<InlineSelect options={OPTS} disabled aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("InlineSelect — keyboard nav + type-ahead", () => {
  it("skips disabled options during keyboard nav", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const D = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    render(
      <InlineSelect
        options={D}
        aria-label="Letter"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    // Active seeds on A (0); one ArrowDown skips the disabled B → C.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("c");
  });

  it("jumps to a matching option via type-ahead", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InlineSelect
        options={OPTS}
        aria-label="Fruit"
        onValueChange={onValueChange}
      />,
    );
    screen.getByRole("combobox").focus();
    await user.keyboard("c"); // opens + jumps to Cherry
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("c");
  });

  it("wires the listbox ARIA (haspopup/expanded/controls/activedescendant)", async () => {
    const user = userEvent.setup();
    render(<InlineSelect options={OPTS} aria-label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute(
      "aria-controls",
      screen.getByRole("listbox").id,
    );
    expect(trigger).toHaveAttribute("aria-activedescendant");
  });
});

describe("InlineSelect — a11y", () => {
  it("has no axe violations (closed)", async () => {
    const { container } = render(
      <InlineSelect options={OPTS} aria-label="Fruit" />,
    );
    await checkA11y(container);
  });

  it("has no axe violations (open)", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <InlineSelect options={OPTS} aria-label="Fruit" />,
    );
    await user.click(screen.getByRole("combobox"));
    await checkA11y(baseElement);
  });
});
