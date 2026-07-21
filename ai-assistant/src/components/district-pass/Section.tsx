import * as React from "react";

export function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="display-04 text-primary-foreground">
          {title}
        </h2>
        {caption && (
          <p className="body-03 text-primary-foreground-muted">{caption}</p>
        )}
      </div>
      {children}
    </section>
  );
}
