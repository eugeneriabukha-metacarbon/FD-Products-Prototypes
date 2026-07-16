import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { SelectableFeatureCard } from "./SelectableFeatureCard";

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("SelectableFeatureCard", () => {
  it("renders title and subtitle", () => {
    render(<SelectableFeatureCard title="Wallet" subtitle="Primary account" />);
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Primary account")).toBeInTheDocument();
  });

  it("renders a radio input named by its title", () => {
    render(<SelectableFeatureCard title="Wallet" />);
    expect(screen.getByRole("radio", { name: /wallet/i })).toBeInTheDocument();
  });

  it("selects the radio when the row is clicked (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<SelectableFeatureCard title="Wallet" subtitle="Primary account" />);
    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio.checked).toBe(false);
    await user.click(screen.getByText("Primary account"));
    expect(radio.checked).toBe(true);
  });

  it("fires onCheckedChange with true on select", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <SelectableFeatureCard
        title="Wallet"
        onCheckedChange={onCheckedChange}
      />,
    );
    await user.click(screen.getByRole("radio"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("groups cards that share a name (single selection)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SelectableFeatureCard name="acct" value="a" title="Account A" />
        <SelectableFeatureCard name="acct" value="b" title="Account B" />
      </>,
    );
    const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
    await user.click(screen.getByText("Account A"));
    expect(a.checked).toBe(true);
    await user.click(screen.getByText("Account B"));
    expect(a.checked).toBe(false);
    expect(b.checked).toBe(true);
  });

  it("does not render a bottom slot in the basic variation", () => {
    const { container } = render(
      <SelectableFeatureCard title="Wallet">body</SelectableFeatureCard>,
    );
    expect(
      container.querySelector('[data-slot="selectable-feature-card-bottom"]'),
    ).not.toBeInTheDocument();
  });

  it("renders the editable bottom slot with reveal-on-checked classes", () => {
    const { container } = render(
      <SelectableFeatureCard title="Wallet" variation="editable">
        <span>edit me</span>
      </SelectableFeatureCard>,
    );
    const bottom = container.querySelector(
      '[data-slot="selectable-feature-card-bottom"]',
    );
    expect(bottom).toBeInTheDocument();
    expect(screen.getByText("edit me")).toBeInTheDocument();
    expect(bottom?.className).toContain("hidden");
    expect(bottom?.className).toContain("group-has-[:checked]:block");
  });

  it("marks the selected state with the brand border utility", () => {
    const { container } = render(<SelectableFeatureCard title="Wallet" />);
    const root = container.querySelector(
      '[data-slot="selectable-feature-card"]',
    );
    expect(root?.className).toContain(
      "has-[:checked]:border-brand-primary-border",
    );
  });

  it("renders a decorative trailing slot (aria-hidden)", () => {
    const { container } = render(
      <SelectableFeatureCard
        title="Wallet"
        trailing={<svg data-testid="t" />}
      />,
    );
    const trailing = container.querySelector(
      '[data-slot="selectable-feature-card-trailing"]',
    );
    expect(trailing).toHaveAttribute("aria-hidden", "true");
  });

  it("passes disabled through and does not select on click", async () => {
    const user = userEvent.setup();
    render(<SelectableFeatureCard title="Wallet" disabled />);
    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio).toBeDisabled();
    await user.click(screen.getByText("Wallet"));
    expect(radio.checked).toBe(false);
  });

  it("forwards ref to the radio input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SelectableFeatureCard ref={ref} title="Wallet" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute("type", "radio");
  });

  it("reflects a controlled checked prop", () => {
    render(
      <SelectableFeatureCard title="Wallet" checked onChange={() => {}} />,
    );
    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  // Native radios only fire `change` on BECOMING checked, so a controlled card
  // is driven by clicking an *unchecked* sibling — mirrors Radio's own
  // "supports a controlled group" test (Radio.test.tsx). Clicking an
  // already-checked card fires nothing (Radio: "does not fire change callbacks
  // when clicking an already-checked radio").
  it("supports a controlled group via checked + onCheckedChange", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState("a");
      return (
        <>
          {(["a", "b"] as const).map((option) => (
            <SelectableFeatureCard
              key={option}
              name="controlled"
              value={option}
              title={`Account ${option.toUpperCase()}`}
              checked={value === option}
              onCheckedChange={(checked) => checked && setValue(option)}
            />
          ))}
        </>
      );
    }
    render(<Controlled />);
    const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(a.checked).toBe(true);
    await user.click(screen.getByText("Account B"));
    expect(b.checked).toBe(true);
    expect(a.checked).toBe(false);
  });

  it("has no axe violations (basic)", async () => {
    const { container } = render(
      <SelectableFeatureCard title="Wallet" subtitle="Primary account" />,
    );
    await checkA11y(container);
  });

  it("has no axe violations (editable)", async () => {
    const { container } = render(
      <SelectableFeatureCard title="Wallet" variation="editable">
        <p>Editable content</p>
      </SelectableFeatureCard>,
    );
    await checkA11y(container);
  });
});
