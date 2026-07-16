import * as React from "react";

/**
 * The stable debounced function returned by {@link useDebouncedCallback}. It has
 * the same parameter list as the wrapped `fn` (its return value is discarded —
 * the real call is deferred), plus timer-control methods:
 *
 * - `.cancel()` drops any pending trailing call without invoking `fn`.
 * - `.flush(...args)` invokes the LATEST `fn` immediately and cancels the timer.
 *   Pass the args to fire with; nothing is remembered from prior calls (the hook
 *   holds no arg state — see the shape rationale below).
 */
export interface DebouncedCallback<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancel a pending trailing call (no-op if nothing is scheduled). */
  cancel: () => void;
  /**
   * Fire the latest `fn` right now with the given args and cancel the pending
   * timer. Useful for "commit immediately" affordances (e.g. Enter to search).
   */
  flush: (...args: Args) => void;
}

/**
 * `useDebouncedCallback(fn, delayMs)` — a trailing-edge debounce that returns a
 * STABLE callback (identity never changes across renders) with `.cancel()` and
 * `.flush()` methods.
 *
 * Shape rationale: a single callable-with-methods object (not a
 * `[fn, { cancel, flush }]` tuple) keeps call sites reading like the function
 * they replace (`debounced(value)`, `debounced.flush(value)`), matches the
 * `lodash.debounce` mental model consumers already have, and lets the whole
 * thing be one stable reference — no tuple destructuring, no second stable
 * object to thread through deps.
 *
 * Correctness guarantees:
 * - **Always calls the LATEST `fn`.** `fn` is stored in a ref updated every
 *   render, so a timer scheduled with an old `fn` still fires the current one —
 *   no stale-closure bugs even when `fn` is an inline arrow.
 * - **Stable identity.** The returned callback is created once (`useMemo` with
 *   no reactive deps) and reads `fn`/`delay` from refs, so it never needs to be
 *   in a consumer's effect deps and never re-subscribes downstream.
 * - **Cleans up on unmount.** A pending timer is cleared when the component
 *   unmounts, so `fn` can't fire after teardown.
 *
 * The `useRef`/`useEffect`/`useMemo` here is structural timer management, not
 * premature memoization: the debounce contract *requires* a persistent timer id
 * and a live `fn` reference across renders.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): DebouncedCallback<Args> {
  // Latest `fn` + `delay`, refreshed every render so a running timer never fires
  // a stale closure and a delay change takes effect on the next scheduled call.
  const fnRef = React.useRef(fn);
  const delayRef = React.useRef(delayMs);
  fnRef.current = fn;
  delayRef.current = delayMs;

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = React.useMemo<DebouncedCallback<Args>>(() => {
    const clear = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const call: DebouncedCallback<Args> = (...args: Args) => {
      clear();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fnRef.current(...args);
      }, delayRef.current);
    };

    call.cancel = clear;

    call.flush = (...args: Args) => {
      clear();
      fnRef.current(...args);
    };

    return call;
    // Empty deps: the callback reads everything mutable from refs, so it is
    // created exactly once and keeps a stable identity for the lifetime of the
    // component.
  }, []);

  // Clear any pending timer on unmount so `fn` can't fire after teardown.
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return debounced;
}
