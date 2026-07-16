import { render, renderHook, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Select } from "./Select";
import { selectTriggerLabel } from "./SelectTrigger";
import {
  computeListboxPosition,
  computeListboxHorizontal,
} from "./SelectListbox";
import { nextEnabledIndex } from "./Select";
import { useSelectListbox } from "./useSelectListbox";

// --- Accessibility helper (mirrors the sibling suites) ---
// The open listbox is portaled to `document.body`, so the axe scan targets
// `baseElement`. `region` is a page-level landmark best-practice rule (all
// content must sit inside a landmark) — irrelevant to an isolated component
// mounted at the document root in a unit test — so it is turned off here; all
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

// ── Pure helpers ─────────────────────────────────────────────────────────────

describe("selectTriggerLabel", () => {
  it("shows the placeholder when nothing is selected", () => {
    expect(selectTriggerLabel(OPTS, [], "Select")).toEqual({
      text: "Select",
      isPlaceholder: true,
    });
  });
  it("shows the single option's label", () => {
    expect(selectTriggerLabel(OPTS, ["b"], "Select")).toEqual({
      text: "Banana",
      isPlaceholder: false,
    });
  });
  it("shows a count for multiple selections", () => {
    expect(selectTriggerLabel(OPTS, ["a", "c"], "Select")).toEqual({
      text: "2 selected",
      isPlaceholder: false,
    });
  });
  it("falls back to the placeholder for an unknown single value", () => {
    expect(selectTriggerLabel(OPTS, ["zzz"], "Select")).toEqual({
      text: "Select",
      isPlaceholder: true,
    });
  });
});

describe("computeListboxPosition", () => {
  const rect = (top: number, bottom: number) =>
    ({ top, bottom, left: 20, width: 200, height: bottom - top }) as DOMRect;

  it("places the listbox below the trigger by default", () => {
    const p = computeListboxPosition(rect(100, 140), 160, 800);
    expect(p.placement).toBe("bottom");
    expect(p.top).toBe(140);
    expect(p.left).toBe(20);
    expect(p.width).toBe(200);
  });

  it("flips above when there is no room below but room above", () => {
    const p = computeListboxPosition(rect(600, 640), 160, 700);
    expect(p.placement).toBe("top");
    expect(p.top).toBe(600 - 160);
  });

  it("stays below when neither side fits (then scrolls)", () => {
    // No room below (640 + 700 > 700) and no room above (top 40 < 700).
    const p = computeListboxPosition(rect(40, 640), 700, 700);
    expect(p.placement).toBe("bottom");
  });
});

describe("computeListboxHorizontal", () => {
  const rect = (left: number, width: number) =>
    ({ left, width, top: 0, bottom: 0, height: 0 }) as DOMRect;
  const MARGIN = 8;

  it("'trigger' mode matches the trigger width + left, no min/max", () => {
    const h = computeListboxHorizontal(
      rect(20, 200),
      "trigger",
      999,
      1000,
      MARGIN,
    );
    expect(h.left).toBe(20);
    expect(h.width).toBe(200);
    expect(h.minWidth).toBeUndefined();
    expect(h.maxWidth).toBeUndefined();
  });

  it("'auto' mode sizes to content: minWidth = trigger, maxWidth = viewport − 2×margin, no fixed width", () => {
    const h = computeListboxHorizontal(
      rect(20, 120),
      "auto",
      300,
      1000,
      MARGIN,
    );
    expect(h.width).toBeUndefined(); // `max-content` is applied in the style, not here
    expect(h.minWidth).toBe(120); // never narrower than the trigger
    expect(h.maxWidth).toBe(1000 - 2 * MARGIN);
    // Panel fits: left stays at the trigger's left.
    expect(h.left).toBe(20);
  });

  it("'auto' mode clamps left so the panel never overflows the right edge", () => {
    // trigger.left 900 + measured 300 = 1200 > 1000 − margin. Clamp to
    // viewportWidth − margin − measuredWidth = 1000 − 8 − 300 = 692.
    const h = computeListboxHorizontal(
      rect(900, 120),
      "auto",
      300,
      1000,
      MARGIN,
    );
    expect(h.left).toBe(692);
  });

  it("'auto' mode never clamps left below the margin (panel wider than viewport)", () => {
    // measured 1200 wider than the 1000 viewport → upper bound (−208) is below
    // margin, so left pins to the margin.
    const h = computeListboxHorizontal(
      rect(50, 120),
      "auto",
      1200,
      1000,
      MARGIN,
    );
    expect(h.left).toBe(MARGIN);
  });
});

