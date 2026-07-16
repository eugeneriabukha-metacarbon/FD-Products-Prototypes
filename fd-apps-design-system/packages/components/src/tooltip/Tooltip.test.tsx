import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../button";
import { Tooltip, computeTooltipPosition } from "./Tooltip";
import type { TooltipRect } from "./Tooltip";

// --- Accessibility helper (mirrors the sibling suites) ---
// The open bubble is portaled to `document.body`, so the axe scan targets
// `baseElement`. `region` is a page-level landmark best-practice rule irrelevant
// to an isolated component in a unit test, so it is disabled; every
// component-scoped rule (roles, ARIA attrs, nesting, contrast, names) stays on.
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

/**
 * jsdom has no layout engine — every `getBoundingClientRect` is a zero rect.
 * Stub it per test so the placement math (which the Content layout effect runs)
 * has real geometry: the trigger returns `trigger`, the portaled bubble returns
 * `content`, everything else a zero rect. Returns the spy so callers can restore.
 */
function stubRects(trigger: Partial<DOMRect>, content: Partial<DOMRect>) {
  const zero = { top: 0, left: 0, width: 0, height: 0 } as DOMRect;
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const slot = this.getAttribute("data-slot");
      if (slot === "tooltip-content") return { ...zero, ...content } as DOMRect;
      if (slot === "tooltip-trigger") return { ...zero, ...trigger } as DOMRect;
      return zero;
    });
}

/** A minimal tooltip: default-button trigger + text bubble. Extra props → Root. */
function Basic(props: React.ComponentProps<typeof Tooltip.Root>) {
  return (
    <Tooltip.Root {...props}>
      <Tooltip.Trigger>Trigger</Tooltip.Trigger>
      <Tooltip.Content>Bubble text</Tooltip.Content>
    </Tooltip.Root>
  );
}

