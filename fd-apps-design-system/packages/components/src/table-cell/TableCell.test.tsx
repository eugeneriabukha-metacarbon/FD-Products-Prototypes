import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

import { CellText } from "./CellText";
import { TableCell } from "./TableCell";

// --- Accessibility helper (mirrors the Input / TokenInput suites) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("CellText", () => {
  it("renders the label", () => {
    render(<CellText label="Wallet balance" />);
    expect(screen.getByText("Wallet balance")).toBeInTheDocument();
  });

  it("renders meta segments joined by (n-1) separators", () => {
    const { container } = render(
      <CellText label="Label" meta={["a", "b", "c"]} />,
    );
    const metaRow = container.querySelector('[data-slot="cell-text-meta"]');
    expect(metaRow).not.toBeNull();
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
    const separators = container.querySelectorAll(
      '[data-slot="cell-text-meta"] [aria-hidden="true"]',
    );
    expect(separators).toHaveLength(2);
  });

  it("omits the meta row when meta is absent or empty", () => {
    const { container, rerender } = render(<CellText label="Label" />);
    expect(container.querySelector('[data-slot="cell-text-meta"]')).toBeNull();
    rerender(<CellText label="Label" meta={[]} />);
    expect(container.querySelector('[data-slot="cell-text-meta"]')).toBeNull();
  });

  it("wires label + meta to recolor on the parent group's focus", () => {
    const { container } = render(<CellText label="Label" meta={["a"]} />);
    const label = container.querySelector('[data-slot="cell-text-label"]')!;
    const metaRow = container.querySelector('[data-slot="cell-text-meta"]')!;
    expect(label.className).toContain(
      "group-focus-visible:text-card-brand-foreground",
    );
    expect(metaRow.className).toContain(
      "group-focus-visible:text-card-brand-foreground-muted",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<CellText label="Label" meta={["x", "y"]} />);
    await checkA11y(container);
  });
});

describe("TableCell", () => {
  it("renders leading, middle, and trailing slots", () => {
    const { container } = render(
      <TableCell
        leading={<span data-testid="lead">L</span>}
        trailing={<button data-testid="trail">T</button>}
      >
        <span data-testid="mid">M</span>
      </TableCell>,
    );
    expect(
      container.querySelector('[data-slot="table-cell-leading"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="table-cell-middle"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="table-cell-trailing"]'),
    ).not.toBeNull();
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("mid")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });

  it("omits slot wrappers when their content is absent", () => {
    const { container } = render(<TableCell>only middle</TableCell>);
    expect(
      container.querySelector('[data-slot="table-cell-leading"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="table-cell-trailing"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="table-cell-middle"]'),
    ).not.toBeNull();
  });

  it("reflects the active prop as data-state and omits it otherwise", () => {
    const { container, rerender } = render(<TableCell>x</TableCell>);
    const cell = () => container.querySelector('[data-slot="table-cell"]')!;
    expect(cell().getAttribute("data-state")).toBeNull();
    rerender(<TableCell active>x</TableCell>);
    expect(cell().getAttribute("data-state")).toBe("active");
  });

  it("draws the divider by default and omits it when last", () => {
    const { container, rerender } = render(<TableCell>x</TableCell>);
    const cell = () => container.querySelector('[data-slot="table-cell"]')!;
    expect(cell().className).toContain("border-b");
    rerender(<TableCell last>x</TableCell>);
    expect(cell().className).not.toContain("border-b");
  });

  it("wires the brand-accent treatment to keyboard focus (interactive cells)", () => {
    const { container } = render(<TableCell>x</TableCell>);
    const cell = container.querySelector('[data-slot="table-cell"]')!;
    expect(cell.className).toContain("focus-visible:bg-card-brand-accent");
  });

  it("asChild onto a button is focusable and keeps cell styling", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TableCell asChild>
        <button type="button">
          <CellText label="Open details" />
        </button>
      </TableCell>,
    );
    const cell = container.querySelector('[data-slot="table-cell"]')!;
    expect(cell.tagName).toBe("BUTTON");
    expect(cell.className).toContain("focus-visible:bg-card-brand-accent");
    await user.tab();
    expect(cell).toHaveFocus();
  });

  it("supports asChild: renders the child as root with injected slots", () => {
    const { container } = render(
      <TableCell asChild leading={<span data-testid="lead">L</span>}>
        <a href="/row" className="custom">
          middle content
        </a>
      </TableCell>,
    );
    const anchor = container.querySelector("a")!;
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute("href")).toBe("/row");
    expect(anchor.getAttribute("data-slot")).toBe("table-cell");
    expect(anchor.className).toContain("custom");
    expect(anchor.className).toContain("h-14");
    expect(
      anchor.querySelector('[data-slot="table-cell-leading"]'),
    ).not.toBeNull();
    expect(screen.getByText("middle content")).toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<TableCell ref={ref}>x</TableCell>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("table-cell");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <TableCell leading={<span>L</span>}>
        <CellText label="Label" meta={["a", "b"]} />
      </TableCell>,
    );
    await checkA11y(container);
  });
});
