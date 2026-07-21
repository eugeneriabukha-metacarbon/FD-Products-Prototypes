import * as React from "react";

export interface DistrictPassSection {
  value: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Sidebar navigation variant: a vertical section list on the left and the
 * selected section's content on the right. The section content is identical to
 * the tabs layout — only the navigation chrome differs. Widths follow Figma
 * 552:46339 (sidebar 202px · 32px gap · content fills the rest).
 */
export function SidebarLayout({ sections }: { sections: DistrictPassSection[] }) {
  const [active, setActive] = React.useState(sections[0]?.value);
  const current = sections.find((s) => s.value === active) ?? sections[0];

  return (
    <div className="flex gap-8">
      <nav
        aria-label="District Pass sections"
        className="flex w-[202px] shrink-0 flex-col gap-1"
      >
        {sections.map((section) => {
          const isActive = section.value === active;
          return (
            <button
              key={section.value}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActive(section.value)}
              className={`focus-visible:outline-focus cursor-pointer rounded-sm px-4 py-3 text-left text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid ${
                isActive
                  ? "bg-[#f0e8ff] text-brand-primary-foreground"
                  : "text-primary-foreground-muted hover:text-primary-foreground"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">{current?.content}</div>
    </div>
  );
}
