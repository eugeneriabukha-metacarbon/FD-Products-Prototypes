import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { Select, type SelectOption } from "@financedistrict/apps-ui/select";

/**
 * Stakeholder-only preview toolbar. It does not ship as product UI — it lets a
 * reviewer flip the District Pass page between navigation variants live (tabs
 * vs. sidebar). Add a variant by appending to NAVIGATION_OPTIONS and handling
 * its value where DistrictPass branches on `navigation`.
 */
export const NAVIGATION_OPTIONS: SelectOption[] = [
  { value: "tabs", label: "Tabs" },
  { value: "sidebar", label: "Sidebar" },
];

export function Configurator({
  navigation,
  onNavigationChange,
}: {
  navigation: string;
  onNavigationChange: (value: string) => void;
}) {
  return (
    <div className="border-card-border bg-card-background flex flex-wrap items-end gap-x-6 gap-y-3 border-y px-4 py-3">
      <span className="text-primary-foreground-muted flex items-center gap-1.5 pb-1 text-xs font-medium tracking-wide uppercase">
        <SlidersHorizontalIcon size={14} aria-hidden="true" />
        <span>
          Layout
          <br />
          configurator
        </span>
      </span>
      <div className="w-[180px]">
        <Select
          label="Navigation"
          options={NAVIGATION_OPTIONS}
          value={navigation}
          onValueChange={(value) => onNavigationChange(value as string)}
        />
      </div>
    </div>
  );
}
