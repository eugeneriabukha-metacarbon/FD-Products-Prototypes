import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedCallback } from "./use-debounced-callback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays the call until after delayMs and fires once with the final args", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });
    // Nothing yet — the trailing call is pending.
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(299));
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("keeps a stable identity across renders", () => {
    const { result, rerender } = renderHook(
      ({ fn }) => useDebouncedCallback(fn, 300),
      { initialProps: { fn: vi.fn() } },
    );
    const first = result.current;
    rerender({ fn: vi.fn() });
    expect(result.current).toBe(first);
  });

  it("always calls the LATEST fn (no stale closure)", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ fn }) => useDebouncedCallback(fn, 300),
      { initialProps: { fn: first } },
    );

    act(() => result.current("x"));
    // Swap the fn while the timer is still pending.
    rerender({ fn: second });
    act(() => vi.advanceTimersByTime(300));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith("x");
  });

  it("cancel() drops a pending call", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => result.current("a"));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(300));

    expect(fn).not.toHaveBeenCalled();
  });

  it("flush() fires the latest fn immediately and cancels the pending timer", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => result.current("pending"));
    act(() => result.current.flush("now"));

    // Fired immediately with the flush args…
    expect(fn).toHaveBeenCalledExactlyOnceWith("now");

    // …and the earlier pending call was cancelled (no double fire).
    act(() => vi.advanceTimersByTime(300));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("clears the pending timer on unmount (fn cannot fire after teardown)", () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => result.current("a"));
    unmount();
    act(() => vi.advanceTimersByTime(300));

    expect(fn).not.toHaveBeenCalled();
  });

  it("uses the latest delay for the next scheduled call", () => {
    const fn = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(fn, delay),
      { initialProps: { delay: 300 } },
    );

    rerender({ delay: 100 });
    act(() => result.current("a"));
    act(() => vi.advanceTimersByTime(100));

    expect(fn).toHaveBeenCalledExactlyOnceWith("a");
  });
});
