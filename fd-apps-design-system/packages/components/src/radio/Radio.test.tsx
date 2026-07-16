import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import * as React from "react";
import { describe, it, expect, vi } from "vitest";

import { Radio } from "./Radio";

// --- Accessibility helper (mirrors the Button reference suite) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

/** A three-option `name`-grouped set — radio behavior only exists in a group. */
function Group(props: {
  onCheckedChange?: (checked: boolean) => void;
  defaultValue?: string;
}) {
  return (
    <>
      {["a", "b", "c"].map((value) => (
        <Radio
          key={value}
          name="group"
          value={value}
          aria-label={value.toUpperCase()}
          defaultChecked={props.defaultValue === value}
          onCheckedChange={props.onCheckedChange}
        />
      ))}
    </>
  );
}

describe("Radio", () => {
  // --- Rendering ---

  it("renders a real native radio input", () => {
    render(<Radio aria-label="Option" />);
    const radio = screen.getByRole("radio", { name: "Option" });
    expect(radio).toBeInstanceOf(HTMLInputElement);
    expect(radio).toHaveAttribute("type", "radio");
  });

  it("renders with data-slot=radio on the input", () => {
    render(<Radio aria-label="Option" />);
    expect(screen.getByRole("radio")).toHaveAttribute("data-slot", "radio");
  });

  it("renders the decorative ● indicator (aria-hidden, peer-revealed)", () => {
    const { container } = render(<Radio aria-label="Option" />);
    const indicator = container.querySelector('[data-slot="radio-indicator"]');
    expect(indicator).not.toBeNull();
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    // SVG className is an SVGAnimatedString — read the attribute instead.
    expect(indicator?.getAttribute("class")).toContain("peer-checked:visible");
  });

  it("applies the state × selected token utilities from the Figma set", () => {
    render(<Radio aria-label="Option" />);
    const cls = screen.getByRole("radio").className;
    // Circle: 20×20, radius/full
    expect(cls).toContain("size-5");
    expect(cls).toContain("rounded-full");
    // default / selected / disabled branches (semantic tokens only)
    expect(cls).toContain("bg-background");
    expect(cls).toContain("checked:bg-brand-primary-background");
    expect(cls).toContain("checked:hover:bg-brand-primary-accent");
    expect(cls).toContain("disabled:border-border-muted");
    // focused: shared --focus ring
    expect(cls).toContain("focus-visible:outline-focus");
  });

  it("forwards arbitrary className to the input", () => {
    render(<Radio aria-label="Option" className="custom-x" />);
    expect(screen.getByRole("radio").className).toContain("custom-x");
  });

  it("applies wrapperClassName to the wrapper span", () => {
    const { container } = render(
      <Radio aria-label="Option" wrapperClassName="wrapper-x" />,
    );
    expect(container.querySelector("span.wrapper-x")).not.toBeNull();
    expect(
      container.querySelector("span.wrapper-x input[type='radio']"),
    ).not.toBeNull();
  });

  // --- Uncontrolled (default) ---

  it("is unchecked by default", () => {
    render(<Radio aria-label="Option" />);
    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("respects defaultChecked", () => {
    render(<Radio aria-label="Option" defaultChecked />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("selects on click and does NOT deselect on a second click (radio semantics)", async () => {
    const user = userEvent.setup();
    render(<Radio aria-label="Option" />);
    const radio = screen.getByRole("radio");
    await user.click(radio);
    expect(radio).toBeChecked();
    await user.click(radio);
    expect(radio).toBeChecked();
  });

  it("selecting a radio deselects the checked sibling in the same name group", async () => {
    const user = userEvent.setup();
    render(<Group defaultValue="a" />);
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    expect(a).toBeChecked();
    await user.click(b);
    expect(b).toBeChecked();
    expect(a).not.toBeChecked();
  });

  // --- Keyboard (radio semantics: arrows move selection within the group) ---

  it("moves selection to the next radio with ArrowDown / ArrowRight", async () => {
    const user = userEvent.setup();
    render(<Group defaultValue="a" />);
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    const c = screen.getByRole("radio", { name: "C" });
    a.focus();
    await user.keyboard("{ArrowDown}");
    expect(b).toBeChecked();
    expect(b).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(c).toBeChecked();
    expect(c).toHaveFocus();
    expect(a).not.toBeChecked();
  });

  it("moves selection to the previous radio with ArrowUp / ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<Group defaultValue="c" />);
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    const c = screen.getByRole("radio", { name: "C" });
    c.focus();
    await user.keyboard("{ArrowUp}");
    expect(b).toBeChecked();
    expect(b).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(a).toBeChecked();
    expect(a).toHaveFocus();
    expect(c).not.toBeChecked();
  });

  it("skips disabled radios when moving with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Radio name="g" value="a" aria-label="A" defaultChecked />
        <Radio name="g" value="b" aria-label="B" disabled />
        <Radio name="g" value="c" aria-label="C" />
      </>,
    );
    screen.getByRole("radio", { name: "A" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "C" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "B" })).not.toBeChecked();
  });

  it("keeps unchecked group members out of the tab order (only the checked radio tabs)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>before</button>
        <Group defaultValue="b" />
        <button>after</button>
      </>,
    );
    await user.tab(); // → before
    expect(screen.getByRole("button", { name: "before" })).toHaveFocus();
    await user.tab(); // → the CHECKED radio (B), skipping A
    expect(screen.getByRole("radio", { name: "B" })).toHaveFocus();
    await user.tab(); // → after, skipping C
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  // --- Change callbacks ---

  it("fires native onChange with the change event when becoming checked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Radio aria-label="Option" onChange={onChange} />);
    await user.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].target.checked).toBe(true);
  });

  it("fires onCheckedChange with true when becoming checked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Radio aria-label="Option" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("radio"));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("fires onChange AND onCheckedChange together (alongside, not instead)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Radio
        aria-label="Option"
        onChange={onChange}
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  it("does not fire change callbacks when clicking an already-checked radio", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Radio
        aria-label="Option"
        defaultChecked
        onChange={onChange}
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("radio"));
    expect(onChange).not.toHaveBeenCalled();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("does not fire callbacks on the radio being deselected by a sibling (platform semantics)", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <>
        <Radio
          name="g"
          value="a"
          aria-label="A"
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
        <Radio name="g" value="b" aria-label="B" />
      </>,
    );
    await user.click(screen.getByRole("radio", { name: "B" }));
    // A was deselected, but `change` only fires on the radio BECOMING checked.
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
  });

  // --- Controlled escape hatch ---

  it("supports a controlled group via checked + onCheckedChange", async () => {
    const user = userEvent.setup();
    function ControlledGroup() {
      const [value, setValue] = React.useState("a");
      return (
        <>
          {["a", "b"].map((option) => (
            <Radio
              key={option}
              name="controlled"
              value={option}
              aria-label={option.toUpperCase()}
              checked={value === option}
              onCheckedChange={(checked) => checked && setValue(option)}
            />
          ))}
        </>
      );
    }
    render(<ControlledGroup />);
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    expect(a).toBeChecked();
    await user.click(b);
    expect(b).toBeChecked();
    expect(a).not.toBeChecked();
  });

  it("stays in sync with the checked prop across rerenders", () => {
    const { rerender } = render(
      <Radio aria-label="Option" checked={false} onCheckedChange={() => {}} />,
    );
    expect(screen.getByRole("radio")).not.toBeChecked();
    rerender(
      <Radio aria-label="Option" checked={true} onCheckedChange={() => {}} />,
    );
    expect(screen.getByRole("radio")).toBeChecked();
  });

  // --- Disabled state ---

  it("is disabled when the disabled prop is passed", () => {
    render(<Radio aria-label="Option" disabled />);
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("does not select or fire callbacks when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Radio aria-label="Option" disabled onCheckedChange={onCheckedChange} />,
    );
    const radio = screen.getByRole("radio");
    await user.click(radio);
    expect(radio).not.toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  // --- Ref (React 19: plain prop) ---

  it("forwards a ref to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Radio aria-label="Option" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("radio");
  });

  // --- Label association ---

  it("is labelled by a wrapping <label>", async () => {
    const user = userEvent.setup();
    render(
      <label>
        Mainnet
        <Radio name="network" value="mainnet" />
      </label>,
    );
    const radio = screen.getByLabelText("Mainnet");
    expect(radio).toHaveRole("radio");
    await user.click(screen.getByText("Mainnet"));
    expect(radio).toBeChecked();
  });

  it("is labelled via htmlFor / id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Radio id="opt-testnet" name="network" value="testnet" />
        <label htmlFor="opt-testnet">Testnet</label>
      </>,
    );
    const radio = screen.getByLabelText("Testnet");
    expect(radio).toHaveRole("radio");
    await user.click(screen.getByText("Testnet"));
    expect(radio).toBeChecked();
  });

  // --- Form participation ---

  it("submits the selected radio's value via FormData", () => {
    render(
      <form data-testid="form">
        <Radio name="plan" value="basic" aria-label="Basic" />
        <Radio name="plan" value="pro" aria-label="Pro" defaultChecked />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("plan")).toBe("pro");
  });

  it("submits nothing for the group when no radio is selected", () => {
    render(
      <form data-testid="form">
        <Radio name="plan" value="basic" aria-label="Basic" />
        <Radio name="plan" value="pro" aria-label="Pro" />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("plan")).toBeNull();
  });

  // --- Accessibility (axe) ---

  it("has no axe violations (fieldset group with labels)", async () => {
    const { container } = render(
      <fieldset>
        <legend>Network</legend>
        <label>
          Mainnet
          <Radio name="network" value="mainnet" defaultChecked />
        </label>
        <label>
          Testnet
          <Radio name="network" value="testnet" />
        </label>
      </fieldset>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (checked, htmlFor label)", async () => {
    const { container } = render(
      <>
        <Radio id="a11y-opt" defaultChecked />
        <label htmlFor="a11y-opt">Option</label>
      </>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(
      <label>
        Unavailable
        <Radio disabled />
      </label>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (aria-label only)", async () => {
    const { container } = render(<Radio aria-label="Select row" />);
    await checkA11y(container);
  });
});
