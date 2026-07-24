import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Dialog } from "@financedistrict/apps-ui/dialog";
import { Switch } from "@financedistrict/apps-ui/switch";
import { Toast } from "@financedistrict/apps-ui/toast";

import logoUrl from "../assets/ai-assistant-logo.svg";
import { PlanManagement } from "./PlanManagement";

export type PlanId = "free" | "plus" | "pro";

/** Tier ordering, so a target plan reads as an upgrade vs. a sideways switch. */
const PLAN_RANK: Record<PlanId, number> = { free: 0, plus: 1, pro: 2 };

interface Plan {
  id: PlanId;
  name: string;
  priceYearly: string;
  priceMonthly: string;
  description: string;
  features: string[];
  brand?: boolean;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceYearly: "$0",
    priceMonthly: "$0",
    description: "Get started with the essentials.",
    features: [
      "50 messages per day",
      "1 workspace",
      "Basic AI model",
      "Standard speed",
      "Community support",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    priceYearly: "$10",
    priceMonthly: "$1",
    description: "Unlock more AI capabilities.",
    features: [
      "Unlimited messages",
      "3 workspaces",
      "GPT-4o model",
      "Priority speed",
      "Payment automation",
      "Email support",
    ],
    brand: true,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceYearly: "$20",
    priceMonthly: "$2",
    description: "Get maximum performance.",
    features: [
      "Everything in Plus",
      "Unlimited workspaces",
      "Custom AI models",
      "API access",
      "Team management",
      "Dedicated support",
    ],
  },
];

/** The hardcoded end of the mock billing period (renewal / retention date). */
const RENEWS_ON = "Aug 8, 2026";

export interface PaywallProps {
  onClose: () => void;
  /** The plan the user is currently on (owned by App so it persists). */
  currentPlan: PlanId;
  /**
   * The paid plan has been cancelled — features are retained until the period
   * ends, so the manage layout stays with a pending-Free card (Figma 574:88597).
   */
  cancelled?: boolean;
  /** Switch/upgrade commits the new plan (also clears a cancellation). */
  onChangePlan: (plan: PlanId) => void;
  /** Cancel keeps the plan until period end instead of dropping to Free. */
  onCancelPlan: () => void;
}

