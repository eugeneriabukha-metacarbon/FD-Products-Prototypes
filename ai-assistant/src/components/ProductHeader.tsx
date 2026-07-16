import * as React from "react";
import { SquaresFourIcon } from "@phosphor-icons/react";

import { ProfileMenu } from "./ProfileMenu";

export interface ProductHeaderProps {
  /** Product name shown next to the mark. */
  name: string;
  /** Product mark, rendered in a 24px centered box. */
  icon: React.ReactNode;
  /** Open the Launchpad (the app-switcher button). */
  onOpenLaunchpad: () => void;
  /** Open the paywall (the plans menu item). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * Shared product-app header: app-switcher + product lockup on the left, profile
 * on the right. Used by every full product (AI Assistant, District Pass, …) so
 * they share identical chrome and a consistent route back to the Launchpad.
 */
export function ProductHeader({
  name,
  icon,
  onOpenLaunchpad,
  onUpgrade,
  hasPaidPlan = false,
}: ProductHeaderProps) {
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
            {icon}
          </span>
          <span
            className="font-sans text-lg leading-none font-semibold tracking-[-0.36px] text-black"
            style={{ fontVariationSettings: '"wdth" 105' }}
          >
            {name}
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
