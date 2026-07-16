"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { IconContext, XIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import { scrollbarVariants } from "../lib/scrollbar";
import { useFocusTrap } from "./useFocusTrap";
import {
  dialogBodyVariants,
  dialogCloseButtonVariants,
  dialogContentVariants,
  dialogFooterVariants,
  dialogHeaderIconVariants,
  dialogHeaderTextVariants,
  dialogHeaderVariants,
  dialogOverlayVariants,
} from "./dialogVariants";

// ── Context ──────────────────────────────────────────────────────────────────

interface DialogContextValue {
  /** Whether the dialog is open. */
  open: boolean;
  /** Open/close the dialog — routes through controlled `onOpenChange`. */
  setOpen: (open: boolean) => void;
  /** Whether Escape + backdrop-click close the dialog. */
  dismissable: boolean;
  /** Generated id for the title element (the card's `aria-labelledby`). */
  titleId: string;
  /** Generated id for the description element (the card's `aria-describedby`). */
  descriptionId: string;
  /** Whether a `Dialog.Header` description is present (gates `aria-describedby`). */
  hasDescription: boolean;
  /** Registered by `Dialog.Header` when it renders a description. */
  setHasDescription: (has: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

/** Read the Dialog context, throwing a helpful error if a part is used outside `Dialog.Root`. */
function useDialogContext(part: string): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (context === null) {
    throw new Error(`${part} must be used within <Dialog.Root>`);
  }
  return context;
}

// ── Root ─────────────────────────────────────────────────────────────────────

export interface DialogRootProps {
  /** Controlled open state. Pair with `onOpenChange`. Omit for uncontrolled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Ignored if `open` is provided. */
  defaultOpen?: boolean;
  /** Called with the next open state from trigger/close/Escape/backdrop. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether Escape and a backdrop click dismiss the dialog. `false` forces the
   * user through an explicit control (a footer button / the header X, which
   * always close). Default `true`.
   */
  dismissable?: boolean;
  children?: React.ReactNode;
}

/**
 * State owner + context provider for the compound `Dialog`. Renders no DOM of
 * its own. Controlled via `open`/`onOpenChange`, or uncontrolled via
 * `defaultOpen`. Generates the `aria-labelledby`/`aria-describedby` ids that
 * `Dialog.Header` and `Dialog.Content` share, so the wiring cannot drift.
 */
function DialogRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  dismissable = true,
  children,
}: DialogRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [hasDescription, setHasDescription] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const reactId = React.useId();
  const titleId = `${reactId}-title`;
  const descriptionId = `${reactId}-description`;

  // Stable identity: `setOpen` is consumed in effect dependency arrays (the
  // Escape listener + focus trap) — a fresh identity each render would rebind
  // those listeners needlessly. This is the "structural reason" the authoring
  // pattern allows `useCallback` for.
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value: DialogContextValue = {
    open,
    setOpen,
    dismissable,
    titleId,
    descriptionId,
    hasDescription,
    setHasDescription,
  };

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
}

// ── asChild helper ─────────────────────────────────────────────────────────

/** Assign a node to a ref (object or callback form). */
function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

interface TriggerLikeProps extends Omit<
  React.ComponentProps<"button">,
  "onClick"
> {
  /** Render the single child element as the root instead of a `<button>`. */
  asChild?: boolean;
}

/**
 * Shared renderer for the two open/close controls (`Dialog.Trigger`,
 * `Dialog.Close`). Renders a real `<button>` by default, or clones a single
 * child element when `asChild` (adopting a passed `Button`/anchor, per the
 * repo's `asChild` convention) — merging className, click handlers, ref, and
 * any extra ARIA props onto it. `onActivate` runs after the child's own click.
 */