/** Plans screen (Figma node 488:227717) — also handles switching & cancelling. */
export function Paywall({
  onClose,
  currentPlan,
  cancelled = false,
  onChangePlan,
  onCancelPlan,
}: PaywallProps) {
  const [yearly, setYearly] = React.useState(true);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  // Paid users land on the management view; "Upgrade plan" opens the plan grid.
  const [view, setView] = React.useState<"manage" | "plans">("manage");
  const [toast, setToast] = React.useState<string | null>(null);
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

  const currentPlanData = PLANS.find((p) => p.id === currentPlan);
  const onPaidPlan = currentPlan !== "free";
  const currentPlanName = currentPlanData?.name ?? "Free";
  // Show the management view only for a paid plan that hasn't opted into the grid.
  const showManage = onPaidPlan && view === "manage";

  const handleCancel = () => {
    // The layout stays on the manage view — only the current-plan card flips
    // to the pending-Free state (plan features retained until period end).
    onCancelPlan();
    setCancelOpen(false);
    showToast(
      `Your plan has been cancelled — you'll keep ${currentPlanName} until ${RENEWS_ON}.`,
    );
  };

  const handleChangePlan = (plan: PlanId) => {
    // A cancelled plan is pending-Free, so any paid pick reads as an upgrade.
    const isUpgrade =
      PLAN_RANK[plan] > (cancelled ? 0 : PLAN_RANK[currentPlan]);
    const name = PLANS.find((p) => p.id === plan)?.name ?? plan;
    onChangePlan(plan);
    // Returning to a paid plan drops back to the management view.
    if (plan !== "free") setView("manage");
    showToast(
      isUpgrade
        ? `You've upgraded to the ${name} plan.`
        : `You've switched to the ${name} plan.`,
    );
  };

  return (
    <div className="bg-surface flex h-screen flex-col overflow-y-auto">
      {/* header — glass (Figma 474:143342): sticky in the page scroller, the
          plan grid frosts through the translucent blur when scrolled. */}
      <header className="bg-surface/[80%] sticky top-0 z-30 flex w-full shrink-0 items-center justify-between px-4 py-5 backdrop-blur-md">
        <div className="flex w-72 items-center gap-4">
          {onPaidPlan && !cancelled && view === "plans" ? (
            <Button
              variation="ghost"
              size="sm"
              leftSlot={<ArrowLeftIcon aria-hidden="true" />}
              onClick={() => setView("manage")}
            >
              Back
            </Button>
          ) : (
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
          )}
        </div>

        <p className="body-01-medium text-primary-foreground absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          {showManage
            ? "Manage your plan"
            : cancelled
              ? "Upgrade plan"
              : onPaidPlan
                ? "Change your plan"
                : "Upgrade your plan"}
        </p>

        <div className="flex w-72 items-center justify-end gap-4">
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            aria-label="Close"
            onClick={onClose}
          >
            <XIcon size={20} className="text-card-foreground-muted" />
          </Button>
        </div>
      </header>

      {showManage ? (
        <PlanManagement
          planName={currentPlanName}
          priceYearly={currentPlanData?.priceYearly ?? "$0"}
          renewsOn={RENEWS_ON}
          cancelled={cancelled}
          onUpgrade={() => setView("plans")}
          onCancel={() => setCancelOpen(true)}
        />
      ) : (
        <>
          {/* page header: title + billing switcher */}
          <section className="flex w-full flex-col items-center gap-6 pt-16 pb-8">
            <div className="flex w-[438px] max-w-full flex-col items-center gap-2 text-center">
              <h1 className="display-03 text-primary-foreground w-full">
                {onPaidPlan && !cancelled
                  ? `You're on the ${currentPlanName} plan`
                  : "Select the plan that works best for you"}
              </h1>
              <p className="body-03 text-primary-foreground-muted w-full">
                {onPaidPlan && !cancelled
                  ? "Change tiers anytime, or cancel to return to the Free plan."
                  : "Unlock unlimited AI conversations, advanced models, and agent automation."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span
                className={`${yearly ? "body-03 text-foreground-muted" : "body-03-medium text-foreground-accent"} w-[120px] text-right`}
              >
                Monthly
              </span>
              <Switch
                checked={yearly}
                onCheckedChange={setYearly}
                aria-label="Bill yearly"
              />
              <span
                className={`${yearly ? "body-03-medium text-foreground-accent" : "body-03 text-foreground-muted"} w-[120px]`}
              >
                Yearly
              </span>
            </div>
          </section>

          {/* plans */}
          <section className="flex w-full flex-col items-center pb-16">
            <div className="flex w-[906px] max-w-full items-stretch justify-center gap-4 px-4">
              {/* Free (upgrade) flow shows all three incl. the current Free card;
              a paid "change plan" flow shows only the plans you can switch TO.
              A cancelled plan reads as pending-Free: all three cards, none
              marked current (the Free card carries the retention note). */}
              {(onPaidPlan && !cancelled
                ? PLANS.filter((plan) => plan.id !== currentPlan)
                : PLANS
              ).map((plan, index) => {
                const isCurrent = !cancelled && plan.id === currentPlan;
                const neutral = !plan.brand;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                      delay: 0.06 + index * 0.08,
                    }}
                    className={`${
                      neutral
                        ? "border-card-border"
                        : "border-card-brand-border"
                    } rounded-md flex min-w-px flex-1 flex-col overflow-clip border`}
                  >
                    {/* card header */}
                    <div
                      className={`${
                        neutral
                          ? "bg-card-background border-card-border"
                          : "bg-card-brand-background border-card-brand-border"
                      } flex h-[216px] w-full flex-col gap-6 border-b p-6`}
                    >
                      <div className="flex w-full flex-col gap-2">
                        <div className="flex w-full items-center justify-between">
                          <p
                            className={`${
                              neutral
                                ? "text-card-foreground"
                                : "text-card-brand-foreground"
                            } body-02-medium`}
                          >
                            {plan.name}
                          </p>
                          {!isCurrent && plan.popular && (
                            <span className="bg-brand-primary-background text-brand-primary-foreground rounded-full body-04 px-1.5 py-0.5">
                              Popular
                            </span>
                          )}
                        </div>
                        <div
                          className={`${
                            plan.id === "free"
                              ? "text-card-foreground-muted"
                              : neutral
                                ? "text-card-foreground"
                                : "text-card-brand-foreground"
                          } flex w-full items-baseline gap-1 whitespace-nowrap`}
                        >
                          <span
                            className="display-01"
                            style={{ fontVariationSettings: '"wdth" 110' }}
                          >
                            {yearly ? plan.priceYearly : plan.priceMonthly}
                          </span>
                          <span
                            className={`${
                              neutral
                                ? "text-card-foreground-muted"
                                : "text-card-brand-foreground-muted"
                            } body-03`}
                          >
                            USD / {yearly ? "year" : "month"}
                          </span>
                        </div>
                        <p
                          className={`${
                            neutral
                              ? "text-card-foreground-muted"
                              : "text-card-brand-foreground-muted"
                          } body-03 w-full`}
                        >
                          {plan.description}
                        </p>
                      </div>

                      {isCurrent ? (
                        <Button
                          variation="primary"
                          size="md"
                          disabled
                          wrapperClassName="w-full"
                          className="w-full"
                        >
                          Your current plan
                        </Button>
                      ) : plan.id === "free" ? (
                        cancelled ? (
                          // Already cancelled — Free is pending, nothing to do.
                          <Button
                            variation="primary"
                            size="md"
                            disabled
                            wrapperClassName="w-full"
                            className="w-full"
                          >
                            {`${currentPlanName} until ${RENEWS_ON}, then Free`}
                          </Button>
                        ) : (
                          // From a paid plan, moving to Free ends the subscription —
                          // routed through the same cancel confirmation.
                          <Button
                            variation="secondary"
                            size="md"
                            wrapperClassName="w-full"
                            className="w-full"
                            onClick={() => setCancelOpen(true)}
                          >
                            Change to Free
                          </Button>
                        )
                      ) : (
                        <Button
                          variation={plan.brand ? "brand" : "primary"}
                          size="md"
                          wrapperClassName="w-full"
                          className="w-full"
                          onClick={() => handleChangePlan(plan.id)}
                        >
                          {PLAN_RANK[plan.id] >
                          (cancelled ? 0 : PLAN_RANK[currentPlan])
                            ? `Upgrade to ${plan.name}`
                            : `Switch to ${plan.name}`}
                        </Button>
                      )}
                    </div>

                    {/* card footer: feature list */}
                    <div
                      className={`${
                        neutral
                          ? "bg-card-background"
                          : "bg-card-brand-background"
                      } flex w-full flex-1 flex-col gap-6 p-6`}
                    >
                      <ul className="flex w-full flex-col gap-2">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex w-full items-center gap-1"
                          >
                            <CheckIcon
                              size={16}
                              className={`${
                                neutral
                                  ? "text-card-foreground"
                                  : "text-card-brand-foreground-muted"
                              } shrink-0`}
                              aria-hidden="true"
                            />
                            <span
                              className={`${
                                neutral
                                  ? "text-card-foreground"
                                  : "text-card-brand-foreground-muted"
                              } body-03 whitespace-nowrap`}
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* Cancellation confirmation (DS Dialog, controlled). */}
      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
        <Dialog.Content>
          <Dialog.Header
            title={`Cancel your ${currentPlanName} plan?`}
            description={`You'll keep ${currentPlanName} features until the end of your billing period, then move to the Free plan. You can re-subscribe anytime.`}
            showClose
          />
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variation="secondary">Keep my plan</Button>
            </Dialog.Close>
            <Button variation="destructive" onClick={handleCancel}>
              Cancel plan
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

      {/* Plan-change confirmation — presentational DS Toast, auto-dismissed. */}
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
