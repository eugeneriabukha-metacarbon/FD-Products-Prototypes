import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { FeatureCard } from "./FeatureCard";

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("FeatureCard (presentational)", () => {
  it("renders title and subtitle", () => {
    render(<FeatureCard title="Reports" subtitle="View your reports" />);
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("View your reports")).toBeInTheDocument();
  });

  it("renders leading and trailing icon slots (aria-hidden)", () => {
    const { container } = render(
      <FeatureCard
        title="Reports"
        leading={<svg data-testid="lead" />}
        trailing={<svg data-testid="trail" />}
      />,
    );
    const lead = container.querySelector('[data-slot="feature-card-leading"]');
    const trail = container.querySelector(
      '[data-slot="feature-card-trailing"]',
    );
    expect(lead).toHaveAttribute("aria-hidden", "true");
    expect(trail).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the caret by default and hides it when caret={false}", () => {
    const { container, rerender } = render(<FeatureCard title="Reports" />);
    expect(
      container.querySelector('[data-slot="feature-card-caret"]'),
    ).toBeInTheDocument();
    rerender(<FeatureCard title="Reports" caret={false} />);
    expect(
      container.querySelector('[data-slot="feature-card-caret"]'),
    ).not.toBeInTheDocument();
  });

  it("renders a non-interactive div (no link, no hover/focus classes)", () => {
    const { container } = render(<FeatureCard title="Reports" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    const root = container.querySelector('[data-slot="feature-card"]');
    expect(root?.tagName).toBe("DIV");
    expect(root?.className).not.toContain("hover:bg-card-accent");
    expect(root?.className).not.toContain("focus-visible:outline-focus");
  });

  it("forwards ref to the div root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<FeatureCard ref={ref} title="Reports" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "feature-card");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FeatureCard title="Reports" subtitle="View your reports" />,
    );
    await checkA11y(container);
  });
});

describe("FeatureCard (interactive link)", () => {
  it("renders an <a> with href, named by its title", () => {
    render(<FeatureCard href="/reports" title="Reports" />);
    const link = screen.getByRole("link", { name: /reports/i });
    expect(link).toHaveAttribute("href", "/reports");
    expect(link).toHaveAttribute("data-slot", "feature-card");
  });

  it("carries the hover accent + ADR-0010 focus ring classes", () => {
    render(<FeatureCard href="/reports" title="Reports" />);
    const cls = screen.getByRole("link").className;
    expect(cls).toContain("hover:bg-card-accent");
    expect(cls).toContain("cursor-pointer");
    expect(cls).toContain("focus-visible:outline-2");
    expect(cls).toContain("focus-visible:outline-offset-2");
    expect(cls).toContain("focus-visible:outline-solid");
    expect(cls).toContain("focus-visible:outline-focus");
  });

  it("forwards ref to the anchor root", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(<FeatureCard ref={ref} href="/reports" title="Reports" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("has no axe violations as a link", async () => {
    const { container } = render(
      <FeatureCard
        href="/reports"
        title="Reports"
        subtitle="View your reports"
        leading={<svg />}
        trailing={<svg />}
      />,
    );
    await checkA11y(container);
  });
});

describe("FeatureCard (asChild)", () => {
  it("renders the provided element as root, merging card classes + content", () => {
    render(
      <FeatureCard asChild title="Reports" subtitle="View your reports">
        <a href="/custom">extra</a>
      </FeatureCard>,
    );
    const link = screen.getByRole("link", { name: /reports/i });
    expect(link).toHaveAttribute("href", "/custom");
    expect(link.className).toContain("hover:bg-card-accent");
    // our injected content + the child's own content both present
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("extra")).toBeInTheDocument();
  });

  it("merges the child's own className", () => {
    render(
      <FeatureCard asChild title="Reports">
        <a href="/x" className="custom-cls">
          x
        </a>
      </FeatureCard>,
    );
    expect(screen.getByRole("link").className).toContain("custom-cls");
  });

  it("forwards ref to the cloned element", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <FeatureCard asChild ref={ref} title="Reports">
        <a href="/x">x</a>
      </FeatureCard>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current).toHaveAttribute("href", "/x");
  });

  it("composes onClick from both the FeatureCard and the child", async () => {
    const user = userEvent.setup();
    const cardClick = vi.fn();
    const childClick = vi.fn();
    render(
      <FeatureCard asChild title="Reports" onClick={cardClick}>
        <a href="/x" onClick={childClick}>
          x
        </a>
      </FeatureCard>,
    );
    await user.click(screen.getByRole("link"));
    expect(cardClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to both the outer ref and the child's own ref", () => {
    const outerRef = React.createRef<HTMLElement>();
    const childRef = React.createRef<HTMLAnchorElement>();
    render(
      <FeatureCard asChild ref={outerRef} title="Reports">
        <a href="/x" ref={childRef}>
          x
        </a>
      </FeatureCard>,
    );
    expect(outerRef.current).toBeInstanceOf(HTMLAnchorElement);
    expect(childRef.current).toBe(outerRef.current);
  });

  it("throws when asChild has no valid element child", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <FeatureCard asChild title="Reports">
          just text
        </FeatureCard>,
      ),
    ).toThrow(/asChild/);
    spy.mockRestore();
  });

  it("has no axe violations as asChild", async () => {
    const { container } = render(
      <FeatureCard asChild title="Reports" subtitle="View your reports">
        <a href="/x" />
      </FeatureCard>,
    );
    await checkA11y(container);
  });
});
