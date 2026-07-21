import { EnvelopeIcon, QuestionIcon } from "@phosphor-icons/react";
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
      <div className="border-card-border border-b last:border-b-0">
        <FeatureCard
          asChild
          title="Contact support"
          subtitle="Get help from our team."
          leading={<EnvelopeIcon />}
        >
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onToast("Support request started.")}
          />
        </FeatureCard>
      </div>
      <div className="border-card-border border-b last:border-b-0">
        <FeatureCard
          asChild
          title="Help center"
          subtitle="Browse FAQs and guides."
          leading={<QuestionIcon />}
        >
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onToast("Opening the help center…")}
          />
        </FeatureCard>
      </div>
    </div>
  );
}
