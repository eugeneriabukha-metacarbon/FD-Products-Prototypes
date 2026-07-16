import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import * as React from "react";
import { describe, it, expect, vi } from "vitest";

import { Checkbox } from "./Checkbox";

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

describe("Checkbox", () => {
  // --- Rendering ---

  it("renders a real native checkbox input", () => {
    render(<Checkbox aria-label="Accept" />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toBeInstanceOf(HTMLInputElement);
    expect(box).toHaveAttribute("type", "checkbox");
  });

  it("renders with data-slot=checkbox on the input", () => {
    render(<Checkbox aria-label="Accept" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-slot",
      "checkbox",
    );
  });

  it("renders the decorative ✓ indicator (aria-hidden, peer-revealed)", () => {
    const { container } = render(<Checkbox aria-label="Accept" />);
    const indicator = container.querySelector(
      '[data-slot="checkbox-indicator"]',
    );
    expect(indicator).not.toBeNull();
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    // SVG className is an SVGAnimatedString — read the attribute instead.
    expect(indicator?.getAttribute("class")).toContain("peer-checked:visible");
  });

  it("applies the state × selected token utilities from the Figma set", () => {
    render(<Checkbox aria-label="Accept" />);
    const cls = screen.getByRole("checkbox").className;
    // Box: 20×20, radius/xs
    expect(cls).toContain("size-5");
    expect(cls).toContain("rounded-xs");
    // default / selected / disabled branches (semantic tokens only)
    expect(cls).toContain("bg-background");
    expect(cls).toContain("checked:bg-brand-primary-background");
    expect(cls).toContain("checked:hover:bg-brand-primary-accent");
    expect(cls).toContain("disabled:border-border-muted");
    // focused: shared --focus ring
    expect(cls).toContain("focus-visible:outline-focus");
  });

  it("forwards arbitrary className to the input", () => {
    render(<Checkbox aria-label="Accept" className="custom-x" />);
    expect(screen.getByRole("checkbox").className).toContain("custom-x");
  });

  it("applies wrapperClassName to the wrapper span", () => {
    const { container } = render(
      <Checkbox aria-label="Accept" wrapperClassName="wrapper-x" />,
    );
    expect(container.querySelector("span.wrapper-x")).not.toBeNull();
    expect(
      container.querySelector("span.wrapper-x input[type='checkbox']"),
    ).not.toBeNull();
  });

  // --- Uncontrolled (default) ---

  it("is unchecked by default", () => {
    render(<Checkbox aria-label="Accept" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("respects defaultChecked", () => {
    render(<Checkbox aria-label="Accept" defaultChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles on click (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" />);
    const box = screen.getByRole("checkbox");
    await user.click(box);
    expect(box).toBeChecked();
    await user.click(box);
    expect(box).not.toBeChecked();
  });

  it("toggles with the Space key", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" />);
    const box = screen.getByRole("checkbox");
    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard(" ");
    expect(box).toBeChecked();
    await user.keyboard(" ");
    expect(box).not.toBeChecked();
  });

  // --- Change callbacks ---

  it("fires native onChange with the change event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="Accept" onChange={onChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].target.checked).toBe(true);
  });

  it("fires onCheckedChange with the next boolean state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox");
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("fires onChange AND onCheckedChange together (alongside, not instead)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        aria-label="Accept"
        onChange={onChange}
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  // --- Controlled escape hatch ---

  it("supports controlled usage via checked + onCheckedChange", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return (
        <Checkbox
          aria-label="Accept"
          checked={checked}
          onCheckedChange={setChecked}
        />
      );
    }
    render(<Controlled />);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    await user.click(box);
    expect(box).not.toBeChecked();
  });

  it("stays in sync with the checked prop across rerenders", () => {
    const { rerender } = render(
      <Checkbox
        aria-label="Accept"
        checked={false}
        onCheckedChange={() => {}}
      />,
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    rerender(
      <Checkbox
        aria-label="Accept"
        checked={true}
        onCheckedChange={() => {}}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  // --- Disabled state ---

  it("is disabled when the disabled prop is passed", () => {
    render(<Checkbox aria-label="Accept" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("does not toggle or fire callbacks when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        aria-label="Accept"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const box = screen.getByRole("checkbox");
    await user.click(box);
    expect(box).not.toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  // --- Ref (React 19: plain prop) ---

  it("forwards a ref to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox aria-label="Accept" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("allows setting the native indeterminate flag via the ref", () => {
    // The FD Figma set has no indeterminate variant; the escape hatch is the
    // platform one — the DOM property, reachable through the ref.
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox aria-label="Accept" ref={ref} />);
    ref.current!.indeterminate = true;
    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
  });

  // --- Label association ---

  it("is labelled by a wrapping <label>", async () => {
    const user = userEvent.setup();
    render(
      <label>
        Remember me
        <Checkbox />
      </label>,
    );
    const box = screen.getByLabelText("Remember me");
    expect(box).toHaveRole("checkbox");
    await user.click(screen.getByText("Remember me"));
    expect(box).toBeChecked();
  });

  it("is labelled via htmlFor / id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );
    const box = screen.getByLabelText("Accept terms");
    expect(box).toHaveRole("checkbox");
    await user.click(screen.getByText("Accept terms"));
    expect(box).toBeChecked();
  });

  it("participates in forms via name/value", () => {
    render(
      <form data-testid="form">
        <Checkbox
          aria-label="Accept"
          name="accept"
          value="yes"
          defaultChecked
        />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("accept")).toBe("yes");
  });

  // --- Accessibility (axe) ---

  it("has no axe violations (unchecked, wrapped label)", async () => {
    const { container } = render(
      <label>
        Remember me
        <Checkbox />
      </label>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (checked, htmlFor label)", async () => {
    const { container } = render(
      <>
        <Checkbox id="a11y-terms" defaultChecked />
        <label htmlFor="a11y-terms">Accept terms</label>
      </>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(
      <label>
        Unavailable
        <Checkbox disabled />
      </label>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (aria-label only)", async () => {
    const { container } = render(<Checkbox aria-label="Select row" />);
    await checkA11y(container);
  });
});
