import wordmarkUrl from "../assets/fd-wordmark.svg";
import { ProfileMenu } from "./ProfileMenu";

export interface LaunchpadHeaderProps {
  /** Open the paywall (the plans menu item). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * Launchpad header: Finance District wordmark on the left, profile on the
 * right. No app-switcher — the Launchpad *is* the app switcher.
 */
export function LaunchpadHeader({
  onUpgrade,
  hasPaidPlan = false,
}: LaunchpadHeaderProps) {
  return (
    // Glass chrome (Figma 474:143342) — overlay + translucent blur, same as ProductHeader.
    <header className="bg-surface/[80%] absolute inset-x-0 top-0 z-30 flex w-full items-center justify-between p-4 backdrop-blur-md">
      <div className="flex w-72 items-center">
        <img
          src={wordmarkUrl}
          alt="Finance District"
          className="h-5 w-[219px]"
        />
      </div>

      <div className="flex w-72 items-center justify-end gap-4">
        <ProfileMenu onUpgrade={onUpgrade} hasPaidPlan={hasPaidPlan} />
      </div>
    </header>
  );
}
