import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Filter } from "./Filter";
import { SelectListbox } from "../select/SelectListbox";

// --- Accessibility helper (mirrors the select-family suites) ---
// The open listbox is portaled to `document.body`, so the axe scan targets
// `baseElement`. `region` is a page-level landmark rule irrelevant to an
// isolated component mounted at the document root — turned off here; all
// component-scoped rules (roles, ARIA attrs, nesting, contrast, names) stay on.
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

describe("Filter — rendering", () => {
  it("renders the pill trigger as a combobox named by the label", () => {
    render(<Filter options={OPTS} label="Fruit" />);
    expect(
      screen.getByRole("combobox", { name: /fruit/i }),
    ).toBeInTheDocument();
  });

  it("shows the filter label when nothing is selected (single)", () => {
    render(<Filter options={OPTS} label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Fruit");
    // No count badge when empty.
    expect(
      document.querySelector("[data-slot=filter-count]"),
    ).not.toBeInTheDocument();
  });

  it("carries the :focus-visible system ring classes (not a border recolor)", () => {
    render(<Filter options={OPTS} label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    // `outline-solid` MUST be present (TW4: base `outline-none` zeroes the style,
    // so `outline-2` alone leaves the ring invisible).
    expect(trigger.className).toContain("focus-visible:outline-solid");
    expect(trigger.className).toContain("focus-visible:outline-2");
    expect(trigger.className).toContain("focus-visible:outline-offset-2");
    expect(trigger.className).toContain("focus-visible:outline-focus");
    // Chip surface tokens (card/neutral/primary → card-primary-*).
    expect(trigger.className).toContain("bg-card-primary-background");
    expect(trigger.className).toContain("border-card-primary-border");
    expect(trigger.className).not.toContain("border-input-border");
  });

  it("forwards a ref to the trigger button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Filter options={OPTS} label="Fruit" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("is disabled and applies the not-allowed cursor when disabled", () => {
    render(<Filter options={OPTS} label="Fruit" disabled />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(trigger.className).toContain("cursor-not-allowed");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Filter options={OPTS} label="Fruit" disabled />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("Filter — trigger content (single vs multi)", () => {
  it("single: shows the selected option's label, no badge", () => {
    render(<Filter options={OPTS} label="Fruit" defaultValue="b" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Banana");
    expect(trigger).not.toHaveTextContent("Fruit");
    expect(
      document.querySelector("[data-slot=filter-count]"),
    ).not.toBeInTheDocument();
  });

  it("multi: always shows the label + a count badge when ≥1 selected", () => {
    render(
      <Filter
        options={OPTS}
        label="Fruit"
        multiple
        defaultValue={["a", "c"]}
      />,
    );
    const trigger = screen.getByRole("combobox");
    // Label stays static (NOT the selected option's label).
    expect(trigger).toHaveTextContent("Fruit");
    expect(trigger).not.toHaveTextContent("Apple");
    const badge = document.querySelector("[data-slot=filter-count]");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("2");
    // The badge is decorative (aria-hidden) so the trigger name stays "Fruit".
    expect(badge).toHaveAttribute("aria-hidden", "true");
  });

  it("multi: no badge when nothing selected", () => {
    render(<Filter options={OPTS} label="Fruit" multiple />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Fruit");
    expect(
      document.querySelector("[data-slot=filter-count]"),
    ).not.toBeInTheDocument();
  });
});

describe("Filter — selection stays open", () => {
  it("single: picking an option emits the value, replaces prior selection, stays open", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Filter options={OPTS} label="Fruit" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    // closeOnSelect=false → the dropdown stays open.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    // A second pick REPLACES the first (single-select).
    await user.click(screen.getByRole("option", { name: "Cherry" }));
    expect(onValueChange).toHaveBeenLastCalledWith("c");
  });

  it("multi: picking toggles options (array) and stays open with checkboxes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Filter
        options={OPTS}
        label="Fruit"
        multiple
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    // Leading checkboxes present in multi mode.
    expect(
      document.querySelectorAll("[data-slot=select-option-checkbox]").length,
    ).toBe(3);
    await user.click(screen.getByRole("option", { name: "Apple" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
    await user.click(screen.getByRole("option", { name: "Cherry" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("supports a controlled value + onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Filter
        options={OPTS}
        label="Fruit"
        value="a"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Cherry" }));
    expect(onValueChange).toHaveBeenLastCalledWith("c");
    // Controlled: display does not change until the parent updates `value`.
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
  });
});

describe("Filter — Reset footer", () => {
  it("is present in the open dropdown with the accessible name 'Reset'", async () => {
    const user = userEvent.setup();
    render(<Filter options={OPTS} label="Fruit" defaultValue="a" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("is disabled when nothing is selected", async () => {
    const user = userEvent.setup();
    render(<Filter options={OPTS} label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("is enabled once something is selected", async () => {
    const user = userEvent.setup();
    render(<Filter options={OPTS} label="Fruit" defaultValue="a" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
  });

  it("clears the selection on click and keeps the dropdown open (single)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Filter
        options={OPTS}
        label="Fruit"
        defaultValue="a"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    // Cleared through the same onValueChange path → "" for single.
    expect(onValueChange).toHaveBeenLastCalledWith("");
    // Dropdown stays open.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    // Trigger falls back to the label; Reset becomes disabled again.
    expect(screen.getByRole("combobox")).toHaveTextContent("Fruit");
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("clears the selection on click (multi → empty array)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Filter
        options={OPTS}
        label="Fruit"
        multiple
        defaultValue={["a", "c"]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(
      document.querySelector("[data-slot=filter-count]"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});

describe("Filter — keyboard", () => {
  it("opens on Enter, Space, and ArrowDown; closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Filter options={OPTS} label="Fruit" />);
    const trigger = screen.getByRole("combobox");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("selects with the keyboard and stays open (single)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Filter options={OPTS} label="Fruit" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    // Seeds on Apple (0); ArrowDown → Banana; Enter selects.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("wires the listbox ARIA (haspopup/expanded/controls/activedescendant)", async () => {
    const user = userEvent.setup();
    render(<Filter options={OPTS} label="Fruit" />);
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

describe("Filter — a11y", () => {
  it("has no axe violations (closed)", async () => {
    const { container } = render(<Filter options={OPTS} label="Fruit" />);
    await checkA11y(container);
  });

  it("has no axe violations (open, single)", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Filter options={OPTS} label="Fruit" defaultValue="a" />,
    );
    await user.click(screen.getByRole("combobox"));
    await checkA11y(baseElement);
  });

  it("has no axe violations (open, multi)", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Filter options={OPTS} label="Fruit" multiple defaultValue={["a"]} />,
    );
    await user.click(screen.getByRole("combobox"));
    await checkA11y(baseElement);
  });
});

// ── SelectListbox `footer` slot (the new shared extension) ────────────────────

describe("SelectListbox — footer slot", () => {
  const anchorRect = {
    top: 0,
    left: 0,
    bottom: 40,
    right: 100,
    width: 100,
    height: 40,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;

  const listboxProps = {
    id: "lb",
    options: OPTS,
    selected: [],
    multiple: false,
    activeIndex: -1,
    anchorRect,
    onSelect: () => {},
    onActiveChange: () => {},
  };

  it("without a footer, renders the <ul> AS the panel — no panel/footer wrapper", () => {
    render(<SelectListbox {...listboxProps} aria-label="Fruit" />);
    const list = screen.getByRole("listbox");
    // The <ul> itself carries the card chrome (byte-identical to before).
    expect(list.className).toContain("bg-card-background");
    expect(list.getAttribute("data-slot")).toBe("select-listbox");
    // No panel or footer slot exists.
    expect(
      document.querySelector("[data-slot=select-listbox-panel]"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector("[data-slot=select-listbox-footer]"),
    ).not.toBeInTheDocument();
  });

  it("with a footer, wraps the list in a panel and pins the footer below it", () => {
    render(
      <SelectListbox
        {...listboxProps}
        aria-label="Fruit"
        footer={<button type="button">Reset</button>}
      />,
    );
    const panel = document.querySelector("[data-slot=select-listbox-panel]");
    const footer = document.querySelector("[data-slot=select-listbox-footer]");
    const list = screen.getByRole("listbox");
    expect(panel).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    // Card chrome moves to the panel; the <ul> only scrolls now.
    expect(panel?.className).toContain("bg-card-background");
    expect(list.className).not.toContain("bg-card-background");
    expect(list.className).toContain("overflow-y-auto");
    // Footer is a sibling AFTER the list, both inside the panel.
    expect(panel?.contains(list)).toBe(true);
    expect(panel?.contains(footer!)).toBe(true);
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
});
