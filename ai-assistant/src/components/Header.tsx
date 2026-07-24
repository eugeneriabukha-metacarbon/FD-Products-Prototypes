import logoUrl from "../assets/ai-assistant-logo.svg";
import { PlanButton } from "./PlanButton";
import { ProductHeader } from "./ProductHeader";

export interface HeaderProps {
  /** Open the paywall (the plans menu item). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
  /** Open the Launchpad (the app-switcher button). */
  onOpenLaunchpad: () => void;
  /** Hide the launchpad button + lockup (they live in the app sidebar). */
  showBrand?: boolean;
}

/** AI Assistant header — the product lockup over the shared `ProductHeader`. */
export function Header({
  onUpgrade,
  hasPaidPlan = false,
  onOpenLaunchpad,
  showBrand = true,
}: HeaderProps) {
  return (
    <ProductHeader
      name="AI Assistant"
      icon={<img src={logoUrl} alt="" className="h-[17px] w-[17.75px]" />}
      onOpenLaunchpad={onOpenLaunchpad}
      onUpgrade={onUpgrade}
      hasPaidPlan={hasPaidPlan}
      showUpgradeInMenu={false}
      showBrand={showBrand}
      rightAction={
        <PlanButton hasPaidPlan={hasPaidPlan} onClick={onUpgrade} />
      }
    />
  );
}
