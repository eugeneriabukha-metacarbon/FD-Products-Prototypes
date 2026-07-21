import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { Select, type SelectOption } from "@financedistrict/apps-ui/select";

/**
 * Stakeholder-only preview toolbar. It does not ship as product UI — it lets a
 * reviewer flip the District Pass page between design variants live. Two
 * independent axes:
 *   - Navigation: how the sections are navigated (tabs today; sidebar later).
 *   - Settings: the overall content preset (basic today; more later).
 * Add a variant by appending to the option lists below and handling its value
 * where DistrictPass branches on `navigation` / `settings`.
 */
export const NAVIGATION_OPTIONS: SelectOption[] = [
  { value: "tabs", label: "Tabs" },
  { value: "sidebar", label: "Sidebar" },
];

export const SETTINGS_OPTIONS: SelectOption[] = [{ value: "basic", label: "Basic" }];

/** Stand-in shown when a not-yet-built variant is selected in the toolbar. */
export function VariantPlaceholder({ label }: { label: string }) {
  return (
    <div className="border-card-border flex min-h-[240px] flex-col items-center justify-center gap-1 rounded-md border border-dashed p-8 text-center">
      <span className="text-primary-foreground text-sm font-medium">
        {label}
      </span>
      <span className="body-03 text-primary-foreground-muted">
        This variant hasn't been generated yet.
      </span>
    </div>
  );
}

export function Configurator({
  navigation,
  settings,
  onNavigationChange,
  onSettingsChange,
}: {
  navigation: string;
  settings: string;
  onNavigationChange: (value: string) => void;
  onSettingsChange: (value: string) => void;
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
      <div className="w-[180px]">
        <Select
          label="Settings"
          options={SETTINGS_OPTIONS}
          value={settings}
          onValueChange={(value) => onSettingsChange(value as string)}
        />
      </div>
    </div>
  );
}
