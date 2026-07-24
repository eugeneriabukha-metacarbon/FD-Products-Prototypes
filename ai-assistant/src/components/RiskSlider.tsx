import * as React from "react";
import { motion } from "motion/react";

export type RiskProfile = "conservative" | "balanced" | "aggressive";

/** The three risk levels, in track order, with the explainer shown beneath. */
export const RISK_LEVELS: {
  value: RiskProfile;
  label: string;
  blurb: string;
}[] = [
  {
    value: "conservative",
    label: "Conservative",
    blurb:
      "Prioritizes capital preservation — stablecoin yields, blue-chip staking, and low-volatility suggestions.",
  },
  {
    value: "balanced",
    label: "Balanced",
    blurb:
      "A mix of stability and growth — diversified strategies with moderate risk exposure.",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    blurb:
      "Chases higher returns — early-stage tokens and higher-volatility strategies.",
  },
];

/**
 * Level → accent classes. `accent` doubles as bg + currentColor (the thumb's
 * halo is a currentColor box-shadow); `text` colors the active label. Full
 * literal class names so the prod Tailwind scan keeps them.
 */
const LEVEL_STYLE: Record<RiskProfile, { accent: string; text: string }> = {
  conservative: {
    accent: "bg-success-primary-foreground text-success-primary-foreground",
    text: "text-success-primary-foreground",
  },
  // `data-purple` (purple-500) over the pale `brand-primary-background`
  // (purple-200) so all three accents carry the same visual weight.
  balanced: {
    accent: "bg-data-purple text-data-purple",
    text: "text-data-purple",
  },
  aggressive: {
    accent:
      "bg-destructive-primary-foreground text-destructive-primary-foreground",
    text: "text-destructive-primary-foreground",
  },
};

const SPRING = { type: "spring", stiffness: 500, damping: 38 } as const;

/**
 * Discrete three-stop slider for the assistant's risk profile. No DS slider
 * exists, so this is prototype-local: radio semantics (sr-only inputs — labels
 * click, arrow keys move within the group) under a slider look — a track from
 * the first to the last stop, accent fill up to the selection, and a
 * spring-animated ringed thumb with a soft currentColor halo. The accent
 * shifts with the level (Conservative green → Balanced brand → Aggressive
 * red) via CSS color transitions. The whole control also drags: pointer
 * down/move on the root snaps the selection to the nearest stop (column
 * thirds), with the thumb popping while held. Focus ring surfaces on the
 * thumb via `group-has-[:focus-visible]`.
 */
export function RiskSlider({
  value,
  onChange,
}: {
  value: RiskProfile;
  onChange: (value: RiskProfile) => void;
}) {
  const name = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const index = RISK_LEVELS.findIndex((level) => level.value === value);
  const style = LEVEL_STYLE[value];

  /** Snap a pointer x to the nearest stop (label columns = thirds). */
  const levelFromX = (clientX: number): RiskProfile | null => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const ratio = (clientX - rect.left) / rect.width;
    const snapped = Math.min(2, Math.max(0, Math.floor(ratio * 3)));
    return RISK_LEVELS[snapped].value;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    // Synthetic pointer events can't be captured (throws) — same guard as the
    // sidebar resize handle.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* no capture for synthetic pointers */
    }
    const next = levelFromX(event.clientX);
    if (next) onChange(next);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const next = levelFromX(event.clientX);
    if (next) onChange(next);
  };

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label="Risk profile"
      className="group/risk relative touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {/* Visual layer — track between the first/last column centers (100%/6
          from each edge), stops at 0/50/100% of it, accent fill + thumb at
          the selection. Decorative: clicks land on the root/labels. */}
      <div
        aria-hidden="true"
        className="bg-card-border pointer-events-none absolute top-2 right-[calc(100%/6)] left-[calc(100%/6)] h-1 rounded-full"
      >
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-300 ${style.accent}`}
          initial={false}
          animate={{ width: `${index * 50}%` }}
          transition={SPRING}
        />
        {RISK_LEVELS.map((level, stop) => (
          <span
            key={level.value}
            className={`absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
              stop <= index ? style.accent : "bg-card-border"
            }`}
            style={{ left: `${stop * 50}%` }}
          />
        ))}
        {/* Thumb — white ring + soft currentColor halo; pops while dragged.
            x/y/scale live in motion (a class translate would be overwritten
            by motion's transform). */}
        <motion.span
          className={`outline-focus absolute top-1/2 left-0 size-5 rounded-full border-2 border-card-background transition-colors duration-300 group-has-[:focus-visible]/risk:outline-2 group-has-[:focus-visible]/risk:outline-offset-2 group-has-[:focus-visible]/risk:outline-solid ${style.accent}`}
          style={{
            boxShadow: "0 0 0 6px color-mix(in srgb, currentcolor 18%, transparent)",
          }}
          initial={false}
          animate={{
            left: `${index * 50}%`,
            x: "-50%",
            y: "-50%",
            scale: dragging ? 1.2 : 1,
          }}
          transition={SPRING}
        />
      </div>

      {/* Click/keyboard layer — three equal columns whose padding covers the
          track zone; the sr-only radios keep arrow-key + AT support. */}
      <div className="relative grid grid-cols-3">
        {RISK_LEVELS.map((level) => {
          const selected = level.value === value;
          return (
            <label
              key={level.value}
              className="flex cursor-pointer justify-center pt-7"
            >
              <input
                type="radio"
                name={name}
                value={level.value}
                checked={selected}
                onChange={() => onChange(level.value)}
                className="sr-only"
              />
              <span
                className={`transition-colors duration-300 ${
                  selected
                    ? `body-03-medium ${style.text}`
                    : "body-03 text-card-foreground-muted"
                }`}
              >
                {level.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
