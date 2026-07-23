import { ListChecksIcon, RocketLaunchIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";

export interface PlanButtonProps {
  /** Paid users get the "Manage plans" state; free users get "Upgrade plan". */
  hasPaidPlan?: boolean;
  /** Open the paywall / plan-management view. */
  onClick: () => void;
}

/**
 * Header plan button (AI Assistant). Free → a dark primary "Upgrade plan" with a
 * trailing rocket; paid → a secondary "Manage plans" with a leading checklist.
 * Relocated here from the profile dropdown; the DS Button's cut corners match
 * Figma 574:92753.
 */
export function PlanButton({ hasPaidPlan = false, onClick }: PlanButtonProps) {
  if (hasPaidPlan) {
    return (
      <Button
        variation="secondary"
        size="sm"
        type="button"
        onClick={onClick}
        leftSlot={<ListChecksIcon />}
      >
        Manage plans
      </Button>
    );
  }

  return (
    <Button
      variation="primary"
      size="sm"
      type="button"
      onClick={onClick}
      rightSlot={<RocketLaunchIcon />}
    >
      Upgrade plan
    </Button>
  );
}
