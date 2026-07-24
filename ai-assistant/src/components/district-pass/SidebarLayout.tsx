import * as React from "react";

export interface DistrictPassSection {
  value: string;
  label: string;
  content: React.ReactNode;
}

/**
 * One sidebar navigation row — the District Pass section item (36px row,
 * 2px purple left accent + tinted background while active). Shared with the
 * assistant's Preferences dialog so section navs look the same everywhere.
 */
export function SidebarNavItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`focus-visible:outline-focus flex h-9 cursor-pointer items-center rounded-xs border-l-2 px-3 text-left text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid ${
        active
          ? "border-l-[#6b1cbb] bg-[#f0e8ff] text-brand-primary-foreground"
          : "border-l-transparent text-primary-foreground-muted hover:bg-[#fafafa] hover:text-primary-foreground"
      }`}
    >
      {children}
    </button>
  );
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
        className="flex w-[202px] shrink-0 flex-col"
      >
        {sections.map((section) => (
          <SidebarNavItem
            key={section.value}
            active={section.value === active}
            onClick={() => setActive(section.value)}
          >
            {section.label}
          </SidebarNavItem>
        ))}
      </nav>
      <div className="min-w-0 flex-1">{current?.content}</div>
    </div>
  );
}