describe("nextEnabledIndex", () => {
  const D = [
    { value: "a", label: "A" },
    { value: "b", label: "B", disabled: true },
    { value: "c", label: "C" },
  ];
  it("skips disabled options moving down", () => {
    expect(nextEnabledIndex(D, 0, 1)).toBe(2);
  });
  it("clamps at the start", () => {
    expect(nextEnabledIndex(D, 0, -1)).toBe(0);
  });
  it("clamps at the end", () => {
    expect(nextEnabledIndex(D, 2, 1)).toBe(2);
  });
});

// ── Static rendering (Task 1) ────────────────────────────────────────────────

describe("Select — static trigger", () => {
  it("renders the placeholder by default", () => {
    render(<Select options={OPTS} label="Fruit" placeholder="Select" />);
    expect(
      screen.getByRole("combobox", { name: /fruit/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Select")).toBeInTheDocument();
  });

  it("renders the selected label (single, uncontrolled)", () => {
    render(<Select options={OPTS} defaultValue="c" label="Fruit" />);
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("shows the error hint with the destructive token", () => {
    render(<Select options={OPTS} error hint="Required" aria-label="Fruit" />);
    const hint = screen.getByText("Required");
    expect(hint.className).toContain(
      "text-input-destructive-foreground-accent",
    );
  });

  it("applies the destructive border on the trigger when error", () => {
    render(<Select options={OPTS} error aria-label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain(
      "border-input-destructive-foreground-accent",
    );
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("applies the line variation (bottom border, no background)", () => {
    render(<Select options={OPTS} variation="line" aria-label="Fruit" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("border-b");
    expect(trigger.className).not.toContain("bg-input-background");
  });

  it("renders a leading slot, decorative (aria-hidden)", () => {
    render(
      <Select
        options={OPTS}
        aria-label="Fruit"
        leadingSlot={<span data-testid="lead" />}
      />,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot=select-leading]"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards a ref to the trigger button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Select options={OPTS} ref={ref} aria-label="Fruit" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<Select options={OPTS} disabled aria-label="Fruit" />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});

// ── Dropdown spine (Task 2) ──────────────────────────────────────────────────

describe("Select — open/close + selection", () => {
  it("opens on click and shows the options", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("gives the listbox a fixed pixel width from the trigger rect (default 'trigger' mode, unchanged)", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    // Trigger mode applies a fixed pixel `width` (from the trigger's measured
    // rect — 0px in jsdom) and NO content-sizing min/max width. `max-content`
    // is exclusive to InlineSelect's "auto" mode.
    expect(listbox.style.width).toMatch(/px$/);
    expect(listbox.style.width).not.toBe("max-content");
    expect(listbox.style.minWidth).toBe("");
    expect(listbox.style.maxWidth).toBe("");
  });

  it("selects an option and closes (single)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        options={OPTS}
        aria-label="Fruit"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape and on outside click", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select options={OPTS} aria-label="Fruit" />
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

  it("removes the portaled listbox from the DOM when closed (cleanup)", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    expect(
      document.body.querySelector("[data-slot=select-listbox]"),
    ).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(
      document.body.querySelector("[data-slot=select-listbox]"),
    ).toBeNull();
  });

  it("supports a controlled value + onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
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
});

// ── Keyboard + ARIA (Task 3) ─────────────────────────────────────────────────

describe("Select — keyboard + ARIA", () => {
  it("opens on ArrowDown when focused", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} aria-label="Fruit" />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("navigates with arrows and selects with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        options={OPTS}
        aria-label="Fruit"
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    // Opens with the active row on the first option (Apple, index 0);
    // ArrowDown → Banana (1), ArrowDown → Cherry (2), back up → Banana.
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("b");
  });

  it("skips disabled options during keyboard nav", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const D = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    render(
      <Select options={D} aria-label="Letter" onValueChange={onValueChange} />,
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
      <Select
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

  it("wires listbox ARIA (haspopup/expanded/controls)", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} aria-label="Fruit" />);
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

  it("marks the listbox multiselectable in multi mode", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} multiple aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    );
  });

  it("has no axe violations (closed)", async () => {
    const { container } = render(<Select options={OPTS} label="Fruit" />);
    await checkA11y(container);
  });

  it("has no axe violations (open)", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Select options={OPTS} label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    await checkA11y(baseElement);
  });

  it("has no axe violations (open, multi)", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Select options={OPTS} multiple label="Fruit" defaultValue={["a"]} />,
    );
    await user.click(screen.getByRole("combobox"));
    await checkA11y(baseElement);
  });
});

// ── Selection marking (Task 4) ───────────────────────────────────────────────

describe("Select — selection marking", () => {
  it("multi-select toggles values, keeps the list open, shows a count", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        options={OPTS}
        multiple
        aria-label="Fruit"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /Apple/ }));
    await user.click(screen.getByRole("option", { name: /Cherry/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument(); // stays open
    await user.keyboard("{Escape}");
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("multi rows render a checkbox reflecting selection", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={OPTS}
        multiple
        defaultValue={["a"]}
        aria-label="Fruit"
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const apple = screen.getByRole("option", { name: /Apple/ });
    expect(apple.querySelector('input[type="checkbox"]')).toBeChecked();
    const banana = screen.getByRole("option", { name: /Banana/ });
    expect(banana.querySelector('input[type="checkbox"]')).not.toBeChecked();
  });

  it("multi checkboxes are kept out of the a11y/tab flow", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} multiple aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const cb = screen
      .getByRole("option", { name: /Apple/ })
      .querySelector('input[type="checkbox"]');
    expect(cb).toHaveAttribute("aria-hidden", "true");
    expect(cb).toHaveAttribute("tabindex", "-1");
  });

  it("single-select marks the selected row with the brand row treatment + aria-selected", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} defaultValue="b" aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const banana = screen.getByRole("option", { name: "Banana" });
    expect(banana).toHaveAttribute("aria-selected", "true");
    // Figma node 4921:8203 — brand-tinted row + 3px left accent bar + brand
    // text (no check icon). We assert the token utilities, not a check mark.
    expect(banana.className).toContain("bg-card-brand-accent");
    // 3px left accent bar: width reserved on every row, recoloured here.
    expect(banana.className).toContain("border-l-3");
    expect(banana.className).toContain("border-l-card-brand-border-accent");
    expect(banana.className).toContain("text-card-brand-foreground");
    // The old trailing check is gone in single-select.
    expect(
      banana.querySelector('[data-slot="select-option-check"]'),
    ).toBeNull();
    const apple = screen.getByRole("option", { name: "Apple" });
    expect(apple).toHaveAttribute("aria-selected", "false");
    expect(apple.className).not.toContain("bg-card-brand-accent");
  });

  it("renders per-option leading and trailing slots (decorative)", async () => {
    const user = userEvent.setup();
    const opts = [
      {
        value: "a",
        label: "Apple",
        leadingSlot: <svg data-testid="apple-lead" />,
        trailingSlot: <svg data-testid="apple-trail" />,
      },
      { value: "b", label: "Banana" },
    ];
    render(<Select options={opts} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const apple = screen.getByRole("option", { name: /Apple/ });
    const lead = apple.querySelector('[data-slot="select-option-leading"]');
    const trail = apple.querySelector('[data-slot="select-option-trailing"]');
    expect(lead).not.toBeNull();
    expect(trail).not.toBeNull();
    // Decorative wrappers — kept out of the a11y tree.
    expect(lead).toHaveAttribute("aria-hidden", "true");
    expect(trail).toHaveAttribute("aria-hidden", "true");
    // A row without slots renders neither.
    const banana = screen.getByRole("option", { name: "Banana" });
    expect(
      banana.querySelector('[data-slot="select-option-leading"]'),
    ).toBeNull();
  });

  it("multi mode renders the leading slot after the checkbox", async () => {
    const user = userEvent.setup();
    const opts = [
      { value: "a", label: "Apple", leadingSlot: <svg data-testid="lead" /> },
    ];
    render(<Select options={opts} multiple aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const kids = [...screen.getByRole("option", { name: /Apple/ }).children];
    const checkboxIdx = kids.findIndex(
      (c) => c.querySelector('input[type="checkbox"]') != null,
    );
    const leadingIdx = kids.findIndex((c) =>
      c.matches('[data-slot="select-option-leading"]'),
    );
    expect(checkboxIdx).toBeGreaterThanOrEqual(0);
    expect(leadingIdx).toBeGreaterThan(checkboxIdx);
  });

  // --- showBottomLine (LINE-only, mirrors Input) ---

  it("applies the custom scrollbar utility to the listbox", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTS} aria-label="Fruit" />);
    await user.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain(
      "[&::-webkit-scrollbar-thumb]:bg-card-foreground-muted",
    );
    // Still scrolls natively past the token max-height.
    expect(listbox.className).toContain("overflow-y-auto");
  });

  it("line + showBottomLine={false} hides the resting line but keeps border-b (no layout shift)", () => {
    render(
      <Select
        options={OPTS}
        variation="line"
        showBottomLine={false}
        aria-label="Fruit"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("border-b");
    expect(trigger.className).toContain("border-transparent");
  });

  it("field variation ignores showBottomLine", () => {
    render(
      <Select
        options={OPTS}
        variation="field"
        showBottomLine={false}
        aria-label="Fruit"
      />,
    );
    expect(screen.getByRole("combobox").className).not.toContain(
      "border-transparent",
    );
  });

  it("line + showBottomLine={false} still shows the destructive line on error", () => {
    render(
      <Select
        options={OPTS}
        variation="line"
        showBottomLine={false}
        error
        aria-label="Fruit"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain(
      "border-input-destructive-foreground-accent",
    );
    expect(trigger.className).not.toContain("border-transparent");
  });
});

// ── Shared hook: closeOnSelect + reset (Filter's backward-compatible additions) ──

describe("useSelectListbox — closeOnSelect + reset", () => {
  it("defaults to closeOnSelect=true: a single pick closes (Select unchanged)", () => {
    const { result } = renderHook(() =>
      useSelectListbox({ options: OPTS, id: "t" }),
    );
    act(() => result.current.triggerProps.onClick()); // open
    expect(result.current.open).toBe(true);
    act(() => result.current.listboxProps.onSelect("b"));
    // Default behaviour: single pick commits AND closes.
    expect(result.current.selected).toEqual(["b"]);
    expect(result.current.open).toBe(false);
  });

  it("closeOnSelect=false: a single pick commits but stays open (Filter)", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useSelectListbox({
        options: OPTS,
        id: "t",
        closeOnSelect: false,
        onValueChange,
      }),
    );
    act(() => result.current.triggerProps.onClick()); // open
    act(() => result.current.listboxProps.onSelect("b"));
    expect(result.current.selected).toEqual(["b"]);
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    // Stays open, and a second pick replaces the first (single-select).
    expect(result.current.open).toBe(true);
    act(() => result.current.listboxProps.onSelect("c"));
    expect(result.current.selected).toEqual(["c"]);
    expect(onValueChange).toHaveBeenLastCalledWith("c");
    expect(result.current.open).toBe(true);
  });

  it("reset() clears through the onValueChange path (single → '')", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useSelectListbox({
        options: OPTS,
        id: "t",
        defaultValue: "a",
        onValueChange,
      }),
    );
    expect(result.current.selected).toEqual(["a"]);
    act(() => result.current.reset());
    expect(result.current.selected).toEqual([]);
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("reset() clears through the onValueChange path (multi → [])", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useSelectListbox({
        options: OPTS,
        id: "t",
        multiple: true,
        defaultValue: ["a", "c"],
        onValueChange,
      }),
    );
    expect(result.current.selected).toEqual(["a", "c"]);
    act(() => result.current.reset());
    expect(result.current.selected).toEqual([]);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
});
