import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SelectOption } from "@financedistrict/apps-ui/select";
import { Toast } from "@financedistrict/apps-ui/toast";

import districtPassIconDark from "../assets/app-district-pass-dark.svg";
import { ConfiguratorShell } from "./Configurator";
import { ProductHeader } from "./ProductHeader";
import { RightAlignedInlineSelect } from "./RightAlignedInlineSelect";
import { ActivityList } from "./district-pass/ActivityList";
import { ContentsLayout } from "./district-pass/ContentsLayout";
import { DangerZone } from "./district-pass/DangerZone";
import { EmailRow } from "./district-pass/EmailRow";
import { NicknameRow } from "./district-pass/NicknameRow";
import { PasswordRow } from "./district-pass/PasswordRow";
import {
  SidebarLayout,
  type DistrictPassSection,
} from "./district-pass/SidebarLayout";
import { PassCard } from "./district-pass/PassCard";
import { SupportTab } from "./district-pass/SupportTab";

type DistrictPassNavigation = "sidebar" | "contents";

const NAVIGATION_OPTIONS: SelectOption[] = [
  { value: "sidebar", label: "Sidebar" },
  { value: "contents", label: "Contents" },
];

export interface DistrictPassProps {
  /** Return to the Launchpad (the app-switcher button). */
  onOpenLaunchpad: () => void;
  /** Open the paywall (profile menu). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * District Pass — the FD identity/account product. A display-only hero
 * `PassCard` anchors a sidebar layout of sections: Account (Nickname + Email
 * rows that expand in place to edit), Activity (the full auth audit log),
 * Security (change password, plus account deletion — irreversible, behind a
 * type-to-confirm Dialog), and Support (Contact support / Help center). All
 * actions are simulated and confirmed with a DS Toast. Sibling of the AI
 * Assistant.
 */
export function DistrictPass({
  onOpenLaunchpad,
  onUpgrade,
  hasPaidPlan = false,
}: DistrictPassProps) {
  const [toast, setToast] = React.useState<string | null>(null);
  const [name, setName] = React.useState("Janno Jaerv");
  // An Account card (Nickname / Email) is mid-edit — the two rows lock each
  // other while either form is open.
  const [nicknameEditing, setNicknameEditing] = React.useState(false);
  const [emailEditing, setEmailEditing] = React.useState(false);
  // The Security password form is open — locks the delete action beneath it.
  const [passwordEditing, setPasswordEditing] = React.useState(false);
  // Configurator axis: section navigation as a sidebar (each section on its
  // own) or a sticky table of contents over a one-pager.
  const [navigation, setNavigation] =
    React.useState<DistrictPassNavigation>("sidebar");
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

  const sections: DistrictPassSection[] = [
    {
      value: "account",
      label: "Account",
      content: (
        <div className="divide-card-border flex flex-col divide-y">
          <NicknameRow
            name={name}
            onNameSave={setName}
            onToast={showToast}
            onEditingChange={setNicknameEditing}
            lockedByOthers={emailEditing}
          />
          <EmailRow
            onToast={showToast}
            onEditingChange={setEmailEditing}
            lockedByOthers={nicknameEditing}
          />
        </div>
      ),
    },
    { value: "activity", label: "Activity", content: <ActivityList /> },
    // Devices section hidden for now (DevicesTab is kept on disk).
    {
      value: "security",
      label: "Security",
      content: (
        <div className="divide-card-border flex flex-col divide-y">
          <PasswordRow
            onToast={showToast}
            onEditingChange={setPasswordEditing}
          />
          <DangerZone
            onDeleted={() => showToast("Your account has been deleted.")}
            disabled={passwordEditing}
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
    <div className="bg-surface isolate relative flex h-screen flex-col">
      <ProductHeader
        name="District Pass"
        icon={<img src={districtPassIconDark} alt="" className="size-5" />}
        onOpenLaunchpad={onOpenLaunchpad}
        onUpgrade={onUpgrade}
        hasPaidPlan={hasPaidPlan}
      />

      {/* pt-32 = the 64px glass-header overlay + the original 64px gap. */}
      <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pt-32 pb-16">
        <motion.div
          className="flex w-full max-w-[906px] flex-col gap-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PassCard name={name} initials="JJ" />

          {navigation === "sidebar" ? (
            <SidebarLayout sections={sections} />
          ) : (
            <ContentsLayout sections={sections} />
          )}
        </motion.div>
      </main>

      {/* Stakeholder-only preview panel (bottom-right, collapsible). */}
      <ConfiguratorShell>
        <div className="flex items-center justify-between gap-4">
          <span className="body-03 text-card-foreground">Navigation</span>
          <RightAlignedInlineSelect
            options={NAVIGATION_OPTIONS}
            value={navigation}
            onValueChange={(value) =>
              setNavigation(value as DistrictPassNavigation)
            }
            aria-label="Navigation"
          />
        </div>
      </ConfiguratorShell>

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
