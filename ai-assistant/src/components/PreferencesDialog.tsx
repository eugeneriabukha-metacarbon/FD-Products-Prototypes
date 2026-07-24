import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { BrainIcon, GaugeIcon, XIcon } from "@phosphor-icons/react";
import { Dialog } from "@financedistrict/apps-ui/dialog";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { scrollbarVariants } from "@financedistrict/apps-ui/scrollbar";
import { Switch } from "@financedistrict/apps-ui/switch";
import { Toast } from "@financedistrict/apps-ui/toast";

import { SidebarNavItem } from "./district-pass/SidebarLayout";
import { MemoryTab } from "./MemoryTab";
import { RISK_LEVELS, RiskSlider, type RiskProfile } from "./RiskSlider";

type PreferencesSection = "memory" | "risk";

const SECTIONS: { key: PreferencesSection; label: string }[] = [
  { key: "memory", label: "Memory" },
  { key: "risk", label: "Risk profile" },
];

/**
 * Extended preferences — the bigger sibling of `MemoryDialog`, opened from the
 * sidebar footer when the configurator's "Extended preferences" axis is on.
 * Fixed 720×560 DS Dialog (content padding stripped for a split layout): a
 * left nav rail (Memory / Risk profile, the District Pass `SidebarNavItem`)
 * and a right pane whose header card (borderless flush FeatureCard: icon +
 * title + description) stays pinned while the section body scrolls beneath it. Memory keeps its on/off switch in
 * the card; Risk profile has no switch — its body is the three-stop slider.
 * Toast is portaled to `document.body` (same stacking rationale as
 * MemoryDialog).
 */
export function PreferencesDialog({
  open,
  onOpenChange,
  memoryEnabled,
  onMemoryEnabledChange,
  riskProfile,
  onRiskProfileChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Memory on/off — lifted to App so the sidebar item can label its state. */
  memoryEnabled: boolean;
  onMemoryEnabledChange: (enabled: boolean) => void;
  /** Risk appetite — lifted to App (the assistant would tune suggestions to it). */
  riskProfile: RiskProfile;
  onRiskProfileChange: (profile: RiskProfile) => void;
}) {
  const [section, setSection] = React.useState<PreferencesSection>("memory");
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = React.useId();

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

  const toggleMemory = (next: boolean) => {
    onMemoryEnabledChange(next);
    showToast(next ? "Memory turned on." : "Memory turned off.");
  };

  const changeRisk = (next: RiskProfile) => {
    if (next === riskProfile) return;
    onRiskProfileChange(next);
    const label = RISK_LEVELS.find((level) => level.value === next)?.label;
    showToast(`Risk profile set to ${label}.`);
  };

  const activeBlurb = RISK_LEVELS.find(
    (level) => level.value === riskProfile,
  )?.blurb;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content
          className="h-[560px] w-[720px] gap-0 p-0"
          aria-labelledby={titleId}
        >
          <div className="flex min-h-0 flex-1">
            {/* Left rail — dialog title + section nav. */}
            <div className="border-card-border flex w-[200px] shrink-0 flex-col gap-4 border-r p-4">
              <h2 id={titleId} className="display-04 text-foreground">
                Preferences
              </h2>
              <nav
                aria-label="Preferences sections"
                className="flex flex-col"
              >
                {SECTIONS.map((item) => (
                  <SidebarNavItem
                    key={item.key}
                    active={item.key === section}
                    onClick={() => setSection(item.key)}
                  >
                    {item.label}
                  </SidebarNavItem>
                ))}
              </nav>
            </div>

            {/* Right pane — one scroll region. The close-X strip is sticky
                (opaque card surface), so the section card + content slide in
                behind it while scrolling — the Claude-settings treatment. */}
            <div
              className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${scrollbarVariants()}`}
            >
              <div className="bg-card-background sticky top-0 z-10 flex justify-end px-6 pt-6 pb-2">
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

              <div className="flex flex-col gap-6 px-6 pb-6">
                {section === "memory" ? (
                  <FeatureCard
                    caret={false}
                    className="px-0"
                    leading={<BrainIcon />}
                    title="Memory"
                    subtitle={
                      <span className="line-clamp-2 whitespace-normal">
                        Memories are created as you chat to personalize replies.
                      </span>
                    }
                    trailing={
                      <Switch
                        checked={memoryEnabled}
                        onCheckedChange={toggleMemory}
                        aria-label="Memory"
                      />
                    }
                  />
                ) : (
                  <FeatureCard
                    caret={false}
                    className="px-0"
                    leading={<GaugeIcon />}
                    title="Risk profile"
                    subtitle={
                      <span className="line-clamp-2 whitespace-normal">
                        Strategy suggestions are tuned to your risk appetite.
                      </span>
                    }
                  />
                )}

                {section === "memory" ? (
                  <MemoryTab
                    onToast={showToast}
                    enabled={memoryEnabled}
                    showMasterSwitch={false}
                  />
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Slider on its own bordered white card (fixed height —
                        the explainer changes length per level, so it lives
                        below the card). */}
                    <div className="bg-card-background border-card-border rounded-md border p-6">
                      <RiskSlider value={riskProfile} onChange={changeRisk} />
                    </div>
                    {/* Per-level explainer — crossfades on selection. */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={riskProfile}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="body-03 text-card-foreground-muted"
                      >
                        {activeBlurb}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
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
