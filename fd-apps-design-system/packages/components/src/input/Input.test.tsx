import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi } from "vitest";

import { Input } from "./Input";

// --- Accessibility helper (mirrors the applypass reference suite) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

describe("Input", () => {
  // --- Rendering ---

  it("renders a text input with data-slot=input", () => {
    render(<Input aria-label="Field" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
  });

  it("renders the label and associates it with the input", () => {
    render(<Input label="Email address" />);
    // getByLabelText proves the htmlFor/id association resolves.
    const input = screen.getByLabelText("Email address");
    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  it("honours a caller-provided id for the association", () => {
    render(<Input id="custom-id" label="Name" />);
    expect(screen.getByLabelText("Name")).toHaveAttribute("id", "custom-id");
  });

  it("does not render a label row when no label is given", () => {
    render(<Input aria-label="Bare" />);
    expect(screen.queryByRole("textbox")).toHaveAttribute("aria-label", "Bare");
    // No <label> element present.
    expect(document.querySelector("[data-slot=input-label]")).toBeNull();
  });

  it("renders the Optional tag only when optional and a label are present", () => {
    const { rerender } = render(<Input label="Nickname" optional />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
    // optional without a label renders nothing extra
    rerender(<Input aria-label="Nickname" optional />);
    expect(screen.queryByText("Optional")).not.toBeInTheDocument();
  });

  it("renders leftSlot and rightSlot content", () => {
    render(
      <Input
        aria-label="Search"
        leftSlot={<span data-testid="lead" />}
        rightSlot={<span data-testid="trail" />}
      />,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });

  // --- Slot accessibility (leading decorative, trailing may be interactive) ---

  it("keeps the leading slot decorative (aria-hidden)", () => {
    render(<Input aria-label="Lead" leftSlot={<span data-testid="lead" />} />);
    const wrapper = document.querySelector("[data-slot=input-leading]");
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("does NOT set aria-hidden on the trailing slot (may host an interactive control)", () => {
    render(
      <Input aria-label="Trail" rightSlot={<span data-testid="trail" />} />,
    );
    const wrapper = document.querySelector("[data-slot=input-trailing]");
    expect(wrapper).not.toHaveAttribute("aria-hidden");
  });

  it("exposes an interactive element in the trailing slot to AT + keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Input
        aria-label="With action"
        rightSlot={
          <button type="button" aria-label="Do thing" onClick={onClick}>
            <span aria-hidden="true">x</span>
          </button>
        }
      />,
    );
    // Reachable by accessible name (would fail if inside an aria-hidden wrapper).
    const button = screen.getByRole("button", { name: "Do thing" });
    // Keyboard-focusable.
    button.focus();
    expect(button).toHaveFocus();
    // Pointer-clickable (the svg/glyph inside doesn't swallow the click).
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders hint text and links it via aria-describedby", () => {
    render(<Input label="Password" hint="At least 8 characters" />);
    const input = screen.getByLabelText("Password");
    const describedby = input.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    const hint = document.getElementById(describedby as string);
    expect(hint).toHaveTextContent("At least 8 characters");
  });

  it("does not set aria-describedby when there is no hint", () => {
    render(<Input aria-label="No hint" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });

  // --- Variations / sizes ---

  it("defaults to variation=field, size=lg", () => {
    render(<Input aria-label="Default" />);
    const field = document.querySelector("[data-slot=input-field]");
    expect(field?.className).toContain("bg-input-background");
    expect(field?.className).toContain("border-input-border");
    expect(field?.className).toContain("h-10");
  });

  it("applies the line variation (bottom border, no background)", () => {
    render(<Input aria-label="Line" variation="line" />);
    const field = document.querySelector("[data-slot=input-field]");
    expect(field?.className).toContain("border-b");
    expect(field?.className).not.toContain("bg-input-background");
  });

  it("applies the sm size height", () => {
    render(<Input aria-label="Small" size="sm" />);
    const field = document.querySelector("[data-slot=input-field]");
    expect(field?.className).toContain("h-8");
  });

  it("derives field-sm horizontal padding as px-2 (uniform spacing/2 inset)", () => {
    render(<Input aria-label="Small field" variation="field" size="sm" />);
    const field = document.querySelector("[data-slot=input-field]");
    const classes = field?.className.split(/\s+/) ?? [];
    expect(classes).toContain("px-2");
    expect(classes).not.toContain("px-2.5");
  });

  // --- showBottomLine (line-only bottom-line toggle) ---

  it("hides the resting line via border-transparent when showBottomLine=false (line)", () => {
    render(
      <Input aria-label="Borderless" variation="line" showBottomLine={false} />,
    );
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    // border-b (width) is kept for zero layout shift; only the colour changes.
    expect(cls).toContain("border-b");
    // Resting colour is transparent, and the resting input-border is dropped.
    expect(cls).toContain("border-transparent");
    expect(cls).not.toContain("border-input-border ");
    expect(cls.split(/\s+/)).not.toContain("border-input-border");
    // Focus still wins → the line reappears on focus.
    expect(cls).toContain("focus-within:border-input-border-accent");
  });

  it("keeps the destructive border on an errored line even with showBottomLine=false", () => {
    render(
      <Input
        aria-label="Borderless error"
        variation="line"
        showBottomLine={false}
        error
      />,
    );
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    // Destructive rest border must survive (compound is gated on error:false,
    // so border-transparent is NOT emitted and never overrides it).
    expect(cls).toContain("border-input-destructive-foreground-accent");
    expect(cls.split(/\s+/)).not.toContain("border-transparent");
  });

  it("ignores showBottomLine on the field variation (prop is line-only)", () => {
    render(
      <Input
        aria-label="Field ignore"
        variation="field"
        showBottomLine={false}
      />,
    );
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    // field's box border is untouched; no transparent hide applied.
    expect(cls).toContain("border-input-border");
    expect(cls.split(/\s+/)).not.toContain("border-transparent");
  });

  it("keeps the resting line by default (showBottomLine omitted) on a line input", () => {
    render(<Input aria-label="Default line" variation="line" />);
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    expect(cls).toContain("border-input-border");
    expect(cls.split(/\s+/)).not.toContain("border-transparent");
  });

  it("does not leak showBottomLine onto the native <input> as a DOM attribute", () => {
    render(
      <Input aria-label="No leak" variation="line" showBottomLine={false} />,
    );
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("showbottomline");
    expect(input).not.toHaveAttribute("showBottomLine");
  });

  // --- Focus / hover model (user-authorized exception to ADR-0010 #4 / 0011) ---
  //
  // Text inputs do NOT use the system :focus-visible outline ring. Focus is
  // signalled by recolouring the border to the accent via `focus-within:`
  // (fires for mouse OR keyboard focus), and hover is an I-beam cursor
  // affordance only (no colour change). See inputVariants.ts for the rationale.

  it("shows an I-beam text cursor over the whole field wrapper", () => {
    render(<Input aria-label="Cursor" />);
    const field = document.querySelector("[data-slot=input-field]");
    expect(field?.className).toContain("cursor-text");
  });

  it("has NO system outline ring / outline-* utilities on the field wrapper", () => {
    // The ring was intentionally removed: no outline-*, no has-[…:focus-visible]
    // utilities should appear on the wrapper.
    render(<Input aria-label="No ring" />);
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    expect(cls).not.toMatch(/outline-/);
    expect(cls).not.toContain("focus-visible");
  });

  it("signals focus with the accent border via focus-within (not hover)", () => {
    render(<Input aria-label="Focus" />);
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    // Focus recolours the border to the accent…
    expect(cls).toContain("focus-within:border-input-border-accent");
    // …and hover does NOT: the accent border must only be present via the
    // `focus-within:` variant, never a bare `hover:border-input-border-accent`.
    expect(cls).not.toContain("hover:border-input-border-accent");
  });

  it("resets the native outline on the input (no ring anywhere)", () => {
    render(<Input aria-label="No native outline" />);
    expect(screen.getByRole("textbox").className).toContain("outline-none");
  });

  // --- Error state ---

  it("sets aria-invalid and destructive border when error", () => {
    render(<Input aria-label="Bad" error />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    const field = document.querySelector("[data-slot=input-field]");
    expect(field?.className).toContain(
      "border-input-destructive-foreground-accent",
    );
  });

  it("keeps the destructive border on focus (never flips to the accent)", () => {
    // An errored field must stay red when focused: the destructive
    // `focus-within:` form out-ranks the variation's `focus-within:` accent, so
    // the accent never wins on an errored field.
    render(<Input aria-label="Bad focus" error />);
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    expect(cls).toContain(
      "focus-within:border-input-destructive-foreground-accent",
    );
    // The accent focus-within must be dropped by tailwind-merge (destructive
    // wins), so the errored field never turns purple on focus.
    expect(cls).not.toContain("focus-within:border-input-border-accent");
  });

  it("does not set aria-invalid when not in error", () => {
    render(<Input aria-label="Fine" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  // --- Disabled state ---

  it("is disabled when the disabled prop is passed", () => {
    render(<Input aria-label="Off" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("keeps the not-allowed cursor override on a disabled field (wins over cursor-text)", () => {
    // `has-[:disabled]:cursor-not-allowed` is declared AFTER `cursor-text` in
    // the base, so on a disabled field the not-allowed cursor overrides the
    // I-beam. Both utilities are present; order gives disabled the win.
    render(<Input aria-label="Off cursor" disabled />);
    const field = document.querySelector("[data-slot=input-field]");
    const cls = field?.className ?? "";
    expect(cls).toContain("cursor-text");
    expect(cls).toContain("has-[:disabled]:cursor-not-allowed");
    // Class order: cursor-text must precede the disabled override.
    expect(cls.indexOf("cursor-text")).toBeLessThan(
      cls.indexOf("has-[:disabled]:cursor-not-allowed"),
    );
  });

  it("does not accept typing when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Off" disabled onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "abc");
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- Interaction ---

  it("accepts typed input and fires onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Type" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("hello");
  });

  it("supports controlled value + onChange (input stays the source of truth)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Controlled" value="fixed" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("fixed");
    // A controlled input without a state update keeps its value; onChange fires.
    await user.type(input, "x");
    expect(onChange).toHaveBeenCalled();
    expect(input.value).toBe("fixed");
  });

  it("forwards a ref to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input aria-label="Ref" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("forwards arbitrary props to the input (name, type)", () => {
    render(<Input aria-label="Email" name="email" type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
  });

  it("forwards className to the input and fieldClassName to the field", () => {
    render(
      <Input
        aria-label="Cls"
        className="input-custom"
        fieldClassName="field-custom"
      />,
    );
    expect(screen.getByRole("textbox").className).toContain("input-custom");
    expect(
      document.querySelector("[data-slot=input-field]")?.className,
    ).toContain("field-custom");
  });

  // --- Accessibility (axe) ---

  it("has no axe violations (label + hint)", async () => {
    const { container } = render(
      <Input label="Full name" hint="As it appears on your ID" />,
    );
    await checkA11y(container);
  });

  it("has no axe violations (error state)", async () => {
    const { container } = render(
      <Input label="Amount" error hint="Enter a positive number" />,
    );
    await checkA11y(container);
  });

  it("has no axe violations (line variation, aria-label only)", async () => {
    const { container } = render(
      <Input aria-label="Search" variation="line" />,
    );
    await checkA11y(container);
  });
});
