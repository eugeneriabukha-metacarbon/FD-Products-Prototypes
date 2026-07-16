"use client";

import * as React from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import {
  accordionContentVariants,
  accordionItemVariants,
  accordionRootVariants,
  accordionTriggerIconVariants,
  accordionTriggerTitleVariants,
  accordionTriggerVariants,
} from "./accordionVariants";

// ── Value shapes ─────────────────────────────────────────────────────────────

/** Open model in `single` mode: the open item's value, or `null` for none. */
export type AccordionSingleValue = string | null;
/** Open model in `multiple` mode: the set of open item values. */
export type AccordionMultipleValue = string[];
/** The open model — a `string | null` in `single`, a `string[]` in `multiple`. */
export type AccordionValue = AccordionSingleValue | AccordionMultipleValue;

// ── Root context ─────────────────────────────────────────────────────────────

interface AccordionContextValue {
  /** Selection mode. */
  type: "single" | "multiple";
  /** Whether the item with this value is currently open. */
  isOpen: (value: string) => boolean;
  /** Toggle the item with this value through the mode's open rules. */
  toggle: (value: string) => void;
  /** A trigger registers its button node here for arrow-key roving. */
  registerTrigger: (node: HTMLButtonElement) => void;
  /** A trigger unregisters on unmount. */
  unregisterTrigger: (node: HTMLButtonElement) => void;
  /** Arrow/Home/End roving across triggers — attached to each trigger's `onKeyDown`. */
  onTriggerKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null,
);

/** Read the Accordion root context, throwing if a part is used outside `Accordion.Root`. */
function useAccordionContext(part: string): AccordionContextValue {
  const context = React.useContext(AccordionContext);
  if (context === null) {
    throw new Error(`${part} must be used within <Accordion.Root>`);
  }
  return context;
}

// ── Item context ─────────────────────────────────────────────────────────────

interface AccordionItemContextValue {
  /** This item's value in the root open model. */
  value: string;
  /** Whether this item is open. */
  open: boolean;
  /** Whether this item is disabled (trigger inert, row dimmed). */
  disabled: boolean;
  /** Generated id shared by the trigger (`id`) and content (`aria-labelledby`). */
  triggerId: string;
  /** Generated id shared by the content (`id`) and trigger (`aria-controls`). */
  contentId: string;
}

const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

