import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Button } from "./Button";

// --- Accessibility helper (mirrors the applypass reference suite) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("Button", () => {
  // --- Rendering ---

  it("renders with data-slot=button", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  it("renders children as text", () => {
    render(<Button>Hello</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Hello");
  });

  it("renders leftSlot content", () => {
    render(<Button leftSlot={<span data-testid="left-icon" />}>Label</Button>);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("renders rightSlot content", () => {
    render(
      <Button rightSlot={<span data-testid="right-icon" />}>Label</Button>,
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("renders the child icon when iconOnly (children is the icon)", () => {
    // FD API difference vs applypass: iconOnly renders `children` as the icon,
    // not `leftSlot`. Accessible name comes from aria-label.
    render(
      <Button iconOnly aria-label="Icon action">
        <span data-testid="icon" />
      </Button>,
    );
    expect(
      screen.getByRole("button", { name: "Icon action" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("does not render text children when iconOnly", () => {
    render(
      <Button iconOnly aria-label="Only icon">
        <span data-testid="icon" />
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveTextContent("");
  });

  // --- Variations / sizes ---

  it("defaults to variation=primary, size=md", () => {
    render(<Button>Default</Button>);
    // h-10 == md height; primary uses the primary background token utility.
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("h-10");
    expect(btn.className).toContain("bg-button-primary-background");
  });

  it("applies the requested variation and size utilities", () => {
    render(
      <Button variation="destructive" size="sm">
        Danger
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-button-destructive-background");
    expect(btn.className).toContain("h-8");
  });

  it("applies size=md (40px / h-10)", () => {
    render(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button").className).toContain("h-10");
  });

  it("applies size=lg (48px / h-12)", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("h-12");
  });

  it("icon-only lg is a 48px square (h-12 / w-12)", () => {
    render(
      <Button size="lg" iconOnly aria-label="Large icon">
        <span data-testid="icon" />
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("h-12");
    expect(btn.className).toContain("w-12");
  });

  it("forwards arbitrary className", () => {
    render(<Button className="custom-x">Label</Button>);
    expect(screen.getByRole("button").className).toContain("custom-x");
  });

  // --- Disabled state ---

  it("is disabled when disabled prop is passed", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  // --- Loading state ---

  it("stays active (no native `disabled` attribute) when loading", () => {
    // Loading keeps the active styling — it must NOT get the disabled attribute
    // (which would apply the greyed-out disabled look).
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("reports aria-disabled when loading (active look, not actionable)", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
  });

  it("sets aria-busy when loading", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("sets data-loading when loading", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-loading", "true");
  });

  it("hides leftSlot and shows spinner when loading", () => {
    render(
      <Button loading leftSlot={<span data-testid="left-icon" />}>
        Label
      </Button>,
    );
    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
  });

  it("KEEPS rightSlot visible when loading (FD/Figma behavior)", () => {
    // Deliberate divergence from applypass, which hides rightSlot when loading.
    // The Figma loading variant is `◌ Button ❖` — spinner replaces the left
    // icon only; the trailing icon persists.
    render(
      <Button loading rightSlot={<span data-testid="right-icon" />}>
        Label
      </Button>,
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("does not fire onClick when loading (blocked, despite active look)", () => {
    // `pointer-events-none` blocks the mouse (userEvent would throw on it), so
    // dispatch the raw event: the click guard must still swallow it.
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Click me
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  // --- Interaction ---

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the button element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Label</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // --- asChild ---

  it("renders as the child element when asChild (anchor, not button)", () => {
    render(
      <Button asChild variation="brand">
        <a href="/target">Go</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/target");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("throws if asChild has no valid element child", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Button asChild>plain text</Button>)).toThrow(
      /asChild.*requires a single React element/i,
    );
    spy.mockRestore();
  });

  // --- Accessibility (axe) ---

  it("has no axe violations (default)", async () => {
    const { container } = render(<Button>Click me</Button>);
    await checkA11y(container);
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Button disabled>Click me</Button>);
    await checkA11y(container);
  });

  it("has no axe violations (secondary — SVG border wrapper)", async () => {
    const { container } = render(
      <Button variation="secondary">Click me</Button>,
    );
    await checkA11y(container);
  });

  it("has no axe violations (icon-only with aria-label)", async () => {
    const { container } = render(
      <Button iconOnly aria-label="Close dialog">
        <span />
      </Button>,
    );
    await checkA11y(container);
  });
});
