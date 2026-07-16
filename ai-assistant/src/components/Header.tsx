import { SquaresFourIcon } from "@phosphor-icons/react";

import logoUrl from "../assets/ai-assistant-logo.svg";
import { ProfileMenu } from "./ProfileMenu";

export interface HeaderProps {
  /** Open the paywall (the plans menu item). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
  /** Open the Launchpad (the app-switcher button). */
  onOpenLaunchpad: () => void;
}

/** App header: app-switcher + product logo on the left, profile on the right. */
export function Header({
  onUpgrade,
  hasPaidPlan = false,
  onOpenLaunchpad,
}: HeaderProps) {
  return (
    <header className="z-10 flex w-full shrink-0 items-center justify-between p-4">
      {/* left-side */}
      <div className="flex w-72 items-center gap-4">
        <button
          type="button"
          aria-label="Apps"
          onClick={onOpenLaunchpad}
          className="text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus cursor-pointer rounded-xs transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
        >
          <SquaresFourIcon size={24} aria-hidden="true" />
        </button>

        <div className="bg-border h-[9px] w-px" aria-hidden="true" />

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

      {/* right-side */}
      <div className="flex w-72 items-center justify-end gap-4">
        <ProfileMenu onUpgrade={onUpgrade} hasPaidPlan={hasPaidPlan} />
      </div>
    </header>
  );
}
