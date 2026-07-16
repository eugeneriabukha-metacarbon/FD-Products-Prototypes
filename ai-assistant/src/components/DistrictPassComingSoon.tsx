import { motion } from "motion/react";
import { ArrowLeftIcon } from "@phosphor-icons/react";

import districtPassIcon from "../assets/app-district-pass.svg";
import { LaunchpadHeader } from "./LaunchpadHeader";

export interface DistrictPassComingSoonProps {
  /** Return to the Launchpad. */
  onBack: () => void;
  /** Open the paywall (profile menu). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * Placeholder for the District Pass product — interactive from the Launchpad
 * but not yet built out. Minimal on purpose; we flesh it out later.
 */
export function DistrictPassComingSoon({
  onBack,
  onUpgrade,
  hasPaidPlan = false,
}: DistrictPassComingSoonProps) {
  return (
    <div className="bg-surface isolate flex h-screen flex-col">
      <LaunchpadHeader onUpgrade={onUpgrade} hasPaidPlan={hasPaidPlan} />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-4">
        <motion.div
          className="flex max-w-[420px] flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span
            aria-hidden="true"
            className="bg-card-brand-background flex size-14 items-center justify-center overflow-hidden rounded-sm"
          >
            <img src={districtPassIcon} alt="" className="size-6" />
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="display-03 text-primary-foreground">
              District Pass
            </h1>
            <p className="body-02 text-primary-foreground-muted">
              One identity across all Finance District products and services.
              This experience is coming soon.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="border-card-border bg-card-background hover:bg-card-accent focus-visible:outline-focus inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md border px-3 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
          >
            <ArrowLeftIcon
              size={16}
              className="text-card-foreground-muted"
              aria-hidden="true"
            />
            <span className="body-02-medium text-card-foreground">
              Back to apps
            </span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
