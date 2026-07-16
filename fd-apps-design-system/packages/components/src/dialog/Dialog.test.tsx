import * as React from "react";
import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Button } from "../button";
import { Dialog } from "./Dialog";
import { getFocusableElements, useFocusTrap } from "./useFocusTrap";

// --- Accessibility helper (mirrors the sibling suites) ---
// The open dialog is portaled to `document.body`, so the axe scan targets
// `baseElement`. `region` is a page-level landmark best-practice rule (all
// content must sit inside a landmark) — irrelevant to an isolated component
// mounted at the document root in a unit test — so it is turned off here; all
// component-scoped rules (roles, ARIA attrs, nesting, contrast, names) stay on.
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

/** A representative dialog: trigger + header (icon/description/close) + form body + footer. */
function TestDialog({
  dismissable,
  showClose = true,
  withDescription = true,
  contentRef,
}: {
  dismissable?: boolean;
  showClose?: boolean;
  withDescription?: boolean;
  contentRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <Dialog.Root dismissable={dismissable}>
      <Dialog.Trigger asChild>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Dialog.Content ref={contentRef}>
        <Dialog.Header
          icon={<svg data-testid="header-icon" />}
          title="Dialog title"
          description={withDescription ? "Dialog description." : undefined}
          showClose={showClose}
        />
        <Dialog.Body>
          <input aria-label="Field" />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variation="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variation="primary">Confirm</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ── Pure helper: getFocusableElements ────────────────────────────────────────

describe("getFocusableElements", () => {
  it("returns tabbable descendants in DOM order, skipping disabled / tabindex=-1", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button id="a">A</button>
      <button id="b" disabled>B</button>
      <input id="c" />
      <a id="d">no href</a>
      <div id="e" tabindex="-1">skip</div>
      <div id="f" tabindex="0">keep</div>
    `;
    const ids = getFocusableElements(container).map((el) => el.id);
    expect(ids).toEqual(["a", "c", "f"]);
  });
});

// ── Hook: useFocusTrap scroll-lock + initial focus ───────────────────────────

describe("useFocusTrap", () => {
  it("locks body scroll while active and restores it on cleanup", () => {
    const container = document.createElement("div");
    container.innerHTML = `<button>x</button>`;
    document.body.appendChild(container);
    const containerRef = { current: container };

    const { unmount } = renderHook(() =>
      useFocusTrap({ active: true, containerRef }),
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
    container.remove();
  });

  it("does nothing while inactive", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    renderHook(() =>
      useFocusTrap({ active: false, containerRef: { current: container } }),
    );
    expect(document.body.style.overflow).toBe("");
    container.remove();
  });

  it("moves focus to the first focusable element on activate", () => {
    const container = document.createElement("div");
    container.innerHTML = `<button id="first">first</button><button>second</button>`;
    document.body.appendChild(container);
    renderHook(() =>
      useFocusTrap({ active: true, containerRef: { current: container } }),
    );
    expect(document.activeElement?.id).toBe("first");
    container.remove();
  });
});

// ── Open / close routing ─────────────────────────────────────────────────────

describe("Dialog — open/close", () => {
  it("is closed by default (nothing portaled)", () => {
    render(<TestDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes via the Dialog.Close button", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes via the header X close button", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape when dismissable", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on backdrop click when dismissable", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const overlay = document.body.querySelector<HTMLElement>(
      "[data-slot=dialog-overlay]",
    )!;
    await user.click(overlay);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does NOT close on a click inside the card", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("heading", { name: "Dialog title" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

// ── dismissable={false} ──────────────────────────────────────────────────────

describe("Dialog — dismissable={false}", () => {
  it("blocks Escape and backdrop, but the X and footer buttons still close", async () => {
    const user = userEvent.setup();
    render(<TestDialog dismissable={false} />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const overlay = document.body.querySelector<HTMLElement>(
      "[data-slot=dialog-overlay]",
    )!;
    await user.click(overlay);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // The explicit X close always works, regardless of dismissable.
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ── Focus management ─────────────────────────────────────────────────────────

describe("Dialog — focus trap + return", () => {
  it("moves focus into the dialog on open (first focusable = the X)", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("cycles Tab within the dialog (last → first)", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const first = screen.getByRole("button", { name: "Close" });
    const last = screen.getByRole("button", { name: "Confirm" });
    last.focus();
    await user.tab();
    expect(first).toHaveFocus();
  });

  it("cycles Shift+Tab within the dialog (first → last)", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const first = screen.getByRole("button", { name: "Close" });
    const last = screen.getByRole("button", { name: "Confirm" });
    first.focus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("locks and releases body scroll", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    expect(document.body.style.overflow).toBe("");
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });
});

// ── ARIA wiring ──────────────────────────────────────────────────────────────

describe("Dialog — ARIA", () => {
  it("marks the card as a modal dialog", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("wires aria-labelledby to the title node", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    const labelId = dialog.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe("Dialog title");
  });

  it("wires aria-describedby to the description node when present", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    const describedId = dialog.getAttribute("aria-describedby");
    expect(describedId).toBeTruthy();
    expect(document.getElementById(describedId!)?.textContent).toBe(
      "Dialog description.",
    );
  });

  it("omits aria-describedby when there is no description", async () => {
    const user = userEvent.setup();
    render(<TestDialog withDescription={false} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
  });

  it("wires the trigger's aria-haspopup / aria-expanded", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders the header icon as decorative (aria-hidden)", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const iconWrapper = document.querySelector(
      "[data-slot=dialog-header-icon]",
    );
    expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("has no axe violations when open", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await checkA11y(baseElement);
  });
});

// ── ref forwarding + asChild + controlled ────────────────────────────────────

describe("Dialog — ref, asChild, controlled", () => {
  it("forwards a ref to the card element", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLDivElement | null };
    render(<TestDialog contentRef={ref} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "dialog");
  });

  it("supports controlled open + onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog.Root open={false} onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Header title="Controlled" />
          <Dialog.Body>body</Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button>Done</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Dialog.Root open onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Header title="Controlled" />
          <Dialog.Body>body</Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button>Done</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close routes through onOpenChange; display does not change until parent updates.
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("throws when a part is used outside Dialog.Root", () => {
    // Silence the expected error boundary console output.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Dialog.Trigger>orphan</Dialog.Trigger>)).toThrow(
      /within <Dialog.Root>/,
    );
    spy.mockRestore();
  });

  it("renders open when defaultOpen (uncontrolled)", () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Header title="Open now" />
          <Dialog.Body>hi</Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Dialog — footer fills the row", () => {
  it("stretches every footer button, including a Dialog.Close-wrapped one", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const footer = document.body.querySelector<HTMLElement>(
      "[data-slot=dialog-footer]",
    )!;
    // jsdom has no layout, so assert the two-level-stretch utility contract
    // (not pixel widths): each direct child grows equally, and every inner
    // <button> fills its track so the label centers — matching Figma.
    expect(footer.className).toContain("[&>*]:flex-1");
    expect(footer.className).toContain("[&_button]:w-full");

    // Regression guard: `Dialog.Close asChild` overrides the inner button's
    // data-slot to "dialog-close", so the fill selector must target the
    // element (`[&_button]`), NOT `[data-slot=button]` (which would miss
    // Cancel). Both footer buttons must be present and element-matchable.
    const buttons = footer.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("data-slot", "dialog-close");
    expect(buttons[1]).toHaveAttribute("data-slot", "button");
  });
});

describe("Dialog — header spacing matches Figma", () => {
  it("uses gap-4 icon→text and gap-2 title→description", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    // jsdom has no layout, so assert the Figma spacing utilities rather than
    // measured px (verified live in Storybook: 16px icon→title, 8px title→desc).
    const header = document.body.querySelector<HTMLElement>(
      "[data-slot=dialog-header]",
    )!;
    const textCol = header.querySelector("h2")!.parentElement!;

    expect(header.className).toContain("gap-4"); // icon → text column
    expect(textCol.className).toContain("gap-2"); // title → description
  });
});

describe("Dialog — close button", () => {
  it("shows the close X by default, positioned absolutely at the card corner", async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button>Open</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          {/* no showClose passed → uses the default */}
          <Dialog.Header title="Title" />
          <Dialog.Body>body</Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));

    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toBeInTheDocument();
    // Absolute, 24px from the card's top and right — independent of the icon.
    expect(close.className).toContain("absolute");
    expect(close.className).toContain("top-6");
    expect(close.className).toContain("right-6");
  });

  it("hides the close X when showClose={false}", async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button>Open</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header title="Title" showClose={false} />
          <Dialog.Body>body</Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });
});

describe("Dialog — optional body", () => {
  it("renders a header + footer dialog with no Dialog.Body (destructive shape)", () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Header
            title="Delete item?"
            description="This action cannot be undone."
          />
          {/* no Dialog.Body — optional by composition */}
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variation="secondary">Cancel</Button>
            </Dialog.Close>
            <Button variation="destructive">Delete</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // No body slot present, header + footer still render and wire up.
    expect(dialog.querySelector("[data-slot=dialog-body]")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Delete item?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    // aria-labelledby/​describedby still resolve to the header nodes.
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });
});
