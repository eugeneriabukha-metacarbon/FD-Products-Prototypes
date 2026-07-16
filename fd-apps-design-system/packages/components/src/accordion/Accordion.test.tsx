import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Accordion } from "./Accordion";

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

/** A three-item single-mode accordion; extra props spread onto Root. */
function Basic(props: React.ComponentProps<typeof Accordion.Root>) {
  return (
    <Accordion.Root {...props}>
      <Accordion.Item value="a">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>First panel</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Content>Second panel</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Trigger>Third</Accordion.Trigger>
        <Accordion.Content>Third panel</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe("Accordion rendering", () => {
  it("renders each item's title", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: "First" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Second" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Third" })).toBeInTheDocument();
  });

  it("does not render closed content (removed from the DOM / a11y tree)", () => {
    render(<Basic />);
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("renders open content from defaultValue as a labelled region", () => {
    render(<Basic defaultValue="a" />);
    const region = screen.getByRole("region", { name: "First" });
    expect(region).toHaveTextContent("First panel");
  });

  it("is not itself a landmark", () => {
    const { container } = render(<Basic />);
    const root = container.querySelector('[data-slot="accordion"]');
    expect(root).not.toHaveAttribute("role");
  });
});

describe("Accordion aria wiring", () => {
  it("wires aria-expanded, and aria-controls only while open", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "First" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const region = screen.getByRole("region", { name: "First" });
    expect(trigger).toHaveAttribute("aria-controls", region.id);
    expect(region).toHaveAttribute("aria-labelledby", trigger.id);
  });
});

describe("Accordion toggle — single mode", () => {
  it("opens on click and closes on re-click (collapsible default)", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "First" });

    await user.click(trigger);
    expect(screen.getByText("First panel")).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("opening one item closes the previously open one", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="a" />);
    expect(screen.getByText("First panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeInTheDocument();
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("collapsible={false} keeps the active item open on re-click", async () => {
    const user = userEvent.setup();
    render(<Basic defaultValue="a" collapsible={false} />);
    const trigger = screen.getByRole("button", { name: "First" });

    await user.click(trigger);
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Accordion toggle — multiple mode", () => {
  it("toggles items independently", async () => {
    const user = userEvent.setup();
    render(<Basic type="multiple" />);

    await user.click(screen.getByRole("button", { name: "First" }));
    await user.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.getByText("Second panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "First" }));
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
    expect(screen.getByText("Second panel")).toBeInTheDocument();
  });

  it("accepts a defaultValue array", () => {
    render(<Basic type="multiple" defaultValue={["a", "c"]} />);
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.getByText("Third panel")).toBeInTheDocument();
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });
});

describe("Accordion controlled", () => {
  it("reflects the value prop and reports changes via onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function Controlled() {
      const [value, setValue] = React.useState<string | null>("a");
      return (
        <Basic
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next as string | null);
          }}
        />
      );
    }

    render(<Controlled />);
    expect(screen.getByText("First panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Second" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByText("Second panel")).toBeInTheDocument();
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("does not change open state when the controller ignores onValueChange", async () => {
    const user = userEvent.setup();
    render(<Basic value="a" onValueChange={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Second" }));
    // Value is pinned to "a" by the parent, so "b" never opens.
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });
});

describe("Accordion disabled item", () => {
  it("marks the trigger disabled and ignores clicks", async () => {
    const user = userEvent.setup();
    render(
      <Accordion.Root>
        <Accordion.Item value="a" disabled>
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const trigger = screen.getByRole("button", { name: "First" });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });
});

describe("Accordion keyboard", () => {
  it("toggles with Enter and Space (native button)", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "First" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("First panel")).toBeInTheDocument();
    await user.keyboard(" ");
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();
  });

  it("ArrowDown / ArrowUp move focus and wrap", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const [first, second, third] = [
      screen.getByRole("button", { name: "First" }),
      screen.getByRole("button", { name: "Second" }),
      screen.getByRole("button", { name: "Third" }),
    ];

    first.focus();
    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(third).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(first).toHaveFocus(); // wraps forward
    await user.keyboard("{ArrowUp}");
    expect(third).toHaveFocus(); // wraps backward
  });

  it("Home / End jump to the first / last trigger", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const first = screen.getByRole("button", { name: "First" });
    const third = screen.getByRole("button", { name: "Third" });

    first.focus();
    await user.keyboard("{End}");
    expect(third).toHaveFocus();
    await user.keyboard("{Home}");
    expect(first).toHaveFocus();
  });

  it("skips disabled triggers during roving", async () => {
    const user = userEvent.setup();
    render(
      <Accordion.Root>
        <Accordion.Item value="a">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b" disabled>
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Second panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="c">
          <Accordion.Trigger>Third</Accordion.Trigger>
          <Accordion.Content>Third panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const first = screen.getByRole("button", { name: "First" });
    const third = screen.getByRole("button", { name: "Third" });

    first.focus();
    await user.keyboard("{ArrowDown}");
    expect(third).toHaveFocus(); // disabled "Second" is skipped
  });

  it("composes a consumer onClick without breaking the toggle", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Accordion.Root>
        <Accordion.Item value="a">
          <Accordion.Trigger onClick={onClick}>First</Accordion.Trigger>
          <Accordion.Content>First panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    await user.click(screen.getByRole("button", { name: "First" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("First panel")).toBeInTheDocument();
  });
});

describe("Accordion icon", () => {
  it("swaps the trigger icon between collapsed and expanded", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "First" });
    const iconOf = () =>
      trigger.querySelector('[data-slot="accordion-trigger-icon"] svg');

    expect(iconOf()).toBeInTheDocument();
    const collapsedIcon = iconOf();
    await user.click(trigger);
    // Same slot, different Phosphor glyph after toggling open.
    expect(iconOf()).toBeInTheDocument();
    expect(iconOf()).not.toBe(collapsedIcon);
  });
});

describe("Accordion ref forwarding", () => {
  it("forwards refs to root, item, trigger, and content", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();

    render(
      <Accordion.Root ref={rootRef} defaultValue="a">
        <Accordion.Item value="a" ref={itemRef}>
          <Accordion.Trigger ref={triggerRef}>First</Accordion.Trigger>
          <Accordion.Content ref={contentRef}>First panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );

    expect(rootRef.current).toHaveAttribute("data-slot", "accordion");
    expect(itemRef.current).toHaveAttribute("data-slot", "accordion-item");
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toHaveAttribute(
      "data-slot",
      "accordion-content",
    );
  });

  it("throws when a part is used outside its provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Accordion.Trigger>x</Accordion.Trigger>)).toThrow(
      /within <Accordion.Root>/,
    );
    spy.mockRestore();
  });
});

describe("Accordion a11y", () => {
  it("has no axe violations when collapsed", async () => {
    const { container } = render(<Basic />);
    await checkA11y(container);
  });

  it("has no axe violations when expanded", async () => {
    const { container } = render(<Basic defaultValue="a" />);
    // Sanity: the open region is present before the audit.
    within(container).getByRole("region", { name: "First" });
    await checkA11y(container);
  });

  it("has no axe violations with a disabled item", async () => {
    const { container } = render(
      <Accordion.Root>
        <Accordion.Item value="a" disabled>
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    await checkA11y(container);
  });
});
