import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Panel } from "@financedistrict/apps-ui/panel";
import { ACTIVITY_EVENTS } from "./mockData";
import { ActivityRow } from "./SecurityActivity";

export function ActivityLogPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="bg-overlay absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative h-full w-full max-w-[420px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/*
              Panel is a static, content-sized card by default (`w-80`,
              `rounded-md` on all corners). Overridden here to fill this
              full-height, full-width slide-over pane flush against the
              screen edge (square corners, left border only, body scrolls
              independently of the fixed header).
            */}
            <Panel.Root className="h-full w-full flex-col rounded-none border-y-0 border-r-0">
              <Panel.Header title="Security activity" onClose={onClose} />
              <Panel.Body className="flex-1 overflow-y-auto">
                <ul className="border-card-border flex flex-col border-t">
                  {ACTIVITY_EVENTS.map((event) => (
                    <ActivityRow key={event.id} event={event} />
                  ))}
                </ul>
              </Panel.Body>
            </Panel.Root>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
