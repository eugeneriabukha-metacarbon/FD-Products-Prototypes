import { motion } from "motion/react";
import { CaretRightIcon } from "@phosphor-icons/react";

import brandmarkUrl from "../assets/fd-brandmark.svg";
import aiAssistantIcon from "../assets/app-ai-assistant.svg";
import agentWalletIcon from "../assets/app-agent-wallet.svg";
import prismIcon from "../assets/app-prism.svg";
import districtPassIcon from "../assets/app-district-pass.svg";
import { LaunchpadHeader } from "./LaunchpadHeader";
import { LaunchpadAppCard } from "./LaunchpadAppCard";

export interface LaunchpadProps {
  /** Enter the AI Assistant app. */
  onOpenAssistant: () => void;
  /** Open the District Pass coming-soon stub. */
  onOpenDistrictPass: () => void;
  /** Open the paywall (profile menu). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/** Decorative documentation shortcuts in the hero. */
const DOC_CHIPS = ["Developer hub", "API reference", "FAQs"];

/** Decorative footer navigation links. */
const FOOTER_LINKS = ["Docs", "Support", "Terms", "Privacy", "FAQ"];

/**
 * FD Launchpad — the app-switcher landing reached from the header's
 * SquaresFourIcon. Hero + documentation chips on the left, product list on the
 * right. Only AI Assistant and District Pass are interactive; the rest are
 * disabled (Keychain shows a "Soon" badge).
 */
export function Launchpad({
  onOpenAssistant,
  onOpenDistrictPass,
  onUpgrade,
  hasPaidPlan = false,
}: LaunchpadProps) {
  const apps = [
    {
      icon: aiAssistantIcon,
      title: "AI Assistant",
      subtitle:
        "Execute trades, swaps, transfers and discover strategies through natural language.",
      onClick: onOpenAssistant,
    },
    {
      icon: agentWalletIcon,
      title: "Agent Wallet",
      subtitle:
        "Programmatic spending controls, role-based access, all through a single wallet address.",
      disabled: true,
    },
    {
      icon: prismIcon,
      title: "Prism Payment Gateway",
      subtitle:
        "Plug-and-play architecture for stablecoin payments and atomic fee settlement.",
      disabled: true,
    },
    {
      icon: districtPassIcon,
      title: "District Pass",
      subtitle:
        "One identity across all Finance District products and services.",
      onClick: onOpenDistrictPass,
    },
    {
      icon: districtPassIcon,
      title: "Keychain",
      subtitle:
        "Securely manage your keys, permissions access and transactions.",
      disabled: true,
      badge: "Soon",
    },
  ];

  return (
    <div className="bg-surface isolate flex h-screen flex-col">
      <LaunchpadHeader onUpgrade={onUpgrade} hasPaidPlan={hasPaidPlan} />

      <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto py-16">
        <div className="flex w-[906px] max-w-full items-start gap-8 px-4">
          {/* left column — hero + doc chips */}
          <motion.div
            className="flex w-[437px] max-w-full flex-col gap-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex max-w-[600px] flex-col gap-4">
              <h1
                className="display-01 text-primary-foreground"
                style={{ fontVariationSettings: '"wdth" 110' }}
              >
                Welcome back,
                <br />
                Janno
              </h1>
              <p className="body-03 text-primary-foreground-muted">
                Choose the app you wish to explore or check our documentation:
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {DOC_CHIPS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="border-card-border bg-card-background hover:bg-card-accent focus-visible:outline-focus inline-flex h-10 cursor-pointer items-center gap-0.5 rounded-md border px-3 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                >
                  <span className="body-02-medium text-card-foreground whitespace-nowrap">
                    {label}
                  </span>
                  <CaretRightIcon
                    size={16}
                    className="text-card-foreground-muted"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* right column — product list */}
          <motion.div
            className="flex flex-1 justify-center"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.06, delayChildren: 0.1 },
              },
            }}
          >
            <div className="w-[438px] max-w-full overflow-hidden">
              {apps.map((app) => (
                <motion.div
                  key={app.title}
                  className="border-card-border border-b last:border-b-0"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <LaunchpadAppCard
                    icon={<img src={app.icon} alt="" className="size-6" />}
                    title={app.title}
                    subtitle={app.subtitle}
                    onClick={app.onClick}
                    disabled={app.disabled}
                    badge={app.badge}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* footer — decorative */}
      <footer className="flex w-full shrink-0 items-center justify-center py-5">
        <div className="flex w-[906px] max-w-full items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <img src={brandmarkUrl} alt="" className="h-2.5 w-3" />
            <span className="body-04 text-primary-foreground-muted">
              FD Technologies
            </span>
            <span className="body-04 text-primary-foreground-muted">•</span>
            <span className="body-04 text-primary-foreground-muted">
              Agentic payments infrastructure
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {FOOTER_LINKS.map((link) => (
              <span
                key={link}
                className="body-04 text-primary-foreground-muted"
              >
                {link}
              </span>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