/** Read the Accordion item context, throwing if a part is used outside `Accordion.Item`. */
function useAccordionItemContext(part: string): AccordionItemContextValue {
  const context = React.useContext(AccordionItemContext);
  if (context === null) {
    throw new Error(`${part} must be used within <Accordion.Item>`);
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

export interface AccordionRootProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue"
> {
  /**
   * Selection mode. `single` = at most one item open (opening one closes the
   * previously open item); `multiple` = each item toggles independently.
   * Default `"single"`.
   */
  type?: "single" | "multiple";
  /**
   * Controlled open model. `string | null` in `single` mode; `string[]` in
   * `multiple`. When provided, the component is controlled — pair with
   * `onValueChange`.
   */
  value?: AccordionValue;
  /**
   * Uncontrolled initial open model (same shape rule as `value`). Ignored when
   * `value` is provided. Defaults to `null` (single) / `[]` (multiple).
   */
  defaultValue?: AccordionValue;
  /** Called with the next open model whenever an item toggles. */
  onValueChange?: (value: AccordionValue) => void;
  /**
   * `single` mode only: when `true` (default) the open item can be re-triggered
   * to close, leaving nothing open. Ignored in `multiple` mode (always
   * collapsible).
   */
  collapsible?: boolean;
}

/**
 * State owner + context provider for the compound `Accordion`. Renders a plain
 * `<div>` (no landmark role — an accordion is not itself a landmark). Owns the
 * open-item model (controlled via `value`/`onValueChange`, or uncontrolled via
 * `defaultValue`) and the arrow-key roving over its triggers. Forwards `ref` to
 * the container.
 */
function AccordionRoot({
  type = "single",
  value: valueProp,
  defaultValue,
  onValueChange,
  collapsible = true,
  className,
  children,
  ref,
  ...props
}: AccordionRootProps) {
  const isMultiple = type === "multiple";
  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<AccordionValue>(() =>
      defaultValue !== undefined ? defaultValue : isMultiple ? [] : null,
    );
  const openModel = isControlled ? valueProp : uncontrolledValue;

  const commit = (next: AccordionValue) => {
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  const isOpen = (itemValue: string) =>
    isMultiple
      ? Array.isArray(openModel) && openModel.includes(itemValue)
      : openModel === itemValue;

  const toggle = (itemValue: string) => {
    if (isMultiple) {
      const current = Array.isArray(openModel) ? openModel : [];
      commit(
        current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue],
      );
      return;
    }
    const current = Array.isArray(openModel) ? null : openModel;
    if (current === itemValue) {
      // Re-triggering the open item: close it only when collapsible, otherwise
      // leave it open (single non-collapsible always keeps one item open).
      commit(collapsible ? null : itemValue);
    } else {
      commit(itemValue);
    }
  };

  // Trigger registry for arrow-key roving. `register`/`unregister` are consumed
  // in each trigger's mount effect dependency array, so they need stable
  // identity — the "structural reason" the authoring pattern allows useCallback.
  const triggersRef = React.useRef<Set<HTMLButtonElement>>(new Set());
  const registerTrigger = React.useCallback((node: HTMLButtonElement) => {
    triggersRef.current.add(node);
  }, []);
  const unregisterTrigger = React.useCallback((node: HTMLButtonElement) => {
    triggersRef.current.delete(node);
  }, []);

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    // Read the registry, drop disabled (unfocusable) triggers, and order by DOM
    // position so navigation follows visual order regardless of mount order.
    const triggers = Array.from(triggersRef.current)
      .filter((el) => !el.disabled)
      .sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );
    if (triggers.length === 0) return;
    const currentIndex = triggers.indexOf(event.currentTarget);
    if (currentIndex === -1) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % triggers.length;
        break;
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = triggers.length - 1;
        break;
    }
    triggers[nextIndex]?.focus();
  };

  const contextValue: AccordionContextValue = {
    type,
    isOpen,
    toggle,
    registerTrigger,
    unregisterTrigger,
    onTriggerKeyDown,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="accordion"
        className={cn(accordionRootVariants(), className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// ── Item ─────────────────────────────────────────────────────────────────────

export interface AccordionItemProps extends React.ComponentProps<"div"> {
  /** Required — identifies the item in the root open model. */
  value: string;
  /** Dims the row and makes the trigger inert. */
  disabled?: boolean;
}

/**
 * One accordion row. Renders a `<div>` with the Figma bottom divider and a
 * `data-state="open" | "closed"` styling hook. Reads the root context for its
 * open flag and publishes the shared trigger/content ids so the ARIA wiring
 * cannot drift. Forwards `ref` to the row element.
 */
function AccordionItem({
  value,
  disabled = false,
  className,
  children,
  ref,
  ...props
}: AccordionItemProps) {
  const { isOpen } = useAccordionContext("Accordion.Item");
  const open = isOpen(value);

  const reactId = React.useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-content`;

  const itemContext: AccordionItemContextValue = {
    value,
    open,
    disabled,
    triggerId,
    contentId,
  };

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <div
        ref={ref}
        data-slot="accordion-item"
        data-state={open ? "open" : "closed"}
        data-disabled={disabled || undefined}
        className={cn(accordionItemVariants({ disabled }), className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// ── Trigger ──────────────────────────────────────────────────────────────────

export interface AccordionTriggerProps extends React.ComponentProps<"button"> {}

/**
 * The interactive header — a native `<button type="button">` (no heading
 * wrapper; the flat Figma structure and `aria-expanded` carry the semantics).
 * Children are the title text; the Plus/Minus icon is appended by the component.
 * `aria-expanded`/`aria-controls`/`id` wire it to its content, and it registers
 * with the root for arrow-key roving. Composes the consumer's `onClick` (the
 * toggle runs unless the handler calls `preventDefault`). Forwards `ref` to the
 * button.
 */
function AccordionTrigger({
  className,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: AccordionTriggerProps) {
  const { toggle, registerTrigger, unregisterTrigger, onTriggerKeyDown } =
    useAccordionContext("Accordion.Trigger");
  const { value, open, disabled, triggerId, contentId } =
    useAccordionItemContext("Accordion.Trigger");

  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const setButtonRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    setRef(ref as React.Ref<HTMLButtonElement>, node);
  };

  // Register the button for arrow-key roving. Deps are the stable register/
  // unregister callbacks, so this runs once per mount, not on every root render.
  React.useEffect(() => {
    const node = buttonRef.current;
    if (!node) return;
    registerTrigger(node);
    return () => unregisterTrigger(node);
  }, [registerTrigger, unregisterTrigger]);

  return (
    <button
      {...props}
      ref={setButtonRef}
      type="button"
      id={triggerId}
      data-slot="accordion-trigger"
      aria-expanded={open}
      // Only reference the content while it is rendered — closed content is
      // removed from the DOM, so a dangling `aria-controls` id would be invalid.
      aria-controls={open ? contentId : undefined}
      disabled={disabled}
      className={cn(accordionTriggerVariants({ open }), className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle(value);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) onTriggerKeyDown(event);
      }}
    >
      <span
        data-slot="accordion-trigger-title"
        className={accordionTriggerTitleVariants()}
      >
        {children}
      </span>
      <span
        data-slot="accordion-trigger-icon"
        aria-hidden="true"
        className={accordionTriggerIconVariants()}
      >
        {open ? <MinusIcon /> : <PlusIcon />}
      </span>
    </button>
  );
}

// ── Content ──────────────────────────────────────────────────────────────────

export interface AccordionContentProps extends React.ComponentProps<"div"> {}

/**
 * The collapsible region — a `<div role="region">` labelled by its trigger.
 * Show/hide is **instant**: when the item is closed it is not rendered at all,
 * so its content leaves the a11y tree and tab order. Default text is `body-03`
 * muted; the slot accepts arbitrary children. Forwards `ref` to the region.
 */
function AccordionContent({
  className,
  children,
  ref,
  ...props
}: AccordionContentProps) {
  const { open, triggerId, contentId } =
    useAccordionItemContext("Accordion.Content");

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="region"
      id={contentId}
      aria-labelledby={triggerId}
      data-slot="accordion-content"
      data-state="open"
      className={cn(accordionContentVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Compound export ──────────────────────────────────────────────────────────

/**
 * Compound accordion — a vertically stacked set of collapsible sections.
 * Assemble from its namespaced parts:
 *
 * ```tsx
 * <Accordion.Root type="single" defaultValue="a">
 *   <Accordion.Item value="a">
 *     <Accordion.Trigger>Title</Accordion.Trigger>
 *     <Accordion.Content>Description</Accordion.Content>
 *   </Accordion.Item>
 *   <Accordion.Item value="b">
 *     <Accordion.Trigger>Title</Accordion.Trigger>
 *     <Accordion.Content>Description</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion.Root>
 * ```
 */
const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};

export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
