import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toast } from "@financedistrict/apps-ui/toast";

import districtPassIconDark from "../assets/app-district-pass-dark.svg";
import { ProductHeader } from "./ProductHeader";
import { AccountRows } from "./district-pass/AccountRows";
import { ActivityLogPanel } from "./district-pass/ActivityLogPanel";
import { DangerZone } from "./district-pass/DangerZone";
import { PassCard } from "./district-pass/PassCard";
import { SecurityActivity } from "./district-pass/SecurityActivity";
import { Section } from "./district-pass/Section";

export interface DistrictPassProps {
  /** Return to the Launchpad (the app-switcher button). */
  onOpenLaunchpad: () => void;
  /** Open the paywall (profile menu). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * District Pass — the FD identity/account product. A hero `PassCard` (identity
 * + verification credential, with an editable display name) anchors a stack
 * of sections: Account details (Email / Password rows that expand in place
 * to edit), Recent activity (auth audit log with a "View all" Panel
 * slide-over), and a Danger zone (irreversible account deletion behind a
 * type-to-confirm Dialog). All actions are simulated and confirmed with a DS
 * Toast. Sibling of the AI Assistant.
 */
export function DistrictPass({
  onOpenLaunchpad,
  onUpgrade,
  hasPaidPlan = false,
}: DistrictPassProps) {
  const [toast, setToast] = React.useState<string | null>(null);
  const [logOpen, setLogOpen] = React.useState(false);
  const [name, setName] = React.useState("Janno Jaerv");
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

  const handleCloseLog = React.useCallback(() => setLogOpen(false), []);

  return (
    <div className="bg-surface isolate flex h-screen flex-col">
      <ProductHeader
        name="District Pass"
        icon={<img src={districtPassIconDark} alt="" className="size-5" />}
        onOpenLaunchpad={onOpenLaunchpad}
        onUpgrade={onUpgrade}
        hasPaidPlan={hasPaidPlan}
      />

      <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-16">
        <motion.div
          className="flex w-full max-w-[480px] flex-col gap-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PassCard
            name={name}
            initials="JJ"
            onNameSave={(next) => {
              setName(next);
              showToast("Your name has been updated.");
            }}
          />

          <Section title="Account details">
            <AccountRows onToast={showToast} />
          </Section>

          <Section title="Recent activity">
            <SecurityActivity onViewAll={() => setLogOpen(true)} />
          </Section>

          <DangerZone
            onDeleted={() => showToast("Your account has been deleted.")}
          />
        </motion.div>
      </main>

      <ActivityLogPanel open={logOpen} onClose={handleCloseLog} />

      {/* Save confirmation — presentational DS Toast, auto-dismissed. */}
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
