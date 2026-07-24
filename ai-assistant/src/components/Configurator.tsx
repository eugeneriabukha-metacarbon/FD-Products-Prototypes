import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDownIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import type { SelectOption } from "@financedistrict/apps-ui/select";
import { Switch } from "@financedistrict/apps-ui/switch";

import { RightAlignedInlineSelect } from "./RightAlignedInlineSelect";

export type SidebarBackgroundColor = "beige" | "white";

export type BackgroundPatternPlacement = "all" | "new-chat";

/** Preview axes for the AI Assistant, driven by the floating configurator. */
export interface AssistantConfig {
  /** Give the chats sidebar its own background surface (off = current view). */
  sidebarBackground: boolean;
  /** Which surface the sidebar background uses (only when `sidebarBackground`). */
  sidebarBackgroundColor: SidebarBackgroundColor;
  /** Show a decorative pattern on the chat canvas. */
  backgroundPattern: boolean;
  /** Where the pattern shows (only when `backgroundPattern`). */
  backgroundPatternPlacement: BackgroundPatternPlacement;
}

export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  sidebarBackground: false,
  sidebarBackgroundColor: "beige",
  backgroundPattern: false,
  backgroundPatternPlacement: "all",
};

/** Boolean toggle axes, in display order. */
const TOGGLES: { key: "sidebarBackground" | "backgroundPattern"; label: string }[] =
  [
    { key: "sidebarBackground", label: "Sidebar background" },
    { key: "backgroundPattern", label: "Background pattern" },
  ];

const SIDEBAR_COLOR_OPTIONS: SelectOption[] = [
  { value: "beige", label: "Beige" },
  { value: "white", label: "White" },
];

const PATTERN_PLACEMENT_OPTIONS: SelectOption[] = [
  { value: "all", label: "All screens" },
  { value: "new-chat", label: "New chat only" },
];

/**
 * Stakeholder-only preview panel (not product UI) — floats in the bottom-right
 * corner of the AI Assistant and flips the page between visual variants live.
 * Collapsible to a lone sliders button. Add an axis by extending
 * `AssistantConfig` + `TOGGLES` and handling the flag where the page branches.
 */
export function Configurator({
  config,
  onChange,
}: {
  config: AssistantConfig;
  onChange: (config: AssistantConfig) => void;
}) {
  const [open, setOpen] = React.useState(true);

  const set = <K extends keyof AssistantConfig>(
    key: K,
    value: AssistantConfig[K],
  ) => onChange({ ...config, [key]: value });

  return (
    <div className="fixed right-4 bottom-4 z-40">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right" }}
            className="border-card-border bg-card-background rounded-sm shadow-s w-[248px] border"
          >
            <div className="border-card-border flex items-center justify-between border-b px-3 py-2">
              <span className="text-primary-foreground-muted flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
                <SlidersHorizontalIcon size={14} aria-hidden="true" />
                Configurator
              </span>
              <button
                type="button"
                aria-label="Collapse configurator"
                onClick={() => setOpen(false)}
                className="text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus flex cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
              >
                <CaretDownIcon size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col px-3 py-3">
              {TOGGLES.map((toggle, index) => (
                <React.Fragment key={toggle.key}>
                  {/* Full-width divider between groups (breaks out of the px-3). */}
                  {index > 0 && (
                    <div
                      aria-hidden="true"
                      className="border-card-border -mx-3 my-3 border-t"
                    />
                  )}

                  {/* One settings group: the toggle + any sub-options. */}
                  <div className="flex flex-col gap-3">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <span className="body-03 text-card-foreground">
                        {toggle.label}
                      </span>
                      <Switch
                        checked={config[toggle.key]}
                        onCheckedChange={(value) => set(toggle.key, value)}
                        aria-label={toggle.label}
                      />
                    </label>

                    {/* Sidebar-colour sub-option, shown only while the toggle is on. */}
                    {toggle.key === "sidebarBackground" &&
                      config.sidebarBackground && (
                        <div className="flex items-center justify-between gap-4 pl-3">
                          <span className="body-03 text-card-foreground-muted">
                            Color
                          </span>
                          <RightAlignedInlineSelect
                            options={SIDEBAR_COLOR_OPTIONS}
                            value={config.sidebarBackgroundColor}
                            onValueChange={(value) =>
                              set(
                                "sidebarBackgroundColor",
                                value as SidebarBackgroundColor,
                              )
                            }
                            aria-label="Sidebar background color"
                          />
                        </div>
                      )}

                    {/* Pattern-placement sub-option, shown only while the toggle is on. */}
                    {toggle.key === "backgroundPattern" &&
                      config.backgroundPattern && (
                        <div className="flex items-center justify-between gap-4 pl-3">
                          <span className="body-03 text-card-foreground-muted">
                            Placement
                          </span>
                          <RightAlignedInlineSelect
                            options={PATTERN_PLACEMENT_OPTIONS}
                            value={config.backgroundPatternPlacement}
                            onValueChange={(value) =>
                              set(
                                "backgroundPatternPlacement",
                                value as BackgroundPatternPlacement,
                              )
                            }
                            aria-label="Background pattern placement"
                          />
                        </div>
                      )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            type="button"
            aria-label="Open configurator"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right" }}
            className="border-card-border bg-card-background text-primary-foreground-muted hover:text-primary-foreground shadow-s focus-visible:outline-focus rounded-sm flex size-10 cursor-pointer items-center justify-center border outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
          >
            <SlidersHorizontalIcon size={18} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
