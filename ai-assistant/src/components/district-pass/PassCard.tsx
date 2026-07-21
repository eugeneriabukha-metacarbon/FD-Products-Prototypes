import { SealCheckIcon } from "@phosphor-icons/react";
import { useCutCornerClipPath } from "@financedistrict/apps-ui/cut-corner";
import brandmark from "../../assets/fd-brandmark.svg";
import { PASS_ID, MEMBER_SINCE } from "./mockData";

const CARD_CUT = { cut: 16, radius: 2, radiusCuts: 0 } as const;

export function PassCard({
  name,
  initials,
  connectedCount,
}: {
  name: string;
  initials: string;
  connectedCount: number;
}) {
  const { ref, clipPath } = useCutCornerClipPath<HTMLDivElement>(CARD_CUT.cut, {
    radius: CARD_CUT.radius,
    radiusCuts: CARD_CUT.radiusCuts,
  });

  return (
    <div
      ref={ref}
      style={{ clipPath }}
      className="bg-primary-foreground text-surface relative flex flex-col gap-6 overflow-hidden p-6"
    >
      {/* brand watermark */}
      <img
        src={brandmark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-6 size-40 opacity-[0.06]"
      />

      <div className="flex items-center gap-4">
        <span className="button-01 bg-brand-primary-accent text-brand-primary-foreground flex size-14 items-center justify-center rounded-sm text-xl">
          {initials}
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold">{name}</span>
            <SealCheckIcon
              size={18}
              weight="fill"
              className="text-brand-primary-accent"
              aria-label="Verified identity"
            />
          </div>
          <span className="body-03 opacity-70">{MEMBER_SINCE}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span className="font-mono text-sm tracking-widest opacity-80">
          {PASS_ID}
        </span>
        <span className="body-03 opacity-70">
          {connectedCount} connected {connectedCount === 1 ? "app" : "apps"}
        </span>
      </div>
    </div>
  );
}
