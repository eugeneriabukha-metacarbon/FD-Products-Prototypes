"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import {
  panelVariants,
  panelHeaderVariants,
  panelHeaderContentVariants,
  panelHeaderIconVariants,
  panelHeaderTextVariants,
  panelCloseButtonVariants,
  panelBodyVariants,
  panelFooterVariants,
} from "./panelVariants";

// ── Context ──────────────────────────────────────────────────────────────────
// Minimal: carries only the generated title id (Root → Header hand-off for
// aria-labelledby) and a registration flag. No state machinery — Panel is
// static. Parts used outside a Root read `null` and skip the aria wiring.

interface PanelContextValue {
  /** Generated id the Header assigns to its title (Root's aria-labelledby). */
  titleId: string;
  /** Header registers presence so Root knows whether to wire the landmark. */
  setHasTitle: (has: boolean) => void;
}

const PanelContext = React.createContext<PanelContextValue | null>(null);

/** Read the optional Panel context (null when a part is used standalone). */
function usePanelContext(): PanelContextValue | null {
  return React.useContext(PanelContext);
}

// ── Root ─────────────────────────────────────────────────────────────────────

export interface PanelRootProps extends React.ComponentProps<"div"> {}

/**
 * The card container + context provider. A plain flow `<div>` (no overlay). It
 * becomes a `region` landmark only when it has an accessible name: a `Panel.Header`
 * title (auto-wired via context) or a consumer-supplied `aria-label`/
 * `aria-labelledby`. Without a name it renders a plain `<div>` (an unnamed
 * landmark is an a11y violation). Forwards `ref` to the card.
 */
function PanelRoot({
  className,
  children,
  ref,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: PanelRootProps) {
  const reactId = React.useId();
  const titleId = `${reactId}-title`;
  const [hasTitle, setHasTitle] = React.useState(false);

  const labelledBy = hasTitle ? titleId : ariaLabelledby;
  const hasName = Boolean(labelledBy || ariaLabel);

  // `setHasTitle` is a stable useState setter; the context object identity
  // changes each render, but Header depends on the setter (stable), so its
  // registration effect does not thrash.
  const value: PanelContextValue = { titleId, setHasTitle };

  return (
    <PanelContext.Provider value={value}>
      <div
        ref={ref}
        role={hasName ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        data-slot="panel"
        className={cn(panelVariants(), className)}
        {...props}
      >
        {children}
      </div>
    </PanelContext.Provider>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

export interface PanelHeaderProps extends Omit<
  React.ComponentProps<"div">,
  "title"
> {
  /**
   * Decorative 24px icon (rendered `aria-hidden`), inline-left of the title.
   * Hidden when omitted. Rendered as-is — the header does NOT force a weight
   * (unlike Dialog's filled-icon slot), so the app controls the icon's weight
   * (Phosphor's default is `regular`).
   */
  icon?: React.ReactNode;
  /** Title — becomes the Panel's `aria-labelledby` target (`body-02-medium`). */
  title: React.ReactNode;
  /** Optional description (`body-03`, muted). Rendered only when provided. */
  description?: React.ReactNode;
  /** Show the inline close X. Default `true` (matches Figma). */
  showClose?: boolean;
  /** Called when the close X is activated. Optional — X is inert without it. */
  onClose?: () => void;
}

/**
 * Header row: an optional inline icon + the title (registers the
 * `aria-labelledby` id via context) + an optional description, with an optional
 * inline close X at the row's end. Unlike Dialog, the icon is inline-left and
 * the close X sits in the row flow (not absolute against the card).
 */
function PanelHeader({
  icon,
  title,
  description,
  showClose = true,
  onClose,
  className,
  ref,
  ...props
}: PanelHeaderProps) {
  const context = usePanelContext();
  const titleId = context?.titleId;
  const setHasTitle = context?.setHasTitle;
  const hasDescription = description != null;

  // Register title presence so Root wires the `region` landmark + labelledby.
  // Depends on the stable `setHasTitle` setter (not the context object), so it
  // does not re-run on every Root render.
  React.useEffect(() => {
    if (!setHasTitle) return;
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <div
      ref={ref}
      data-slot="panel-header"
      className={cn(panelHeaderVariants(), className)}
      {...props}
    >
      <div className={panelHeaderContentVariants()}>
        {icon != null && (
          <span
            data-slot="panel-header-icon"
            aria-hidden="true"
            className={panelHeaderIconVariants()}
          >
            {icon}
          </span>
        )}
        <div className={panelHeaderTextVariants()}>
          <p id={titleId} className="body-02-medium text-card-foreground">
            {title}
          </p>
          {hasDescription && (
            <p className="body-03 text-card-foreground-muted">{description}</p>
          )}
        </div>
      </div>
      {showClose && (
        <button
          type="button"
          data-slot="panel-header-close"
          aria-label="Close"
          className={panelCloseButtonVariants()}
          onClick={() => onClose?.()}
        >
          <XIcon weight="regular" />
        </button>
      )}
    </div>
  );
}

// ── Body ─────────────────────────────────────────────────────────────────────

export interface PanelBodyProps extends React.ComponentProps<"div"> {}

/** Flexible content slot. Sizes to content (no fixed height). Forwards `ref`. */
function PanelBody({ className, children, ref, ...props }: PanelBodyProps) {
  return (
    <div
      ref={ref}
      data-slot="panel-body"
      className={cn(panelBodyVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

export interface PanelFooterProps extends React.ComponentProps<"div"> {}

/**
 * Action-row slot: a left-aligned flex row (`gap-2`) of content-width children
 * (Figma's footer layout — NOT stretched like `Dialog.Footer`). Forwards `ref`.
 */
function PanelFooter({ className, children, ref, ...props }: PanelFooterProps) {
  return (
    <div
      ref={ref}
      data-slot="panel-footer"
      className={cn(panelFooterVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Compound export ─────────────────────────────────────────────────────────

const Panel = {
  Root: PanelRoot,
  Header: PanelHeader,
  Body: PanelBody,
  Footer: PanelFooter,
};

export { Panel, PanelRoot, PanelHeader, PanelBody, PanelFooter };
