import * as React from "react";
import { SquaresFourIcon } from "@phosphor-icons/react";

import { ProfileMenu } from "./ProfileMenu";

/**
 * Launchpad button (Figma 592:129669) — bordered secondary-surface square,
 * 16px glyph; hover strengthens border + glyph to the DS secondary button's
 * `-accent` tokens. size-8 (not the node's p-2) keeps the header at exactly
 * 64px for the glass-overlay offsets. Exported for the app-sidebar layout,
 * which hosts this button inside the rail instead of the header.
 */
export function LaunchpadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Apps"
      onClick={onClick}
      className="bg-button-secondary-background border-button-secondary-border text-button-secondary-foreground hover:border-button-secondary-border-accent hover:text-button-secondary-foreground-accent focus-visible:outline-focus flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
    >
      <SquaresFourIcon size={16} aria-hidden="true" />
    </button>
  );
}

/** Product lockup — 24px mark + name. Exported alongside `LaunchpadButton`. */
export function ProductBrand({
  name,
  icon,
  nameClassName,
}: {
  name: string;
  icon: React.ReactNode;
  /** Extra classes on the name span (e.g. a container-query hide). */
  nameClassName?: string;
}) {
  return (
    <div className="flex items-center gap-[7px]">
      <span className="flex size-6 items-center justify-center">{icon}</span>
      <span
        className={`font-sans text-lg leading-none font-semibold tracking-[-0.36px] whitespace-nowrap text-black ${nameClassName ?? ""}`}
        style={{ fontVariationSettings: '"wdth" 105' }}
      >
        {name}
      </span>
    </div>
  );
}

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
  /** Optional action rendered left of a divider + the profile avatar. */
  rightAction?: React.ReactNode;
  /** Forwarded to the profile menu: show the plans item there (default true). */
  showUpgradeInMenu?: boolean;
  /** Forwarded to the profile menu: Memory settings item (AI Assistant only). */
  onOpenMemory?: () => void;
  /**
   * Hide the left side (launchpad button + lockup) — the app-sidebar layout
   * hosts those inside the rail and keeps only the right-side actions here.
   */
  showBrand?: boolean;
}

/**
 * Shared product-app header: app-switcher + product lockup on the left, profile
 * on the right. Used by every full product (AI Assistant, District Pass, …) so
 * they share identical chrome and a consistent route back to the Launchpad.
 *
 * Glass chrome (Figma 474:143342): the header overlays the page (absolute, out
 * of flow — parents pad their content down by the 64px header height) on a
 * translucent surface with a backdrop blur, so content scrolling beneath it
 * frosts through.
 */
export function ProductHeader({
  name,
  icon,
  onOpenLaunchpad,
  onUpgrade,
  hasPaidPlan = false,
  rightAction,
  showUpgradeInMenu = true,
  onOpenMemory,
  showBrand = true,
}: ProductHeaderProps) {
  return (
    <header className="bg-surface/[80%] absolute inset-x-0 top-0 z-30 flex w-full items-center justify-between p-4 backdrop-blur-md">
      {/* left-side */}
      <div className="flex w-72 items-center gap-4">
        {showBrand && (
          <>
            <LaunchpadButton onClick={onOpenLaunchpad} />
            <div className="bg-border h-[9px] w-px" aria-hidden="true" />
            <ProductBrand name={name} icon={icon} />
          </>
        )}
      </div>

      {/* right-side */}
      <div className="flex w-72 items-center justify-end gap-4">
        {rightAction}
        {rightAction && (
          <div className="bg-border h-[9px] w-px" aria-hidden="true" />
        )}
        <ProfileMenu
          onUpgrade={onUpgrade}
          hasPaidPlan={hasPaidPlan}
          showUpgradeItem={showUpgradeInMenu}
          onOpenMemory={onOpenMemory}
        />
      </div>
    </header>
  );
}
