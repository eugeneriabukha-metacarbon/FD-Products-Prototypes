import * as React from "react";
import { CaretRightIcon } from "@phosphor-icons/react";

export interface LaunchpadAppCardProps {
  /** 24px product icon rendered inside the brand-tint avatar. */
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  /** Handler for interactive cards. Omit for cards that aren't wired up. */
  onClick?: () => void;
  /** Dim + make non-interactive (product not available in the prototype yet). */
  disabled?: boolean;
  /** Trailing pill (e.g. "Soon"); replaces the caret when present. */
  badge?: string;
}

/**
 * A single product row in the Launchpad app list: brand-tint avatar + title +
 * two-line subtitle + trailing caret or badge. Prototype-local because the DS
 * FeatureCard truncates its subtitle and has no avatar / disabled support.
 */
export function LaunchpadAppCard({
  icon,
  title,
  subtitle,
  onClick,
  disabled = false,
  badge,
}: LaunchpadAppCardProps) {
  const interactive = !disabled && onClick != null;

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="bg-card-brand-background flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-sm"
      >
        <span className="flex size-6 items-center justify-center">{icon}</span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="body-02-medium text-card-foreground">{title}</span>
        <span className="body-03 text-card-foreground-muted text-left">
          {subtitle}
        </span>
      </span>

      <span className="flex shrink-0 items-center">
        {badge != null ? (
          <span className="bg-brand-primary-background text-brand-primary-foreground body-04 rounded-2xl px-1.5 py-0.5">
            {badge}
          </span>
        ) : (
          <CaretRightIcon
            size={20}
            className="text-card-foreground-muted"
            aria-hidden="true"
          />
        )}
      </span>
    </>
  );

  const className =
    "flex w-full items-center gap-5 p-5 text-left transition-colors";

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} hover:bg-card-accent hover:rounded-[6px] focus-visible:outline-focus cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`${className} ${disabled ? "opacity-50" : ""}`}>
      {inner}
    </div>
  );
}
