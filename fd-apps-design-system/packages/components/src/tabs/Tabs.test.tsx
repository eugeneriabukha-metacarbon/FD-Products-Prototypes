import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Tabs } from "./Tabs";

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

/** A three-tab set; the third is disabled. Extra props spread onto Root. */
function Basic(props: React.ComponentProps<typeof Tabs.Root>) {
  return (
    <Tabs.Root {...props}>
      <Tabs.List aria-label="Sections">
        <Tabs.Trigger value="a">First</Tabs.Trigger>
        <Tabs.Trigger value="b">Second</Tabs.Trigger>
        <Tabs.Trigger value="c" disabled>
          Third
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">First panel</Tabs.Content>
      <Tabs.Content value="b">Second panel</Tabs.Content>
      <Tabs.Content value="c">Third panel</Tabs.Content>
    </Tabs.Root>
  );
}

describe("Tabs rendering", () => {
  it("renders a tablist of tabs", () => {
    render(<Basic />);
    expect(
      screen.getByRole("tablist", { name: "Sections" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("renders no panel when nothing is selected", () => {
    render(<Basic />);
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("renders only the selected panel from defaultValue", () => {
    render(<Basic defaultValue="a" />);
    const panel = screen.getByRole("tabpanel", { name: "First" });
    expect(panel).toHaveTextContent("First panel");
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });

  it("is not itself a landmark", () => {
    const { container } = render(<Basic />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).not.toHaveAttribute("role");
  });
});

describe("Tabs selection by click", () => {
  it("selects a tab and swaps the visible panel", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="a" />);
    expect(screen.getByText("First panel")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeInTheDocument();
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("does not select a disabled tab", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="a" />);
    const disabled = screen.getByRole("tab", { name: "Third" });
    expect(disabled).toBeDisabled();

    await user.click(disabled);
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.queryByText("Third panel")).not.toBeInTheDocument();
  });
});

describe("Tabs aria + roving tabindex", () => {
  it("wires aria-selected and aria-controls only on the selected tab", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="a" />);
    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });

    expect(first).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveAttribute("aria-selected", "false");

    const panel = screen.getByRole("tabpanel", { name: "First" });
    expect(first).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", first.id);
    // The unselected tab's panel is unmounted → no dangling aria-controls.
    expect(second).not.toHaveAttribute("aria-controls");

    await user.click(second);
    expect(first).not.toHaveAttribute("aria-controls");
    expect(second).toHaveAttribute(
      "aria-controls",
      screen.getByRole("tabpanel", { name: "Second" }).id,
    );
  });

  it("gives the selected tab tabIndex 0 and the rest -1", () => {
    render(<Basic defaultValue="b" />);
    expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("makes the first enabled tab the tab stop when nothing is selected", () => {
    render(<Basic />);
    expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });
});

describe("Tabs keyboard (automatic activation)", () => {
  it("ArrowRight / ArrowLeft move focus AND select, wrapping past disabled", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="a" />);
    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });

    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Second panel")).toBeInTheDocument();

    // Only "First" and "Second" are enabled — the disabled "Third" is skipped,
    // so ArrowRight wraps back to "First".
    await user.keyboard("{ArrowRight}");
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}");
    expect(second).toHaveFocus(); // wraps backward, still skipping disabled
  });

  it("Home / End select the first / last enabled tab", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="b" />);
    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });

    second.focus();
    await user.keyboard("{End}");
    // "Third" is disabled, so End lands on the last ENABLED tab, "Second".
    expect(second).toHaveFocus();

    await user.keyboard("{Home}");
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute("aria-selected", "true");
  });
});

describe("Tabs controlled + uncontrolled", () => {
  it("uncontrolled: tracks its own state and reports changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Basic defaultValue="a" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByText("Second panel")).toBeInTheDocument();
  });

  it("controlled: reflects the value prop and honours the controller", async () => {
    const user = userEvent.setup();
    render(<Basic value="a" onValueChange={() => {}} />);

    // Value is pinned to "a" by the parent, so clicking "Second" changes nothing.
    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });

  it("controlled: updates when the parent commits the change", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState("a");
      return <Basic value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);

    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeInTheDocument();
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });
});

describe("Tabs composed handlers", () => {
  it("runs a consumer onClick without breaking selection", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="a">First</Tabs.Trigger>
          <Tabs.Trigger value="b" onClick={onClick}>
            Second
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">First panel</Tabs.Content>
        <Tabs.Content value="b">Second panel</Tabs.Content>
      </Tabs.Root>,
    );
    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Second panel")).toBeInTheDocument();
  });
});

describe("Tabs ref forwarding", () => {
  it("forwards refs to root, list, trigger, and content", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();

    render(
      <Tabs.Root ref={rootRef} defaultValue="a">
        <Tabs.List ref={listRef} aria-label="Sections">
          <Tabs.Trigger ref={triggerRef} value="a">
            First
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content ref={contentRef} value="a">
          First panel
        </Tabs.Content>
      </Tabs.Root>,
    );

    expect(rootRef.current).toHaveAttribute("data-slot", "tabs");
    expect(listRef.current).toHaveAttribute("data-slot", "tabs-list");
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toHaveAttribute("data-slot", "tabs-content");
  });

  it("throws when a part is used outside its provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tabs.Trigger value="a">x</Tabs.Trigger>)).toThrow(
      /within <Tabs.Root>/,
    );
    spy.mockRestore();
  });
});

describe("Tabs a11y", () => {
  it("has no axe violations with nothing selected", async () => {
    const { container } = render(<Basic />);
    await checkA11y(container);
  });

  it("has no axe violations with a selected tab + panel", async () => {
    const { container } = render(<Basic defaultValue="a" />);
    expect(screen.getByRole("tabpanel", { name: "First" })).toBeInTheDocument();
    await checkA11y(container);
  });
});
