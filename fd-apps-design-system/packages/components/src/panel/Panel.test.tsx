import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Button } from "../button";
import { Panel } from "./Panel";

// Mirrors the sibling suites: `region` is a page-level landmark best-practice
// rule irrelevant to an isolated component in a unit test, so it is disabled;
// all component-scoped rules (roles, ARIA, nesting, contrast, names) stay on.
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

describe("Panel.Root", () => {
  it("renders a card with its children", () => {
    render(
      <Panel.Root>
        <div>content</div>
      </Panel.Root>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("is not a region landmark when it has no accessible name", () => {
    render(
      <Panel.Root>
        <div>content</div>
      </Panel.Root>,
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("is a named region when given aria-label", () => {
    render(
      <Panel.Root aria-label="Details">
        <div>content</div>
      </Panel.Root>,
    );
    expect(screen.getByRole("region", { name: "Details" })).toBeInTheDocument();
  });

  it("forwards ref to the card element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Panel.Root ref={ref}>x</Panel.Root>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "panel");
  });
});

describe("Panel.Header", () => {
  it("renders the title and wires it as the region's accessible name", () => {
    render(
      <Panel.Root>
        <Panel.Header title="Account" />
      </Panel.Root>,
    );
    expect(screen.getByRole("region", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("shows the description only when provided", () => {
    const { rerender } = render(
      <Panel.Root>
        <Panel.Header title="T" />
      </Panel.Root>,
    );
    expect(screen.queryByText("Some description")).not.toBeInTheDocument();
    rerender(
      <Panel.Root>
        <Panel.Header title="T" description="Some description" />
      </Panel.Root>,
    );
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders the icon only when provided", () => {
    const { rerender } = render(
      <Panel.Root>
        <Panel.Header title="T" />
      </Panel.Root>,
    );
    expect(screen.queryByTestId("hdr-icon")).not.toBeInTheDocument();
    rerender(
      <Panel.Root>
        <Panel.Header title="T" icon={<svg data-testid="hdr-icon" />} />
      </Panel.Root>,
    );
    expect(screen.getByTestId("hdr-icon")).toBeInTheDocument();
  });

  it("shows the close button by default and hides it with showClose={false}", () => {
    const { rerender } = render(
      <Panel.Root>
        <Panel.Header title="T" />
      </Panel.Root>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    rerender(
      <Panel.Root>
        <Panel.Header title="T" showClose={false} />
      </Panel.Root>,
    );
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("fires onClose on click and on keyboard activation", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Panel.Root>
        <Panel.Header title="T" onClose={onClose} />
      </Panel.Root>,
    );
    const close = screen.getByRole("button", { name: "Close" });
    await user.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    close.focus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(2);
    close.focus();
    await user.keyboard(" ");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("does not throw when onClose is omitted and the X is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Panel.Root>
        <Panel.Header title="T" />
      </Panel.Root>,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("has no axe violations with a full header", async () => {
    const { container } = render(
      <Panel.Root>
        <Panel.Header
          title="Account"
          description="Manage your account."
          icon={<svg aria-hidden="true" />}
        />
      </Panel.Root>,
    );
    await checkA11y(container);
  });
});

describe("Panel.Body / Panel.Footer", () => {
  it("renders body content and forwards its ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Panel.Root>
        <Panel.Body ref={ref}>Body content</Panel.Body>
      </Panel.Root>,
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(ref.current).toHaveAttribute("data-slot", "panel-body");
  });

  it("renders footer buttons and forwards its ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Panel.Root>
        <Panel.Footer ref={ref}>
          <Button>Confirm</Button>
          <Button variation="secondary">Cancel</Button>
        </Panel.Footer>
      </Panel.Root>,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(ref.current).toHaveAttribute("data-slot", "panel-footer");
  });

  it("has no axe violations for a full panel", async () => {
    const { container } = render(
      <Panel.Root>
        <Panel.Header title="Account" description="Manage your account." />
        <Panel.Body>Body</Panel.Body>
        <Panel.Footer>
          <Button>Confirm</Button>
          <Button variation="secondary">Cancel</Button>
        </Panel.Footer>
      </Panel.Root>,
    );
    await checkA11y(container);
  });
});
