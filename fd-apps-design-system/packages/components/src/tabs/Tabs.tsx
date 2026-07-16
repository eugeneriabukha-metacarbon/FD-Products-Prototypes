"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import {
  tabsContentVariants,
  tabsListVariants,
  tabsRootVariants,
  tabsTriggerVariants,
} from "./tabsVariants";

// ── Root context ─────────────────────────────────────────────────────────────

/** A registered trigger — its value, disabled flag, and DOM node (for roving). */
interface TabRegistration {
  value: string;
  disabled: boolean;
  node: HTMLButtonElement;
}

interface TabsContextValue {
  /** The selected value, or `undefined` when nothing is selected. */
  value: string | undefined;
  /** Select a tab (commits through the controlled/uncontrolled model). */
  select: (value: string) => void;
  /**
   * The value that owns the roving `tabIndex=0`: the selected tab, or — when
   * nothing is selected — the first enabled tab so the list is `Tab`-reachable.
   */
  tabStopValue: string | undefined;
  /** A trigger registers itself here for roving + tab-stop computation. */
  registerTrigger: (registration: TabRegistration) => void;
  /** A trigger unregisters (by value) on unmount. */
  unregisterTrigger: (value: string) => void;
  /** ArrowLeft/Right/Home/End roving with automatic activation. */
  onTriggerKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  /** Derive a trigger's id from its value (shared with its panel, drift-proof). */
  getTriggerId: (value: string) => string;
  /** Derive a panel's id from its value (shared with its trigger, drift-proof). */
  getPanelId: (value: string) => string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

/** Read the Tabs context, throwing if a part is used outside `Tabs.Root`. */
function useTabsContext(part: string): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (context === null) {
    throw new Error(`${part} must be used within <Tabs.Root>`);
  }
  return context;
}

// ── ref helper ───────────────────────────────────────────────────────────────

/** Assign a node to a ref (object or callback form). */
function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

// ── Root ─────────────────────────────────────────────────────────────────────

export interface TabsRootProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue"
> {
  /** Controlled selected value. Pair with `onValueChange`. */
  value?: string;
  /**
   * Uncontrolled initial value. Ignored when `value` is provided. If both are
   * omitted, no tab is selected initially (all panels hidden).
   */
  defaultValue?: string;
  /** Called with the next value whenever selection changes. */
  onValueChange?: (value: string) => void;
}

/**
 * State owner + context provider for the compound `Tabs`. Renders a plain
 * `<div>` (no landmark role). Owns the single-`string` selection model
 * (controlled via `value`/`onValueChange`, or uncontrolled via `defaultValue`),
 * the roving tab-stop computation, and the arrow-key handler with automatic
 * activation. Forwards `ref` to the container.
 */
function TabsRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  children,
  ref,
  ...props
}: TabsRootProps) {
  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | undefined
  >(defaultValue);
  const value = isControlled ? valueProp : uncontrolledValue;

  const select = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  // Ids are derived deterministically from a single generated base + the tab's
  // value, so a trigger and its panel always compute the SAME pair (they share
  // only `value`, with no `Item` wrapper to hold a `useId`). Drift-proof.
  const baseId = React.useId();
  const getTriggerId = (tabValue: string) => `${baseId}-tab-${tabValue}`;
  const getPanelId = (tabValue: string) => `${baseId}-panel-${tabValue}`;

  // Trigger registry. State (not a ref) so the roving `tabIndex` recomputes
  // reactively when triggers mount/unmount or toggle `disabled`. Registration
  // order tracks DOM order for a static list; navigation re-sorts by DOM
  // position defensively (see `onTriggerKeyDown`).
  const [triggers, setTriggers] = React.useState<TabRegistration[]>([]);
  const registerTrigger = React.useCallback((registration: TabRegistration) => {
    setTriggers((prev) => {
      const existing = prev.findIndex((t) => t.value === registration.value);
      if (existing === -1) return [...prev, registration];
      const next = [...prev];
      next[existing] = registration;
      return next;
    });
  }, []);
  const unregisterTrigger = React.useCallback((tabValue: string) => {
    setTriggers((prev) => prev.filter((t) => t.value !== tabValue));
  }, []);

  // Triggers in DOM order (defensive against registration-order drift).
  const domOrdered = [...triggers].sort((a, b) =>
    a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1,
  );
  const firstEnabled = domOrdered.find((t) => !t.disabled)?.value;
  // The selected tab owns the tab stop; with no selection it falls to the first
  // enabled tab so the list stays reachable by `Tab`.
  const tabStopValue = value ?? firstEnabled;

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    const enabled = domOrdered.filter((t) => !t.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex(
      (t) => t.node === event.currentTarget,
    );
    if (currentIndex === -1) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = enabled.length - 1;
        break;
    }
    const target = enabled[nextIndex];
    if (!target) return;
    // Automatic activation: focus moves AND selection follows immediately.
    target.node.focus();
    select(target.value);
  };

  const contextValue: TabsContextValue = {
    value,
    select,
    tabStopValue,
    registerTrigger,
    unregisterTrigger,
    onTriggerKeyDown,
    getTriggerId,
    getPanelId,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="tabs"
        className={cn(tabsRootVariants(), className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ── List ─────────────────────────────────────────────────────────────────────

export interface TabsListProps extends React.ComponentProps<"div"> {}

/**
 * The horizontal row of triggers — `role="tablist"`. Provide an accessible name
 * via `aria-label` or `aria-labelledby` when there is no visible label.
 * Forwards `ref` to the tablist.
 */
function TabsList({ className, children, ref, ...props }: TabsListProps) {
  useTabsContext("Tabs.List");
  return (
    <div
      ref={ref}
      role="tablist"
      data-slot="tabs-list"
      className={cn(tabsListVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Trigger ──────────────────────────────────────────────────────────────────

export interface TabsTriggerProps extends React.ComponentProps<"button"> {
  /** **Required.** Ties the tab to its panel (and to the selection model). */
  value: string;
}

/**
 * One tab — `role="tab"`, a native `<button type="button">`. `children` is the
 * label (and any leading icon, which inherits the per-state text color via
 * `currentColor`). Wires `aria-selected`, roving `tabIndex`, and — only while
 * its panel is mounted — `aria-controls`. Composes the consumer's
 * `onClick`/`onKeyDown` (theirs runs first; the built-in behaviour is skipped
 * if they call `preventDefault`). Forwards `ref` to the button.
 */
function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: TabsTriggerProps) {
  const {
    value: selectedValue,
    select,
    tabStopValue,
    registerTrigger,
    unregisterTrigger,
    onTriggerKeyDown,
    getTriggerId,
    getPanelId,
  } = useTabsContext("Tabs.Trigger");

  const selected = value === selectedValue;
  const triggerId = getTriggerId(value);
  const panelId = getPanelId(value);

  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const setButtonRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    setRef(ref as React.Ref<HTMLButtonElement>, node);
  };

  // Register for roving + tab-stop computation. Re-runs when `disabled` changes
  // so the tab stop and arrow-key skip list stay accurate.
  React.useEffect(() => {
    const node = buttonRef.current;
    if (!node) return;
    registerTrigger({ value, disabled, node });
    return () => unregisterTrigger(value);
  }, [registerTrigger, unregisterTrigger, value, disabled]);

  return (
    <button
      {...props}
      ref={setButtonRef}
      type="button"
      role="tab"
      id={triggerId}
      data-slot="tabs-trigger"
      data-state={selected ? "active" : "inactive"}
      data-disabled={disabled || undefined}
      aria-selected={selected}
      // Only reference the panel while it is rendered — inactive panels are
      // unmounted, so a dangling `aria-controls` id would be invalid.
      aria-controls={selected ? panelId : undefined}
      // Roving tabindex: the tab stop is focusable, all others are removed from
      // the tab sequence (arrow keys move between them instead).
      tabIndex={value === tabStopValue ? 0 : -1}
      disabled={disabled}
      className={cn(tabsTriggerVariants({ selected, disabled }), className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select(value);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) onTriggerKeyDown(event);
      }}
    >
      {children}
    </button>
  );
}

// ── Content ──────────────────────────────────────────────────────────────────

export interface TabsContentProps extends React.ComponentProps<"div"> {
  /** **Required.** Matches the `value` of the trigger this panel belongs to. */
  value: string;
}

/**
 * A tab panel — `role="tabpanel"`, labelled by its trigger. Rendered **only
 * when its tab is selected**; inactive panels are unmounted, so their content
 * leaves the a11y tree and tab order (matching `Accordion.Content`). It is a
 * focus stop (`tabIndex=0`) so keyboard users can reach its content. Forwards
 * `ref` to the panel.
 */
function TabsContent({
  value,
  className,
  children,
  ref,
  ...props
}: TabsContentProps) {
  const {
    value: selectedValue,
    getTriggerId,
    getPanelId,
  } = useTabsContext("Tabs.Content");

  if (value !== selectedValue) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={getPanelId(value)}
      aria-labelledby={getTriggerId(value)}
      data-slot="tabs-content"
      data-state="active"
      tabIndex={0}
      className={cn(tabsContentVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Compound export ──────────────────────────────────────────────────────────

/**
 * Compound underline-indicator `Tabs` (WAI-ARIA Tabs pattern, single selection,
 * horizontal, automatic activation). Assemble from its namespaced parts:
 *
 * ```tsx
 * <Tabs.Root defaultValue="overview">
 *   <Tabs.List aria-label="Account sections">
 *     <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
 *     <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="overview">…</Tabs.Content>
 *   <Tabs.Content value="activity">…</Tabs.Content>
 * </Tabs.Root>
 * ```
 */
const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};

export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent };
