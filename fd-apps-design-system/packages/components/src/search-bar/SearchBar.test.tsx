import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "./SearchBar";

// --- Accessibility helper (mirrors the Input / applypass suite) ---
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description}`)
      .join("\n");
    throw new Error(`axe violations:\n${messages}`);
  }
}

/**
 * Debounce is timer-driven, so those tests use vitest fake timers and drive the
 * input with `fireEvent` (synchronous — unlike `userEvent`, it doesn't wait on
 * real inter-keystroke timers that the fake clock never auto-advances). axe
 * tests run on REAL timers (axe schedules its own timers internally).
 */
describe("SearchBar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Rendering ---

  it("renders a search input with the leading search icon", () => {
    const { container } = render(<SearchBar aria-label="Search" />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("type", "search");
    // Leading decorative icon lives in the (aria-hidden) leading slot.
    const leading = container.querySelector("[data-slot=input-leading] svg");
    expect(leading).toBeInTheDocument();
  });

  it("suppresses the browser's native type=search clear button", () => {
    // We render our own clear button; the native `::-webkit-search-cancel-button`
    // would otherwise show a second "X". jsdom can't render the pseudo-element,
    // so assert the suppressing utility is applied to the input.
    render(<SearchBar aria-label="Search" />);
    const input = screen.getByRole("searchbox");
    expect(input.className).toContain(
      "[&::-webkit-search-cancel-button]:hidden",
    );
  });

  // --- Debounced onSearch vs immediate onChange ---

  it("does not fire onSearch until after debounceMs, then fires once with the final value", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <SearchBar aria-label="Search" onSearch={onSearch} debounceMs={300} />,
    );
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("abc");
  });

  it("fires onChange immediately on every keystroke (native source of truth)", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchBar aria-label="Search" onChange={onChange} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("uses a 300ms default debounce", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar aria-label="Search" onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "x" } });
    vi.advanceTimersByTime(299);
    expect(onSearch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("x");
  });

  // --- Clear button visibility ---

  it("hides the clear button when empty and shows it when there's a value", () => {
    render(<SearchBar aria-label="Search" />);
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "a" } });
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
  });

  it("does not show the clear button when disabled even with a value", () => {
    render(<SearchBar aria-label="Search" defaultValue="hello" disabled />);
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("shows the clear button for an uncontrolled defaultValue at mount", () => {
    render(<SearchBar aria-label="Search" defaultValue="seed" />);
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
  });

  // --- Clear behaviour ---

  it("clears the field, focuses the input, and fires onSearch('') immediately", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <SearchBar
        aria-label="Search"
        defaultValue="hello"
        onSearch={onSearch}
        debounceMs={300}
      />,
    );
    const input = screen.getByRole("searchbox") as HTMLInputElement;

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(input.value).toBe("");
    expect(input).toHaveFocus();
    // Immediate (not debounced).
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("");
    // No trailing debounced fire afterwards.
    vi.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledTimes(1);
    // Button is gone once empty.
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("cancels a pending debounced search when cleared", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <SearchBar
        aria-label="Search"
        defaultValue="a"
        onSearch={onSearch}
        debounceMs={300}
      />,
    );
    const input = screen.getByRole("searchbox");
    // Start a pending debounce…
    fireEvent.change(input, { target: { value: "ab" } });
    // …then clear before it fires.
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    vi.advanceTimersByTime(300);
    // Only the immediate onSearch("") from clear — the "ab" debounce was cancelled.
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("");
  });

  it("fires the consumer's onChange when cleared (controlled consumers update)", () => {
    function Controlled() {
      const [value, setValue] = React.useState("hello");
      return (
        <SearchBar
          aria-label="Search"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("hello");

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    // The synthesized native event drove the controlled parent's state to "".
    expect(input.value).toBe("");
  });

  // --- Enter flush ---

  it("flushes the pending search immediately on Enter", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <SearchBar aria-label="Search" onSearch={onSearch} debounceMs={300} />,
    );
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "abc" } });
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    // Fired now with the current value, without waiting for the timer.
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("abc");

    // The pending debounce was cancelled → no second fire.
    vi.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  // --- Controlled / uncontrolled ---

  it("works uncontrolled via defaultValue", () => {
    render(<SearchBar aria-label="Search" defaultValue="ab" />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("ab");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(input.value).toBe("abc");
  });

  it("works controlled via value + onChange", () => {
    function Controlled() {
      const [value, setValue] = React.useState("");
      return (
        <SearchBar
          aria-label="Search"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hi" } });
    expect(input.value).toBe("hi");
    // Clear button appears once the controlled value is non-empty.
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
  });

  // --- ref forwarding ---

  it("forwards ref to the underlying input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<SearchBar aria-label="Search" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute("type", "search");
  });

  // --- Clear button accessibility / keyboard ---

  it("clear button has an accessible name and is keyboard-operable", () => {
    const onSearch = vi.fn();
    render(
      <SearchBar
        aria-label="Search"
        defaultValue="hello"
        onSearch={onSearch}
      />,
    );
    const button = screen.getByRole("button", { name: "Clear search" });
    button.focus();
    expect(button).toHaveFocus();
    // A real <button> activates on Enter/Space via a click; assert the click path
    // (the same handler keyboard activation triggers) clears + fires onSearch("").
    fireEvent.click(button);
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("clear button carries the standard focus-visible ring utilities", () => {
    render(<SearchBar aria-label="Search" defaultValue="x" />);
    const button = screen.getByRole("button", { name: "Clear search" });
    const cls = button.className;
    expect(cls).toContain("focus-visible:outline-2");
    expect(cls).toContain("focus-visible:outline-offset-2");
    expect(cls).toContain("focus-visible:outline-focus");
  });

  it("forwards hint to the underlying Input (via aria-describedby)", () => {
    render(<SearchBar aria-label="Search" hint="Type to search" />);
    const input = screen.getByRole("searchbox");
    const describedby = input.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    expect(document.getElementById(describedby as string)).toHaveTextContent(
      "Type to search",
    );
  });

  it("does not accept an `error` prop (removed from the type)", () => {
    // Type-level guarantee: `error` is not part of SearchBarProps (search has no
    // invalid state — "no results" is an empty state shown elsewhere). Enforced
    // by `npm run typecheck`; the @ts-expect-error fails the build if re-added.
    const props: React.ComponentProps<typeof SearchBar> = {
      "aria-label": "Search",
      // @ts-expect-error `error` is intentionally not a SearchBar prop
      error: true,
    };
    render(<SearchBar {...props} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  // --- Accessibility (axe, real timers) ---

  it("has no axe violations (empty)", async () => {
    const { container } = render(<SearchBar aria-label="Search" />);
    await checkA11y(container);
  });

  it("has no axe violations (with value + clear button)", async () => {
    const { container } = render(
      <SearchBar aria-label="Search" defaultValue="query" />,
    );
    // The clear button is present here.
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
    await checkA11y(container);
  });
});
