import { useCutCornerClipPath } from "@financedistrict/apps-ui/cut-corner";
import { ACCOUNT_EMAIL } from "./mockData";

const CARD_CUT = { cut: 24, radius: 2, radiusCuts: 0 } as const;

/**
 * District Pass hero card — display-only identity summary (avatar, display
 * name, email, join year). The name is edited from the Account section's
 * Nickname row, not here.
 */
export function PassCard({
  name,
  initials,
}: {
  name: string;
  initials: string;
}) {
  const { ref, clipPath } = useCutCornerClipPath<HTMLDivElement>(CARD_CUT.cut, {
    radius: CARD_CUT.radius,
    radiusCuts: CARD_CUT.radiusCuts,
  });

  return (
    <div
      ref={ref}
      style={{ clipPath }}
      className="bg-card-brand-secondary-background text-card-brand-secondary-foreground flex items-center justify-between gap-4 px-7 py-8"
    >
      <div className="flex items-center gap-4">
        <span className="button-01 bg-brand-primary-background text-brand-primary-foreground flex size-14 items-center justify-center rounded-sm text-xl">
          {initials}
        </span>
        <div className="flex flex-col gap-1">
          <span className="display-03">{name}</span>
          <span className="body-03 text-card-brand-secondary-foreground-muted">
            {ACCOUNT_EMAIL}
          </span>
        </div>
      </div>

      <span className="body-03 text-card-brand-secondary-foreground-muted">
        Joined 2024
      </span>
    </div>
  );
}
