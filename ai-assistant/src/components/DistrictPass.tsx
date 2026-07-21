import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs } from "@financedistrict/apps-ui/tabs";
import { Toast } from "@financedistrict/apps-ui/toast";

import districtPassIconDark from "../assets/app-district-pass-dark.svg";
import { ProductHeader } from "./ProductHeader";
import { AccountRows } from "./district-pass/AccountRows";
import { ActivityList } from "./district-pass/ActivityList";
import { Configurator, VariantPlaceholder } from "./district-pass/Configurator";
import { DangerZone } from "./district-pass/DangerZone";
import { DevicesTab } from "./district-pass/DevicesTab";
import { TwoFactorRow } from "./district-pass/TwoFactorRow";
import {
  SidebarLayout,
  type DistrictPassSection,
} from "./district-pass/SidebarLayout";
import { PassCard } from "./district-pass/PassCard";
import { SupportTab } from "./district-pass/SupportTab";

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
 * + verification credential, with an editable display name) anchors three DS
 * `Tabs`: Security (Account details rows that expand in place to edit, plus a
 * Danger zone — irreversible account deletion behind a type-to-confirm Dialog
 * — at the bottom), Activity (the full auth audit log), and Support (Contact
 * support / Help center). All actions are simulated and confirmed with a DS
 * Toast. Sibling of the AI Assistant.
 */
export function DistrictPass({
  onOpenLaunchpad,
  onUpgrade,
  hasPaidPlan = false,
}: DistrictPassProps) {
  const [toast, setToast] = React.useState<string | null>(null);
  const [name, setName] = React.useState("Janno Jaerv");
  // Stakeholder preview axes, driven by the Configurator toolbar.
  const [navigation, setNavigation] = React.useState("tabs");
  const [settings, setSettings] = React.useState("basic");
  // A Security card (Email / Password / 2FA) is mid-edit — locks the delete action.
  const [accountEditing, setAccountEditing] = React.useState(false);
  const [twoFactorEditing, setTwoFactorEditing] = React.useState(false);
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

  // Shared section content — identical across the tabs and sidebar layouts.
  const sections: DistrictPassSection[] = [
    { value: "activity", label: "Activity", content: <ActivityList /> },
    {
      value: "devices",
      label: "Devices",
      content: <DevicesTab onToast={showToast} />,
    },
    {
      value: "security",
      label: "Security",
      content: (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <AccountRows
              onToast={showToast}
              onEditingChange={setAccountEditing}
              lockedByOthers={twoFactorEditing}
            />
            <TwoFactorRow
              onToast={showToast}
              onEditingChange={setTwoFactorEditing}
              lockedByOthers={accountEditing}
            />
          </div>
          <DangerZone
            onDeleted={() => showToast("Your account has been deleted.")}
            disabled={accountEditing || twoFactorEditing}
          />
        </div>
      ),
    },
    {
      value: "support",
      label: "Support",
      content: <SupportTab onToast={showToast} />,
    },
  ];

  return (
    <div className="bg-surface isolate flex h-screen flex-col">
      <ProductHeader
        name="District Pass"
        icon={<img src={districtPassIconDark} alt="" className="size-5" />}
        onOpenLaunchpad={onOpenLaunchpad}
        onUpgrade={onUpgrade}
        hasPaidPlan={hasPaidPlan}
      />

      <Configurator
        navigation={navigation}
        settings={settings}
        onNavigationChange={setNavigation}
        onSettingsChange={setSettings}
      />

      <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-16">
        <motion.div
          className={`flex w-full flex-col gap-8 ${
            navigation === "sidebar" ? "max-w-[906px]" : "max-w-[480px]"
          }`}
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

          {settings !== "basic" ? (
            <VariantPlaceholder label="This settings preset" />
          ) : navigation === "sidebar" ? (
            <SidebarLayout sections={sections} />
          ) : (
            <Tabs.Root defaultValue="activity" className="gap-6">
              <Tabs.List
                aria-label="District Pass sections"
                className="border-card-border w-full border-b"
              >
                {sections.map((section) => (
                  <Tabs.Trigger key={section.value} value={section.value}>
                    {section.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {sections.map((section) => (
                <Tabs.Content key={section.value} value={section.value}>
                  {section.content}
                </Tabs.Content>
              ))}
            </Tabs.Root>
          )}
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
