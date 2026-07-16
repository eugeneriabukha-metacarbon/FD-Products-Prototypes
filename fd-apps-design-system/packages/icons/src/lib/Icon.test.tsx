import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, it, expect } from "vitest";
import { Icon } from "./Icon";

const BODY = '<path d="M0 0h32v32H0z" fill="#8C8C8C"/>';

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

describe("Icon base", () => {
  it("renders an <svg> with the injected body", () => {
    const { container } = render(<Icon body={BODY} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector("path")).toBeInTheDocument();
  });

  it("defaults size to 24 and keeps viewBox 0 0 32 32", () => {
    const { container } = render(<Icon body={BODY} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32");
  });

  it("size prop sets width and height", () => {
    const { container } = render(<Icon body={BODY} size={40} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
  });

  it("is aria-hidden with no title", () => {
    const { container } = render(<Icon body={BODY} />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("title yields role=img and a <title> element", () => {
    render(<Icon body={BODY} title="Bitcoin" />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(screen.getByText("Bitcoin").tagName.toLowerCase()).toBe("title");
  });

  it("forwards ref to the svg and spreads className", () => {
    const ref = { current: null as SVGSVGElement | null };
    const { container } = render(<Icon body={BODY} ref={ref} className="x" />);
    expect(ref.current).toBe(container.querySelector("svg"));
    expect(container.querySelector("svg")).toHaveClass("x");
  });

  it("has no axe violations with a title", async () => {
    const { container } = render(<Icon body={BODY} title="Bitcoin" />);
    await checkA11y(container);
  });

  it("has no axe violations when decorative (aria-hidden)", async () => {
    const { container } = render(<Icon body={BODY} />);
    await checkA11y(container);
  });
});
