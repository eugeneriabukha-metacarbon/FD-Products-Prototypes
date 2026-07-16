import * as React from "react";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

import { PropertyGridContent } from "./PropertyGridContent";
import { PropertyGridItem } from "./PropertyGridItem";
import { PropertyGridTitle } from "./PropertyGridTitle";

// --- Accessibility helper (mirrors the Input / TokenInput / TableCell suites) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("PropertyGridTitle", () => {
  it("renders the label with the muted tone and left alignment", () => {
    const { container } = render(
      <PropertyGridTitle>Network</PropertyGridTitle>,
    );
    const cell = container.querySelector('[data-slot="property-grid-title"]')!;
    expect(cell).not.toBeNull();
    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(cell.className).toContain("text-card-foreground-muted");
    expect(cell.className).toContain("justify-start");
  });

  it("renders leading/trailing only when provided", () => {
    const { container, rerender } = render(
      <PropertyGridTitle>Network</PropertyGridTitle>,
    );
    expect(
      container.querySelector('[data-slot="property-grid-title-leading"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="property-grid-title-trailing"]'),
    ).toBeNull();
    rerender(
      <PropertyGridTitle
        leading={<span data-testid="lead">L</span>}
        trailing={<span data-testid="trail">T</span>}
      >
        Network
      </PropertyGridTitle>,
    );
    expect(
      container.querySelector('[data-slot="property-grid-title-leading"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="property-grid-title-trailing"]'),
    ).not.toBeNull();
  });

  it("forwards ref to the cell root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<PropertyGridTitle ref={ref}>Network</PropertyGridTitle>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("property-grid-title");
  });
});

describe("PropertyGridContent", () => {
  it("renders the value with the foreground tone and right alignment", () => {
    const { container } = render(
      <PropertyGridContent>Ethereum</PropertyGridContent>,
    );
    const cell = container.querySelector(
      '[data-slot="property-grid-content"]',
    )!;
    expect(cell).not.toBeNull();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(cell.className).toContain("text-card-foreground");
    expect(cell.className).toContain("justify-end");
  });

  it("renders leading/trailing only when provided", () => {
    const { container } = render(
      <PropertyGridContent trailing={<span data-testid="copy">C</span>}>
        Ethereum
      </PropertyGridContent>,
    );
    expect(
      container.querySelector('[data-slot="property-grid-content-leading"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="property-grid-content-trailing"]'),
    ).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <PropertyGridContent trailing={<span aria-hidden="true">·</span>}>
        Ethereum
      </PropertyGridContent>,
    );
    await checkA11y(container);
  });
});

describe("PropertyGridItem", () => {
  const row = (last?: boolean) => (
    <PropertyGridItem last={last}>
      <PropertyGridTitle>Network</PropertyGridTitle>
      <PropertyGridContent>Ethereum</PropertyGridContent>
    </PropertyGridItem>
  );

  it("renders its title and content children in a 2-column grid", () => {
    const { container } = render(row());
    const item = container.querySelector('[data-slot="property-grid-item"]')!;
    expect(item).not.toBeNull();
    expect(item.className).toContain("grid-cols-2");
    expect(
      item.querySelector('[data-slot="property-grid-title"]'),
    ).not.toBeNull();
    expect(
      item.querySelector('[data-slot="property-grid-content"]'),
    ).not.toBeNull();
    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });

  it("draws the divider by default and omits it when last", () => {
    const { container, rerender } = render(row(false));
    const item = () =>
      container.querySelector('[data-slot="property-grid-item"]')!;
    expect(item().className).toContain("border-b");
    rerender(row(true));
    expect(item().className).not.toContain("border-b");
  });

  it("forwards ref to the root element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <PropertyGridItem ref={ref}>
        <PropertyGridTitle>Network</PropertyGridTitle>
        <PropertyGridContent>Ethereum</PropertyGridContent>
      </PropertyGridItem>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("property-grid-item");
  });

  it("has no axe violations", async () => {
    const { container } = render(row());
    await checkA11y(container);
  });
});
