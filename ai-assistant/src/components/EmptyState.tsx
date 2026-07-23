import * as React from "react";

/**
 * Empty-state block (Figma Styleguide 5034:2568) — a bordered, rounded card
 * centering a 24px muted icon, a title, an optional muted description, and an
 * optional action. Used for richer "nothing here" moments than a bare line.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card-background border-card-border rounded-md flex w-full flex-col items-center justify-center border p-8">
      <div className="flex w-[320px] max-w-full flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="text-card-foreground-muted flex items-center [&_svg]:size-6"
        >
          {icon}
        </span>
        <div className="flex flex-col items-center gap-1">
          <p className="body-02-medium text-card-foreground">{title}</p>
          {description != null && (
            <p className="body-03 text-card-foreground-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
