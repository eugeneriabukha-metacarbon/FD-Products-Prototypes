import { motion } from "motion/react";
import type { Icon } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  CoinsIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

interface QuickAction {
  label: string;
  icon: Icon;
}

const ACTIONS: QuickAction[] = [
  { label: "Find staking opportunities", icon: CoinsIcon },
  { label: "Describe yield strategies", icon: TrendUpIcon },
  { label: "Analyze my portfolio", icon: BriefcaseIcon },
];

export interface QuickActionsProps {
  /** Called with the action label — fills the composer with a starter prompt. */
  onPick: (prompt: string) => void;
}

/** Suggested-prompt chips under the composer. */
export function QuickActions({ onPick }: QuickActionsProps) {
  return (
    <div className="flex items-start gap-1">
      {ACTIONS.map(({ label, icon: ActionIcon }, index) => (
        <motion.button
          key={label}
          type="button"
          onClick={() => onPick(label)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 + index * 0.06 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="bg-card-background border-card-border hover:bg-card-accent focus-visible:outline-focus rounded-sm flex cursor-pointer items-center justify-center gap-1.5 border py-1 pr-2.5 pl-1 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
        >
          <span className="bg-brand-primary-background rounded-xs flex size-6 items-center justify-center p-1">
            <ActionIcon
              size={16}
              className="text-brand-primary-foreground"
              aria-hidden="true"
            />
          </span>
          <span className="body-03 text-card-foreground text-center whitespace-nowrap">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
