import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toast } from "@financedistrict/apps-ui/toast";

import districtPassIconDark from "../assets/app-district-pass-dark.svg";
import { ProductHeader } from "./ProductHeader";
import { AccountRows } from "./district-pass/AccountRows";
import { ConnectedApps } from "./district-pass/ConnectedApps";
import { PassCard } from "./district-pass/PassCard";
import { Section } from "./district-pass/Section";
import { CONNECTED_APPS } from "./district-pass/mockData";

export interface DistrictPassProps {
  /** Return to the Launchpad (the app-switcher button). */
  onOpenLaunchpad: () => void;
  /** Open the paywall (profile menu). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * District Pass — the FD identity/account product. A hero `PassCard`
 * (identity + verification credential) sits above a section of FeatureCard
 * rows (Nickname / Email / Password); each row expands in place into an edit
 * form (Edit → Cancel/Save, other rows' Edit disabled while editing).
 * Saves are simulated and confirmed with a DS Toast. Sibling of the AI Assistant.
 */
export function DistrictPass({
  onOpenLaunchpad,
  onUpgrade,
  hasPaidPlan = false,
}: DistrictPassProps) {
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
            name="Janno Jaerv"
            initials="JJ"
            connectedCount={CONNECTED_APPS.length}
          />

          <Section title="Account details">
            <AccountRows onToast={showToast} />
          </Section>

          <Section
            title="Connected apps"
            caption="Apps using your District Pass."
          >
            <ConnectedApps onToast={showToast} />
          </Section>
        </motion.div>
      </main>

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
