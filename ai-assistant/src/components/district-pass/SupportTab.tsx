import { ChatCircleIcon, QuestionIcon } from "@phosphor-icons/react";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";

/**
 * Support tab — two clickable `FeatureCard` rows (Contact support / Help
 * center). Neither navigates anywhere in the prototype, so each is wired via
 * `asChild` around a plain `button` (composes the card's own `onClick`),
 * matching the FeatureCard `asChild` pattern rather than `href`. Actions are
 * simulated and confirmed via `onToast`.
 */
export function SupportTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-card-border border-b">
        <FeatureCard
          asChild
          title="Contact support"
          subtitle="Get help from our team."
          leading={<ChatCircleIcon />}
        >
          <button
            type="button"
            onClick={() => onToast("Support request started.")}
          />
        </FeatureCard>
      </div>
      <FeatureCard
        asChild
        title="Help center"
        subtitle="Browse FAQs and guides."
        leading={<QuestionIcon />}
      >
        <button
          type="button"
          onClick={() => onToast("Opening the help center…")}
        />
      </FeatureCard>
    </div>
  );
}
