import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import * as React from "react";
import { describe, it, expect, vi } from "vitest";

import { Switch } from "./Switch";

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

describe("Switch", () => {
  // --- Rendering ---

  it("renders a real native checkbox input with role=switch", () => {
    render(<Switch aria-label="Wifi" />);
    const toggle = screen.getByRole("switch", { name: "Wifi" });
    expect(toggle).toBeInstanceOf(HTMLInputElement);
    expect(toggle).toHaveAttribute("type", "checkbox");
    expect(toggle).toHaveAttribute("role", "switch");
  });

  it("renders with data-slot=switch on the input", () => {
    render(<Switch aria-label="Wifi" />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-slot", "switch");
  });

  it("renders the decorative sliding thumb (aria-hidden, peer-driven)", () => {
    const { container } = render(<Switch aria-label="Wifi" />);
    const thumb = container.querySelector('[data-slot="switch-thumb"]');
    expect(thumb).not.toBeNull();
    expect(thumb).toHaveAttribute("aria-hidden", "true");
    expect(thumb?.getAttribute("class")).toContain("peer-checked:translate-x");
  });

  it("applies the state × selected token utilities from the Figma set", () => {
    render(<Switch aria-label="Wifi" />);
    const cls = screen.getByRole("switch").className;
    // Track: 56×24, fully round
    expect(cls).toContain("h-6");
    expect(cls).toContain("w-14");
    expect(cls).toContain("rounded-full");
    // off / on / disabled branches (semantic tokens only)
    expect(cls).toContain("bg-button-secondary-background");
    expect(cls).toContain("checked:bg-brand-primary-background");
    expect(cls).toContain("checked:hover:bg-brand-primary-accent");
    expect(cls).toContain("checked:disabled:bg-button-primary-muted");
    expect(cls).toContain("disabled:border-button-secondary-border-muted");
    // focused: shared --focus ring
    expect(cls).toContain("focus-visible:outline-focus");
  });

  it("forwards arbitrary className to the input", () => {
    render(<Switch aria-label="Wifi" className="custom-x" />);
    expect(screen.getByRole("switch").className).toContain("custom-x");
  });

  it("applies wrapperClassName to the wrapper span", () => {
    const { container } = render(
      <Switch aria-label="Wifi" wrapperClassName="wrapper-x" />,
    );
    expect(container.querySelector("span.wrapper-x")).not.toBeNull();
    expect(
      container.querySelector("span.wrapper-x input[type='checkbox']"),
    ).not.toBeNull();
  });

  // --- Uncontrolled (default) ---

  it("is off by default", () => {
    render(<Switch aria-label="Wifi" />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("respects defaultChecked", () => {
    render(<Switch aria-label="Wifi" defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles on click (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Wifi" />);
    const toggle = screen.getByRole("switch");
    await user.click(toggle);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("toggles with the Space key", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Wifi" />);
    const toggle = screen.getByRole("switch");
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(toggle).toBeChecked();
    await user.keyboard(" ");
    expect(toggle).not.toBeChecked();
  });

  // --- Change callbacks ---

  it("fires native onChange with the change event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="Wifi" onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].target.checked).toBe(true);
  });

  it("fires onCheckedChange with the next boolean state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wifi" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole("switch");
    await user.click(toggle);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.click(toggle);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("fires onChange AND onCheckedChange together (alongside, not instead)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Switch
        aria-label="Wifi"
        onChange={onChange}
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  // --- Controlled escape hatch ---

  it("supports controlled usage via checked + onCheckedChange", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return (
        <Switch
          aria-label="Wifi"
          checked={checked}
          onCheckedChange={setChecked}
        />
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole("switch");
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("stays in sync with the checked prop across rerenders", () => {
    const { rerender } = render(
      <Switch aria-label="Wifi" checked={false} onCheckedChange={() => {}} />,
    );
    expect(screen.getByRole("switch")).not.toBeChecked();
    rerender(
      <Switch aria-label="Wifi" checked={true} onCheckedChange={() => {}} />,
    );
    expect(screen.getByRole("switch")).toBeChecked();
  });

  // --- Disabled state ---

  it("is disabled when the disabled prop is passed", () => {
    render(<Switch aria-label="Wifi" disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("does not toggle or fire callbacks when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch aria-label="Wifi" disabled onCheckedChange={onCheckedChange} />,
    );
    const toggle = screen.getByRole("switch");
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  // --- Ref (React 19: plain prop) ---

  it("forwards a ref to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Switch aria-label="Wifi" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });

  // --- Label association ---

  it("is labelled by a wrapping <label>", async () => {
    const user = userEvent.setup();
    render(
      <label>
        Enable notifications
        <Switch />
      </label>,
    );
    const toggle = screen.getByLabelText("Enable notifications");
    expect(toggle).toHaveRole("switch");
    await user.click(screen.getByText("Enable notifications"));
    expect(toggle).toBeChecked();
  });

  it("is labelled via htmlFor / id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Switch id="notifications" />
        <label htmlFor="notifications">Enable notifications</label>
      </>,
    );
    const toggle = screen.getByLabelText("Enable notifications");
    expect(toggle).toHaveRole("switch");
    await user.click(screen.getByText("Enable notifications"));
    expect(toggle).toBeChecked();
  });

  it("participates in forms via name/value", () => {
    render(
      <form data-testid="form">
        <Switch aria-label="Wifi" name="wifi" value="on" defaultChecked />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("wifi")).toBe("on");
  });

  // --- Accessibility (axe) ---

  it("has no axe violations (off, wrapped label)", async () => {
    const { container } = render(
      <label>
        Enable notifications
        <Switch />
      </label>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (on, htmlFor label)", async () => {
    const { container } = render(
      <>
        <Switch id="a11y-wifi" defaultChecked />
        <label htmlFor="a11y-wifi">Wifi</label>
      </>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(
      <label>
        Unavailable
        <Switch disabled />
      </label>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (aria-label only)", async () => {
    const { container } = render(<Switch aria-label="Airplane mode" />);
    await checkA11y(container);
  });
});