describe("Tooltip", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── Pure placement math ──────────────────────────────────────────────────

  describe("computeTooltipPosition", () => {
    const viewport = { width: 1000, height: 800 };
    const trigger: TooltipRect = {
      top: 400,
      left: 400,
      width: 100,
      height: 40,
    };
    const content = { width: 80, height: 30 };

    it("places on the preferred side when it fits (top, centered)", () => {
      const pos = computeTooltipPosition(
        trigger,
        content,
        "top",
        "center",
        viewport,
      );
      expect(pos.side).toBe("top");
      // top: trigger.top - offset(6) - content.height(30) = 364
      expect(pos.top).toBe(364);
      // center: 400 + 100/2 - 80/2 = 410
      expect(pos.left).toBe(410);
    });

    it("flips to the opposite side when the preferred side overflows", () => {
      const nearTop: TooltipRect = {
        top: 4,
        left: 400,
        width: 100,
        height: 40,
      };
      const pos = computeTooltipPosition(
        nearTop,
        content,
        "top",
        "center",
        viewport,
      );
      // No room above (4 - 6 - 30 < 0), room below → flips to bottom.
      expect(pos.side).toBe("bottom");
      // bottom: trigger.top(4) + height(40) + offset(6) = 50
      expect(pos.top).toBe(50);
    });

    it("keeps the preferred side when neither side has room", () => {
      const tall = { width: 80, height: 2000 };
      const pos = computeTooltipPosition(
        trigger,
        tall,
        "top",
        "center",
        viewport,
      );
      expect(pos.side).toBe("top");
    });

    it("honors align start/end on the cross axis", () => {
      const start = computeTooltipPosition(
        trigger,
        content,
        "bottom",
        "start",
        viewport,
      );
      expect(start.left).toBe(400);
      const end = computeTooltipPosition(
        trigger,
        content,
        "bottom",
        "end",
        viewport,
      );
      // end: 400 + 100 - 80 = 420
      expect(end.left).toBe(420);
    });

    it("clamps the cross axis into the viewport", () => {
      const edge: TooltipRect = { top: 400, left: 970, width: 100, height: 40 };
      const pos = computeTooltipPosition(
        edge,
        content,
        "top",
        "center",
        viewport,
      );
      // Centered left would be 980; clamped to width - content - margin =
      // 1000 - 80 - 8 = 912.
      expect(pos.left).toBe(912);
    });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the trigger and keeps the bubble unmounted while closed", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: "Trigger" })).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("renders a native button of type=button by default", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: "Trigger" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  // ── Open on hover (after delay) ──────────────────────────────────────────────

  it("opens on pointer-enter only after delayDuration elapses", () => {
    vi.useFakeTimers();
    render(<Basic delayDuration={600} />);
    const trigger = screen.getByRole("button", { name: "Trigger" });

    fireEvent.pointerEnter(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("cancels the pending open when the pointer leaves before the delay", () => {
    vi.useFakeTimers();
    render(<Basic delayDuration={600} />);
    const trigger = screen.getByRole("button", { name: "Trigger" });

    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.pointerLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  // ── Open on focus (immediately) ─────────────────────────────────────────────

  it("opens immediately on focus, with no delay", () => {
    render(<Basic delayDuration={600} />);
    const trigger = screen.getByRole("button", { name: "Trigger" });
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  // ── Close triggers ───────────────────────────────────────────────────────────

  it("closes on pointer-leave", () => {
    render(<Basic defaultOpen />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerLeave(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("closes on blur", () => {
    render(<Basic defaultOpen />);
    fireEvent.blur(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("closes on Escape", () => {
    render(<Basic defaultOpen />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  // ── Controlled + uncontrolled ────────────────────────────────────────────────

  it("uncontrolled: honors defaultOpen and toggles via focus/blur", () => {
    render(<Basic defaultOpen={false} />);
    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("controlled: reflects the open prop and calls onOpenChange without self-opening", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Basic open={false} onOpenChange={onOpenChange} />,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });

    // Focus requests open via the callback but does NOT change the prop → stays closed.
    fireEvent.focus(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("tooltip")).toBeNull();

    // Parent flips the prop → bubble appears.
    rerender(<Basic open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  // ── disabled ──────────────────────────────────────────────────────────────────

  it("disabled: never opens and wires no aria-describedby", () => {
    render(<Basic disabled defaultOpen />);
    const trigger = screen.getByRole("button", { name: "Trigger" });
    // `disabled` wins even over defaultOpen.
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(trigger).not.toHaveAttribute("aria-describedby");
    fireEvent.focus(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  // ── aria-describedby wiring ─────────────────────────────────────────────────

  it("wires aria-describedby to the bubble id only while open", () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(trigger).not.toHaveAttribute("aria-describedby");

    fireEvent.focus(trigger);
    const bubble = screen.getByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", bubble.id);

    fireEvent.blur(trigger);
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  // ── Placement data-side (incl. flip) ─────────────────────────────────────────

  it("reflects the resolved side/align on the open bubble (data-side / data-align)", () => {
    stubRects(
      { top: 400, left: 400, width: 100, height: 40 },
      { top: 0, left: 0, width: 80, height: 30 },
    );
    render(<Basic defaultOpen side="top" align="start" />);
    const bubble = screen.getByRole("tooltip");
    expect(bubble).toHaveAttribute("data-side", "top");
    expect(bubble).toHaveAttribute("data-align", "start");
  });

  it("flips data-side to the opposite when the preferred side overflows", () => {
    // Trigger pinned to the top edge: no room above, so a `top` request flips
    // down to `bottom`.
    stubRects(
      { top: 2, left: 400, width: 100, height: 40 },
      { top: 0, left: 0, width: 80, height: 30 },
    );
    render(<Basic defaultOpen side="top" />);
    expect(screen.getByRole("tooltip")).toHaveAttribute("data-side", "bottom");
  });

  // ── asChild projection ────────────────────────────────────────────────────────

  it("asChild: projects onto the child, composing handlers and the describedby id", () => {
    const onFocus = vi.fn();
    render(
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button onFocus={onFocus}>Adopted</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Bubble</Tooltip.Content>
      </Tooltip.Root>,
    );
    const trigger = screen.getByRole("button", { name: "Adopted" });
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger");

    fireEvent.focus(trigger);
    // Consumer's handler still runs (composed, not overwritten)…
    expect(onFocus).toHaveBeenCalledTimes(1);
    // …and the tooltip opened + wired describedby onto the adopted element.
    const bubble = screen.getByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", bubble.id);
  });

  it("asChild: throws when not given a single element child", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <Tooltip.Root>
          <Tooltip.Trigger asChild>text</Tooltip.Trigger>
          <Tooltip.Content>Bubble</Tooltip.Content>
        </Tooltip.Root>,
      ),
    ).toThrow(/single React element child/);
    spy.mockRestore();
  });

  // ── ref forwarding ────────────────────────────────────────────────────────────

  it("forwards the trigger ref to the button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Tooltip.Root>
        <Tooltip.Trigger ref={ref}>Trigger</Tooltip.Trigger>
        <Tooltip.Content>Bubble</Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute("data-slot", "tooltip-trigger");
  });

  it("forwards the content ref to the bubble", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Trigger</Tooltip.Trigger>
        <Tooltip.Content ref={ref}>Bubble</Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "tooltip");
  });

  // ── a11y ────────────────────────────────────────────────────────────────────

  it("has no axe violations while open", async () => {
    const { baseElement } = render(<Basic defaultOpen />);
    await checkA11y(baseElement);
  });

  it("has no axe violations while closed", async () => {
    const { baseElement } = render(<Basic />);
    await checkA11y(baseElement);
  });
});
