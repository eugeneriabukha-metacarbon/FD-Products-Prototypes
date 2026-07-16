import { render } from "@testing-library/react";
import axe from "axe-core";
import type { ComponentType } from "react";
import { describe, it, expect } from "vitest";
import * as icons from "./index";
import type { IconProps } from "../lib/Icon";

type IconComponent = ComponentType<IconProps>;
const entries = Object.entries(icons).filter(
  ([, v]) => typeof v === "object" || typeof v === "function",
) as [string, IconComponent][];

describe("networks icons", () => {
  it("exports the expected 11 components", () => {
    expect(entries).toHaveLength(11);
  });

  it.each(entries)("%s renders an <svg>", (_name, Cmp) => {
    const { container } = render(<Cmp />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(
      container.querySelector("svg")?.children.length ?? 0,
    ).toBeGreaterThan(0);
  });

  it("size sets width/height", () => {
    const { container } = render(<icons.BitcoinIcon size={40} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
  });

  it("title yields role=img + <title>", () => {
    const { container, getByText } = render(
      <icons.BitcoinIcon title="Bitcoin" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("role", "img");
    expect(getByText("Bitcoin").tagName.toLowerCase()).toBe("title");
  });

  it("has no axe violations across all icons", async () => {
    const { container } = render(
      <>
        {entries.map(([name, Cmp]) => (
          <Cmp key={name} title={name} />
        ))}
      </>,
    );
    const res = await axe.run(container);
    expect(res.violations).toEqual([]);
  });
});