function TriggerLike({
  asChild = false,
  onActivate,
  dataSlot,
  children,
  className,
  type,
  ...props
}: TriggerLikeProps & {
  onActivate: () => void;
  dataSlot: string;
}) {
  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        `${dataSlot}: \`asChild\` requires a single React element child`,
      );
    }
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    const childOnClick = (
      childProps as { onClick?: React.MouseEventHandler<HTMLElement> }
    ).onClick;
    return React.cloneElement(child, {
      ...props,
      ...childProps,
      "data-slot": dataSlot,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        childOnClick?.(event);
        if (!event.defaultPrevented) onActivate();
      },
      className: cn(className, childProps.className as string | undefined),
      ref: (node: HTMLElement | null) => {
        setRef((childProps as { ref?: React.Ref<HTMLElement> }).ref, node);
      },
    });
  }

  return (
    <button
      type={type ?? "button"}
      data-slot={dataSlot}
      className={className}
      onClick={() => onActivate()}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Trigger ──────────────────────────────────────────────────────────────────

export interface DialogTriggerProps extends TriggerLikeProps {}

/**
 * Optional button that opens the dialog. `asChild` adopts a passed element
 * (e.g. `<Button>`). Wires `aria-haspopup="dialog"` + `aria-expanded`. Skip it
 * for pure controlled usage.
 */
function DialogTrigger({ asChild = false, ...props }: DialogTriggerProps) {
  const { open, setOpen } = useDialogContext("Dialog.Trigger");
  return (
    <TriggerLike
      asChild={asChild}
      dataSlot="dialog-trigger"
      onActivate={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...props}
    />
  );
}

// ── Close ────────────────────────────────────────────────────────────────────

export interface DialogCloseProps extends TriggerLikeProps {}

/**
 * Optional button that closes the dialog (e.g. wrapping a footer Cancel
 * button). `asChild` adopts a passed element. Always closes, independent of
 * `dismissable` (that only gates Escape + backdrop).
 */
function DialogClose({ asChild = false, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext("Dialog.Close");
  return (
    <TriggerLike
      asChild={asChild}
      dataSlot="dialog-close"
      onActivate={() => setOpen(false)}
      {...props}
    />
  );
}

// ── Content ──────────────────────────────────────────────────────────────────

export interface DialogContentProps extends React.ComponentProps<"div"> {}

/**
 * The portaled overlay layer — mounts via `createPortal` → `document.body`
 * (escaping `overflow`/stacking ancestors, like `SelectListbox`) only while
 * open. Renders the backdrop + the centred card, and owns the dialog semantics
 * (`role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby`), the
 * focus trap + return + scroll lock (`useFocusTrap`), Escape, and backdrop
 * dismiss. Forwards `ref` to the card element.
 */
function DialogContent({
  className,
  children,
  ref,
  onKeyDown,
  ...props
}: DialogContentProps) {
  const { open, setOpen, dismissable, titleId, descriptionId, hasDescription } =
    useDialogContext("Dialog.Content");
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  useFocusTrap({ active: open, containerRef: cardRef });

  // Escape closes when dismissable. Listener on document so it fires regardless
  // of where focus sits inside the trapped dialog.
  React.useEffect(() => {
    if (!open || !dismissable) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, dismissable, setOpen]);

  if (!open) return null;

  const setCardRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    setRef(ref as React.Ref<HTMLDivElement>, node);
  };

  return createPortal(
    <div
      data-slot="dialog-overlay"
      className={dialogOverlayVariants()}
      // Close only when the backdrop itself is clicked (not content inside the
      // card), and only when dismissable.
      onClick={(event) => {
        if (dismissable && event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div
        ref={setCardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        data-slot="dialog-content"
        className={cn(dialogContentVariants(), className)}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

export interface DialogHeaderProps extends Omit<
  React.ComponentProps<"div">,
  "title"
> {
  /**
   * Decorative 32px icon (rendered `aria-hidden`). Hidden when omitted.
   *
   * **Rule: use a filled icon here.** The slot defaults Phosphor icons to
   * `weight="fill"` via `IconContext`, so a plain `<SomeIcon />` renders filled
   * with no per-call weight needed — matching the dialog's visual language. An
   * explicit `weight` on the passed icon still wins, but line/regular weights are
   * off-pattern for this slot. The top-right close (X) button is the sole
   * exception and stays a regular-weight line icon.
   */
  icon?: React.ReactNode;
  /** Title — becomes the dialog's `aria-labelledby` target (`display-04`). */
  title: React.ReactNode;
  /** Optional description — becomes `aria-describedby` (`body-03`, muted). */
  description?: React.ReactNode;
  /**
   * Show the X close button, positioned against the card at 24px from its top and
   * right (absolute — independent of the icon). Shown by **default**; pass
   * `false` to hide it. Always closes, independent of `dismissable`.
   */
  showClose?: boolean;
}

/**
 * Header block: an optional decorative icon, the title (registers the
 * `aria-labelledby` id), an optional description (registers `aria-describedby`),
 * and an optional X close button. Ids come from `Dialog.Root` context so the
 * ARIA wiring stays in lock-step with `Dialog.Content`.
 */
function DialogHeader({
  icon,
  title,
  description,
  showClose = true,
  className,
  ref,
  ...props
}: DialogHeaderProps) {
  const { titleId, descriptionId, setHasDescription, setOpen } =
    useDialogContext("Dialog.Header");
  const hasDescription = description != null;

  // Tell Content whether to wire `aria-describedby` (pointing at a missing id
  // would be an axe violation, so it is only set when a description exists).
  React.useEffect(() => {
    if (!hasDescription) return;
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [hasDescription, setHasDescription]);

  return (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn(dialogHeaderVariants(), className)}
      {...props}
    >
      {icon != null && (
        <span
          data-slot="dialog-header-icon"
          aria-hidden="true"
          className={dialogHeaderIconVariants()}
        >
          {/* Filled-icon rule for this slot: default Phosphor icons to
              `weight="fill"` so consumers needn't pass it. Scoped to the icon
              slot only — the close (X) button below is outside this provider and
              stays regular. An explicit `weight` on the passed icon still wins. */}
          <IconContext.Provider value={{ weight: "fill" }}>
            {icon}
          </IconContext.Provider>
        </span>
      )}
      <div
        className={cn(
          dialogHeaderTextVariants(),
          // Reserve right space for the corner X only when it would collide: an
          // icon-less header puts the title on the X's row. With an icon the
          // title sits below the X, so no reservation is needed.
          showClose && icon == null && "pr-8",
        )}
      >
        <h2 id={titleId} className="display-04 text-foreground">
          {title}
        </h2>
        {hasDescription && (
          <p id={descriptionId} className="body-03 text-foreground-muted">
            {description}
          </p>
        )}
      </div>
      {/* Absolute corner X (anchored to the card, 24px from its top/right),
          rendered last so it stacks above the header content. */}
      {showClose && (
        <button
          type="button"
          data-slot="dialog-header-close"
          aria-label="Close"
          className={dialogCloseButtonVariants()}
          onClick={() => setOpen(false)}
        >
          {/* Sole exception to the header's filled-icon rule: the close
              affordance is a regular-weight line X (explicit, not inherited). */}
          <XIcon weight="regular" />
        </button>
      )}
    </div>
  );
}

// ── Body ─────────────────────────────────────────────────────────────────────

export interface DialogBodyProps extends React.ComponentProps<"div"> {}

/**
 * Flexible content slot — inputs or any composition. Sizes to content and, in
 * the card's bounded flex column, becomes the internal scroll region so the
 * dialog never exceeds the viewport (custom scrollbar via `scrollbarVariants`).
 */
function DialogBody({ className, children, ref, ...props }: DialogBodyProps) {
  return (
    <div
      ref={ref}
      data-slot="dialog-body"
      className={cn(dialogBodyVariants(), scrollbarVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

export interface DialogFooterProps extends React.ComponentProps<"div"> {}

/**
 * Action-row slot — a full-width flex row (`gap-2`) whose children stretch to
 * equal width (Figma's two-button layout). Apps pass `Button`s; a destructive
 * dialog uses `Button variation="destructive"` here.
 */
function DialogFooter({
  className,
  children,
  ref,
  ...props
}: DialogFooterProps) {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(dialogFooterVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Compound export ──────────────────────────────────────────────────────────

/**
 * Compound modal dialog. Assemble from its namespaced parts:
 *
 * ```tsx
 * <Dialog.Root open={open} onOpenChange={setOpen}>
 *   <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>
 *   <Dialog.Content>
 *     <Dialog.Header icon={<Icon />} title="Title" description="…" showClose />
 *     <Dialog.Body>{/* content *\/}</Dialog.Body>
 *     <Dialog.Footer>
 *       <Dialog.Close asChild><Button variation="secondary">Cancel</Button></Dialog.Close>
 *       <Button>Confirm</Button>
 *     </Dialog.Footer>
 *   </Dialog.Content>
 * </Dialog.Root>
 * ```
 */
const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
};

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
};
