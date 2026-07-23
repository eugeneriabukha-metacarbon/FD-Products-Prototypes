import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { Dialog } from "@financedistrict/apps-ui/dialog";
import { Switch } from "@financedistrict/apps-ui/switch";
import { Toast } from "@financedistrict/apps-ui/toast";

import { MemoryTab } from "./MemoryTab";

/**
 * Memory settings in a modal Dialog — the alternate entry point (sidebar
 * footer) to the full-screen `MemoryScreen`, kept alongside it for comparison.
 * MemoryTab's own Edit / Clear-all dialogs open nested on top of this one; the
 * DS focus trap keys off Tab (not a focusin redirect) so nesting works.
 *
 * Custom header (not `Dialog.Header`): the explainer sits as a description
 * under the title and the master switch lives to the right of the title, which
 * the built-in header has no slot for. `aria-labelledby`/`describedby` are
 * wired to our own ids (overriding Content's context defaults). The toast is
 * portaled to `document.body`: the assistant view is an `isolate` stacking
 * context, so an inline toast could never sit above the portaled z-50 overlay.
 */
export function MemoryDialog({
  open,
  onOpenChange,
  enabled,
  onEnabledChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Memory on/off — lifted to App so the sidebar item can label its state. */
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const toggleEnabled = (next: boolean) => {
    onEnabledChange(next);
    showToast(next ? "Memory turned on." : "Memory turned off.");
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content
          className="w-[560px]"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          {/* Custom header: title with the switch 8px to its right, the
              description beneath, and the close X on the far right. */}
          <div className="flex shrink-0 items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="display-04 text-foreground">
                  Memory
                </h2>
                <Switch
                  checked={enabled}
                  onCheckedChange={toggleEnabled}
                  aria-label="Memory"
                />
              </div>
              <p id={descId} className="body-03 text-foreground-muted">
                Memories are created as you chat to personalize replies.
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="text-card-foreground-muted hover:text-card-foreground focus-visible:outline-focus flex shrink-0 cursor-pointer items-center justify-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
              >
                <XIcon size={16} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Body>
            <MemoryTab
              onToast={showToast}
              enabled={enabled}
              showMasterSwitch={false}
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>

      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto"
              >
                <Toast variation="success" onClose={() => setToast(null)}>
                  {toast}
                </Toast>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </>
  );
}
