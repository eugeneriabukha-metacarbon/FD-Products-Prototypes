"use client";

import * as React from "react";
import { CheckCircleIcon, XCircleIcon, XIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import {
  toastVariants,
  toastIconVariants,
  toastCloseVariants,
} from "./toastVariants";

export interface ToastProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /**
   * Status. `success` → a polite `role="status"` region; `error` → an
   * assertive `role="alert"` region. Also selects the leading icon + its color.
   */
  variation?: "success" | "error";
  /** The message body (`body-03`). */
  children: React.ReactNode;
  /**
   * Dismiss handler. When provided, the trailing close button is rendered and
   * wired to it; omit it for a toast with no close affordance.
   */
  onClose?: () => void;
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
}

/** Per-variation leading icon (decorative — meaning is in the message + role). */
const STATUS_ICON = {
  success: CheckCircleIcon,
  error: XCircleIcon,
} as const;

/**
 * Toast — the Figma `Toast` (node `5020:2203`). A presentational dark
 * notification chip: a leading status icon, a message, and an optional close
 * button. It is a live region (`role="status"` for success, `role="alert"` for
 * error) so it announces when mounted; positioning, stacking, and auto-dismiss
 * are the consumer's concern (there is no toast manager here).
 */
function Toast({
  variation = "success",
  children,
  onClose,
  className,
  ref,
  ...props
}: ToastProps) {
  const StatusIcon = STATUS_ICON[variation];
  return (
    <div
      data-slot="toast"
      role={variation === "error" ? "alert" : "status"}
      className={cn(toastVariants(), className)}
      ref={ref}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span
          data-slot="toast-icon"
          aria-hidden="true"
          className={toastIconVariants({ variation })}
        >
          <StatusIcon weight="fill" />
        </span>
        <span className="body-03 min-w-0 flex-1 text-card-reversed-foreground">
          {children}
        </span>
      </span>
      {onClose && (
        <button
          type="button"
          data-slot="toast-close"
          aria-label="Dismiss"
          className={toastCloseVariants()}
          onClick={onClose}
        >
          {/* Line X (regular weight), matching Dialog.Close. */}
          <XIcon weight="regular" />
        </button>
      )}
    </div>
  );
}

export { Toast };
