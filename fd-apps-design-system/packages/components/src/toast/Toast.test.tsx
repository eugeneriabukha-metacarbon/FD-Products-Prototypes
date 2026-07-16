import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Toast } from "./Toast";

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("Toast", () => {
  it("renders the message", () => {
    render(<Toast>Saved successfully.</Toast>);
    expect(screen.getByText("Saved successfully.")).toBeInTheDocument();
  });

  it("is a polite status region for the success variation", () => {
    render(<Toast variation="success">Saved.</Toast>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("is an assertive alert region for the error variation", () => {
    render(<Toast variation="error">Failed.</Toast>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("marks the leading status icon as decorative (aria-hidden)", () => {
    const { container } = render(<Toast variation="error">Failed.</Toast>);
    const icon = container.querySelector('[data-slot="toast-icon"]');
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders no close button when onClose is omitted", () => {
    render(<Toast>Saved.</Toast>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a labelled close button that calls onClose when clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast onClose={onClose}>Saved.</Toast>);
    const button = screen.getByRole("button", { name: /dismiss/i });
    await user.click(button);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("close button is keyboard-operable", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast onClose={onClose}>Saved.</Toast>);
    await user.tab();
    expect(screen.getByRole("button", { name: /dismiss/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the root element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Toast ref={ref}>Saved.</Toast>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "toast");
  });

  it("has no axe violations (success, no close)", async () => {
    const { container } = render(<Toast variation="success">Saved.</Toast>);
    await checkA11y(container);
  });

  it("has no axe violations (error, with close)", async () => {
    const { container } = render(
      <Toast variation="error" onClose={() => {}}>
        Failed.
      </Toast>,
    );
    await checkA11y(container);
  });
});
