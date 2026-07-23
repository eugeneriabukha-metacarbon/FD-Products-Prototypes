import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Toast } from "@financedistrict/apps-ui/toast";

import logoUrl from "../assets/ai-assistant-logo.svg";
import { MemoryTab } from "./MemoryTab";

/**
 * Memory settings screen — full-screen early-return view (the Paywall pattern:
 * product lockup left, centered title, X to close) hosting the assistant's
 * ChatGPT-style memories panel. Reached from the profile menu.
 */
export function MemoryScreen({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="bg-surface flex h-screen flex-col overflow-y-auto">
      {/* header — Paywall chrome */}
      <header className="relative flex w-full shrink-0 items-center justify-between px-4 py-5">
        <div className="flex w-72 items-center gap-4">
          <div className="flex items-center gap-[7px]">
            <span className="flex size-6 items-center justify-center">
              <img src={logoUrl} alt="" className="h-[17px] w-[17.75px]" />
            </span>
            <span
              className="font-sans text-lg leading-none font-semibold tracking-[-0.36px] text-black"
              style={{ fontVariationSettings: '"wdth" 105' }}
            >
              AI Assistant
            </span>
          </div>
        </div>

        <p className="body-01-medium text-primary-foreground absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Memory
        </p>

        <div className="flex w-72 items-center justify-end gap-4">
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            aria-label="Close"
            onClick={onClose}
          >
            <XIcon size={20} className="text-card-foreground-muted" />
          </Button>
        </div>
      </header>

      <motion.div
        className="mx-auto flex w-full max-w-[600px] flex-col px-4 pt-4 pb-16"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <MemoryTab onToast={showToast} />
      </motion.div>

      {/* Action confirmation — presentational DS Toast, auto-dismissed. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
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
      </div>
    </div>
  );
}
