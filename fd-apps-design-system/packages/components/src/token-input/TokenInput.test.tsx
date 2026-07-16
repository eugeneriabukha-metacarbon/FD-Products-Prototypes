import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { TokenInput } from "./TokenInput";

// --- Accessibility helper (mirrors the Input / SearchBar suites) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

/** The token badges currently rendered (each has data-slot=token). */
function tokenLabels() {
  return Array.from(document.querySelectorAll("[data-slot=token-label]")).map(
    (el) => el.textContent,
  );
}

describe("TokenInput", () => {
  // --- Rendering ---

  it("renders a text input with data-slot=token-input", () => {
    render(<TokenInput aria-label="Recipients" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "data-slot",
      "token-input",
    );
  });

  it("renders the label and associates it with the input", () => {
    render(<TokenInput label="Invite teammates" />);
    expect(screen.getByLabelText("Invite teammates")).toBeInstanceOf(
      HTMLInputElement,
    );
  });

  it("honours a caller-provided id for the association", () => {
    render(<TokenInput id="custom-id" label="Recipients" />);
    expect(screen.getByLabelText("Recipients")).toHaveAttribute(
      "id",
      "custom-id",
    );
  });

  it("renders the Optional tag only when optional AND a label are present", () => {
    const { rerender } = render(<TokenInput label="Recipients" optional />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
    rerender(<TokenInput aria-label="Recipients" optional />);
    expect(screen.queryByText("Optional")).not.toBeInTheDocument();
  });

  it("renders the placeholder when there are no tokens", () => {
    render(<TokenInput aria-label="Recipients" placeholder="Add people…" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Add people…",
    );
  });

  it("hides the placeholder once there are tokens", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        placeholder="Add people…"
        defaultValue={["ada@acme.com"]}
      />,
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("placeholder");
  });

  it("renders hint text and links it via aria-describedby", () => {
    render(<TokenInput label="Recipients" hint="Comma separated" />);
    const input = screen.getByLabelText("Recipients");
    const describedby = input.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    expect(document.getElementById(describedby as string)).toHaveTextContent(
      "Comma separated",
    );
  });

  it("does not set aria-describedby when there is no hint", () => {
    render(<TokenInput aria-label="Recipients" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });

  it("renders seeded tokens from defaultValue", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["ada@acme.com", "grace@acme.com"]}
      />,
    );
    expect(tokenLabels()).toEqual(["ada@acme.com", "grace@acme.com"]);
  });

  // --- ref forwarding ---

  it("forwards ref to the underlying input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TokenInput aria-label="Recipients" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute("data-slot", "token-input");
  });

  // --- Commit behaviour ---

  it("commits a token when the draft contains a comma and clears the draft", () => {
    const onChange = vi.fn();
    render(<TokenInput aria-label="Recipients" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.input(input, { target: { value: "foo," } });

    expect(onChange).toHaveBeenCalledWith(["foo"]);
    expect(tokenLabels()).toEqual(["foo"]);
    expect(input.value).toBe("");
  });

  it("commits with a custom separator (space)", () => {
    const onChange = vi.fn();
    render(
      <TokenInput aria-label="Tags" separators={[" "]} onChange={onChange} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.input(input, { target: { value: "design " } });

    expect(onChange).toHaveBeenCalledWith(["design"]);
    expect(tokenLabels()).toEqual(["design"]);
    expect(input.value).toBe("");
  });

  it("does NOT commit on Enter (separator-only commit)", () => {
    const onChange = vi.fn();
    render(<TokenInput aria-label="Recipients" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.input(input, { target: { value: "foo" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
    expect(tokenLabels()).toEqual([]);
    expect(input.value).toBe("foo");
  });

  it("commits multiple tokens from pasted comma-separated text", () => {
    const onChange = vi.fn();
    render(<TokenInput aria-label="Recipients" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    // Pasting yields a single input event whose value contains the commas.
    fireEvent.input(input, { target: { value: "a@x.com, b@y.com" } });

    expect(onChange).toHaveBeenCalledWith(["a@x.com", "b@y.com"]);
    expect(tokenLabels()).toEqual(["a@x.com", "b@y.com"]);
    expect(input.value).toBe("");
  });

  it("trims whitespace and drops empty pieces on commit", () => {
    render(<TokenInput aria-label="Recipients" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "  foo  , , bar ," } });
    expect(tokenLabels()).toEqual(["foo", "bar"]);
  });

  it("drops case-insensitive duplicates (existing and within a batch)", () => {
    render(<TokenInput aria-label="Recipients" defaultValue={["Foo"]} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "foo, BAR, bar," } });
    // "foo" dupes existing "Foo"; second "bar" dupes the first "BAR".
    expect(tokenLabels()).toEqual(["Foo", "BAR"]);
  });

  // --- Validation ("flag but allow", opt-in) ---

  it("flags nothing when no validate is given (generic default)", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["anything", "!!!", "@@"]}
      />,
    );
    document.querySelectorAll("[data-slot=token]").forEach((el) => {
      expect(el).not.toHaveAttribute("data-invalid");
    });
  });

  it("flags failing tokens (kept, data-invalid) but not passing ones", () => {
    const validate = (t: string) => t !== "bad";
    render(
      <TokenInput
        aria-label="Recipients"
        validate={validate}
        defaultValue={["good", "bad"]}
      />,
    );
    const tokens = document.querySelectorAll("[data-slot=token]");
    expect(tokens).toHaveLength(2); // bad is KEPT, not blocked
    expect(tokens[0]).not.toHaveAttribute("data-invalid");
    expect(tokens[1]).toHaveAttribute("data-invalid", "true");
    // Flagged token recolours to the destructive accent.
    const badLabel = tokens[1].querySelector("[data-slot=token-label]");
    expect(badLabel?.className).toContain(
      "text-input-destructive-foreground-accent",
    );
  });

  // --- Removal ---

  it("removes a token via its ✕ button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["ada@acme.com", "grace@acme.com"]}
        onChange={onChange}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Remove ada@acme.com" }),
    );
    expect(onChange).toHaveBeenCalledWith(["grace@acme.com"]);
    expect(tokenLabels()).toEqual(["grace@acme.com"]);
  });

  it("removes the last token on Backspace when the draft is empty", () => {
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["a", "b"]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(tokenLabels()).toEqual(["a"]);
  });

  it("does NOT remove a token on Backspace when the draft is non-empty", () => {
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["a", "b"]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "x" } });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).not.toHaveBeenCalled();
    expect(tokenLabels()).toEqual(["a", "b"]);
  });

  // --- Badge interaction: hover, focus ring, keyboard removal ---

  it("makes each badge focusable (tabIndex 0), but not when disabled", () => {
    const { rerender } = render(
      <TokenInput aria-label="Recipients" defaultValue={["ada@acme.com"]} />,
    );
    expect(document.querySelector("[data-slot=token]")).toHaveAttribute(
      "tabindex",
      "0",
    );
    rerender(
      <TokenInput
        aria-label="Recipients"
        disabled
        defaultValue={["ada@acme.com"]}
      />,
    );
    expect(document.querySelector("[data-slot=token]")).not.toHaveAttribute(
      "tabindex",
    );
  });

  it("carries the standard focus-visible ring on the whole badge", () => {
    render(<TokenInput aria-label="Recipients" defaultValue={["x"]} />);
    const cls =
      (document.querySelector("[data-slot=token]") as HTMLElement).className ??
      "";
    expect(cls).toContain("focus-visible:outline-2");
    expect(cls).toContain("focus-visible:outline-offset-2");
    expect(cls).toContain("focus-visible:outline-focus");
  });

  it("does not give the ✕ its own tab stop or ring (ring is on the badge)", () => {
    render(<TokenInput aria-label="Recipients" defaultValue={["x"]} />);
    const btn = screen.getByRole("button", { name: "Remove x" });
    expect(btn).toHaveAttribute("tabindex", "-1");
    expect(btn.className).not.toContain("focus-visible:outline");
  });

  it("fills the badge with card-accent on hover and focus", () => {
    render(<TokenInput aria-label="Recipients" defaultValue={["x"]} />);
    const cls = (document.querySelector("[data-slot=token]") as HTMLElement)
      .className;
    expect(cls).toContain("hover:bg-card-accent");
    expect(cls).toContain("focus-visible:bg-card-accent");
  });

  it("recolours the ✕ to card-foreground on badge hover/focus", () => {
    render(<TokenInput aria-label="Recipients" defaultValue={["x"]} />);
    const cls = screen.getByRole("button", { name: "Remove x" }).className;
    expect(cls).toContain("group-hover:text-card-foreground");
    expect(cls).toContain("group-focus-visible:text-card-foreground");
  });

  it("removes the focused badge on Delete", () => {
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["a", "b"]}
        onChange={onChange}
      />,
    );
    const badge = document.querySelector("[data-slot=token]") as HTMLElement;
    fireEvent.keyDown(badge, { key: "Delete" });
    expect(onChange).toHaveBeenCalledWith(["b"]);
    expect(tokenLabels()).toEqual(["b"]);
  });

  it("removes the focused badge on Backspace", () => {
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["a", "b"]}
        onChange={onChange}
      />,
    );
    const badges = document.querySelectorAll("[data-slot=token]");
    fireEvent.keyDown(badges[1] as HTMLElement, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(tokenLabels()).toEqual(["a"]);
  });

  it("does not remove a disabled badge on Delete or Backspace", () => {
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        disabled
        defaultValue={["a"]}
        onChange={onChange}
      />,
    );
    const badge = document.querySelector("[data-slot=token]") as HTMLElement;
    fireEvent.keyDown(badge, { key: "Delete" });
    fireEvent.keyDown(badge, { key: "Backspace" });
    expect(onChange).not.toHaveBeenCalled();
    expect(tokenLabels()).toEqual(["a"]);
  });

  it("returns focus to the input after a keyboard removal", () => {
    render(<TokenInput aria-label="Recipients" defaultValue={["a", "b"]} />);
    const badge = document.querySelector("[data-slot=token]") as HTMLElement;
    badge.focus();
    expect(badge).toHaveFocus();
    fireEvent.keyDown(badge, { key: "Delete" });
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("does not steal focus to the input when clicking a badge body", () => {
    render(
      <TokenInput aria-label="Recipients" defaultValue={["ada@acme.com"]} />,
    );
    const label = document.querySelector(
      "[data-slot=token-label]",
    ) as HTMLElement;
    fireEvent.mouseDown(label);
    expect(screen.getByRole("textbox")).not.toHaveFocus();
  });

  // --- commitOnBlur ---

  it("does not commit the trailing draft on blur by default", () => {
    const onChange = vi.fn();
    render(<TokenInput aria-label="Recipients" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "foo" } });
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(tokenLabels()).toEqual([]);
    expect(input.value).toBe("foo");
  });

  it("commits the trailing draft on blur when commitOnBlur is true", () => {
    const onChange = vi.fn();
    render(
      <TokenInput aria-label="Recipients" commitOnBlur onChange={onChange} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "foo" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(["foo"]);
    expect(tokenLabels()).toEqual(["foo"]);
    expect(input.value).toBe("");
  });

  // --- Controlled / uncontrolled ---

  it("works uncontrolled via defaultValue", () => {
    render(
      <TokenInput aria-label="Recipients" defaultValue={["seed@x.com"]} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(tokenLabels()).toEqual(["seed@x.com"]);
    fireEvent.input(input, { target: { value: "next@x.com," } });
    expect(tokenLabels()).toEqual(["seed@x.com", "next@x.com"]);
  });

  it("works controlled via value + onChange (parent owns the tokens)", () => {
    function Controlled() {
      const [tokens, setTokens] = React.useState<string[]>([]);
      return (
        <TokenInput
          aria-label="Recipients"
          value={tokens}
          onChange={setTokens}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "hi@x.com," } });
    expect(tokenLabels()).toEqual(["hi@x.com"]);
  });

  it("does not mutate its own tokens when controlled and the parent ignores onChange", () => {
    // A controlled consumer that never updates `value` keeps the rendered tokens
    // pinned to the prop (component holds no fallback token state in that mode).
    render(
      <TokenInput
        aria-label="Recipients"
        value={["fixed@x.com"]}
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "new@x.com," } });
    expect(tokenLabels()).toEqual(["fixed@x.com"]);
  });

  // --- Disabled ---

  it("disables the input and the token remove buttons", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        disabled
        defaultValue={["ada@acme.com"]}
      />,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Remove ada@acme.com" }),
    ).toBeDisabled();
  });

  it("does not accept typing when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TokenInput aria-label="Recipients" disabled onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "foo,");
    expect(onChange).not.toHaveBeenCalled();
    expect(tokenLabels()).toEqual([]);
  });

  it("mutes the badge label when disabled (Figma disabled badge)", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        disabled
        defaultValue={["ada@acme.com"]}
      />,
    );
    const label = document.querySelector(
      "[data-slot=token-label]",
    ) as HTMLElement;
    expect(label.className).toContain("text-card-foreground-muted");
    expect(label.className.split(/\s+/)).not.toContain("text-card-foreground");
  });

  it("disabled wins over invalid (a disabled badge is muted, not destructive)", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        disabled
        validate={() => false}
        defaultValue={["nope"]}
      />,
    );
    const badge = document.querySelector("[data-slot=token]") as HTMLElement;
    const label = badge.querySelector("[data-slot=token-label]") as HTMLElement;
    const x = badge.querySelector("[data-slot=token-remove]") as HTMLElement;
    expect(label.className).toContain("text-card-foreground-muted");
    expect(label.className).not.toContain(
      "text-input-destructive-foreground-accent",
    );
    expect(x.className).not.toContain(
      "text-input-destructive-foreground-accent",
    );
  });

  // --- Error (field-level) ---

  it("sets aria-invalid and the destructive field border on error", () => {
    render(<TokenInput aria-label="Recipients" error />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    const field = document.querySelector("[data-slot=token-input-field]");
    expect(field?.className).toContain(
      "border-input-destructive-foreground-accent",
    );
  });

  it("does not set aria-invalid when not in error", () => {
    render(<TokenInput aria-label="Recipients" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  // --- Field composition / focus model (reuse inputVariants only) ---

  it("reuses the field variation styling (bg/border/rounded) with layout overrides", () => {
    render(<TokenInput aria-label="Recipients" />);
    const field = document.querySelector("[data-slot=token-input-field]");
    const cls = field?.className ?? "";
    expect(cls).toContain("bg-input-background");
    expect(cls).toContain("border-input-border");
    expect(cls).toContain("rounded-sm");
    // Layout overrides win (tailwind-merge last-wins): wrap + grow, uniform inset.
    expect(cls).toContain("flex-wrap");
    expect(cls).toContain("min-h-10");
    expect(cls.split(/\s+/)).toContain("p-2");
    // Input's fixed h-10 and px-3 are overridden away.
    expect(cls.split(/\s+/)).not.toContain("h-10");
    expect(cls.split(/\s+/)).not.toContain("px-3");
  });

  it("signals focus via focus-within (no system ring on the field)", () => {
    render(<TokenInput aria-label="Recipients" />);
    const field = document.querySelector("[data-slot=token-input-field]");
    const cls = field?.className ?? "";
    expect(cls).toContain("focus-within:border-input-border-accent");
    expect(cls).not.toMatch(/outline-/);
    expect(cls).not.toContain("focus-visible");
  });

  it("focuses the input when clicking empty field chrome", () => {
    render(
      <TokenInput aria-label="Recipients" defaultValue={["ada@acme.com"]} />,
    );
    const field = document.querySelector(
      "[data-slot=token-input-field]",
    ) as HTMLElement;
    fireEvent.mouseDown(field);
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("clicking a token ✕ does not steal focus to the input (it removes)", () => {
    const onChange = vi.fn();
    render(
      <TokenInput
        aria-label="Recipients"
        defaultValue={["ada@acme.com"]}
        onChange={onChange}
      />,
    );
    const removeBtn = screen.getByRole("button", {
      name: "Remove ada@acme.com",
    });
    // mousedown on the ✕ must be ignored by the field's focus handler…
    fireEvent.mouseDown(removeBtn);
    expect(screen.getByRole("textbox")).not.toHaveFocus();
    // …and the click still removes.
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("forwards className to the input and fieldClassName to the field", () => {
    render(
      <TokenInput
        aria-label="Recipients"
        className="input-custom"
        fieldClassName="field-custom"
      />,
    );
    expect(screen.getByRole("textbox").className).toContain("input-custom");
    expect(
      document.querySelector("[data-slot=token-input-field]")?.className,
    ).toContain("field-custom");
  });

  // --- Accessibility (axe) ---

  it("has no axe violations (default)", async () => {
    const { container } = render(
      <TokenInput label="Invite teammates" hint="Comma separated" />,
    );
    await checkA11y(container);
  });

  it("has no axe violations (with tokens)", async () => {
    const { container } = render(
      <TokenInput
        label="Invite teammates"
        defaultValue={["ada@acme.com", "grace@acme.com"]}
      />,
    );
    // Each ✕ has an accessible name.
    expect(
      within(container).getByRole("button", { name: "Remove ada@acme.com" }),
    ).toBeInTheDocument();
    await checkA11y(container);
  });

  it("has no axe violations (invalid-flagged tokens)", async () => {
    const { container } = render(
      <TokenInput
        label="Invite teammates"
        validate={(t) => t.includes("@")}
        defaultValue={["ada@acme.com", "not-an-email"]}
      />,
    );
    await checkA11y(container);
  });

  it("has no axe violations (error state)", async () => {
    const { container } = render(
      <TokenInput
        label="Invite teammates"
        error
        hint="At least one recipient is required"
        defaultValue={["ada@acme.com"]}
      />,
    );
    await checkA11y(container);
  });
});
