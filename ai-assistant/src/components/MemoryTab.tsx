import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrainIcon, XIcon } from "@phosphor-icons/react";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { Switch } from "@financedistrict/apps-ui/switch";
import { MEMORIES, type Memory } from "../data/memories";
import { EmptyState } from "./EmptyState";

/** Muted icon-button styling for the per-row remove affordance. */
const REMOVE_BUTTON_CLASS =
  "text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus flex shrink-0 cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid";

/**
 * A single memory row: memory text · source chat · saved date, plus a trailing
 * X that forgets the memory (removal only — memories aren't editable).
 */
function MemoryRow({
  memory,
  onDelete,
}: {
  memory: Memory;
  onDelete: (memory: Memory) => void;
}) {
  return (
    <motion.li
      layout
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="border-card-border border-b last:border-b-0"
    >
      <FeatureCard
        caret={false}
        // Flush to the list edges — drop the DS FeatureCard's horizontal padding.
        className="px-0"
        // Memory rows read one type step smaller than the FeatureCard defaults
        // (title 16→14, subtitle 14→12) — overridden via inner spans.
        title={<span className="body-03-medium">{memory.text}</span>}
        subtitle={<span className="body-04">{`From "${memory.source}"`}</span>}
        trailing={
          <div className="flex items-center gap-2">
            <span className="body-03 whitespace-nowrap">{memory.savedOn}</span>
            <button
              type="button"
              aria-label={`Delete memory: ${memory.text}`}
              onClick={() => onDelete(memory)}
              className={REMOVE_BUTTON_CLASS}
            >
              {/* `size-4!` overrides FeatureCard's trailing `[&_svg]:size-6`. */}
              <XIcon className="size-4!" />
            </button>
          </div>
        }
      />
    </motion.li>
  );
}

/**
 * Memory tab — ChatGPT-style assistant memories. An optional master Memory
 * switch on top (full-screen only; the dialog owns its own switch), then the
 * saved memories as rows (memory text · source chat · saved date · trailing X
 * to forget). Memories are removal-only — no editing. Turning Memory off hides
 * the list (saved memories are kept and come back when re-enabled). All actions
 * are simulated and confirmed via `onToast`.
 */
export function MemoryTab({
  onToast,
  enabled: enabledProp,
  showMasterSwitch = true,
}: {
  onToast: (message: string) => void;
  /**
   * Controlled on/off. When provided the master-switch card is expected to be
   * hidden (`showMasterSwitch={false}`) and the switch lives outside (e.g. the
   * dialog header owns it). Uncontrolled otherwise.
   */
  enabled?: boolean;
  /** Render the master-switch FeatureCard (full-screen); off in the dialog. */
  showMasterSwitch?: boolean;
}) {
  const [enabledState, setEnabledState] = React.useState(true);
  const enabled = enabledProp ?? enabledState;
  const [memories, setMemories] = React.useState<Memory[]>(MEMORIES);

  const toggle = (next: boolean) => {
    setEnabledState(next);
    onToast(next ? "Memory turned on." : "Memory turned off.");
  };

  const forget = (memory: Memory) => {
    setMemories((prev) => prev.filter((m) => m.id !== memory.id));
    onToast("Memory deleted.");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* master switch — hidden in the dialog, where the header owns the switch */}
      {showMasterSwitch && (
        <FeatureCard
          caret={false}
          className="border-card-border rounded-md border"
          leading={<BrainIcon />}
          title="Memory"
          subtitle={
            // The DS FeatureCard truncates its subtitle to one line; re-enable
            // wrapping so the full explainer stays readable (two lines max).
            <span className="line-clamp-2 whitespace-normal">
              Memories are created as you chat to personalize replies.
            </span>
          }
          trailing={
            <Switch
              checked={enabled}
              onCheckedChange={toggle}
              aria-label="Memory"
            />
          }
        />
      )}

      {!enabled ? (
        <EmptyState
          icon={<BrainIcon />}
          title="Memory is off"
          description="Turn it on to let the assistant remember details from your chats. Saved memories are kept."
        />
      ) : memories.length === 0 ? (
        <p className="body-03 text-primary-foreground-muted">
          No memories yet — the assistant saves helpful details as you chat.
        </p>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {memories.map((memory) => (
              <MemoryRow key={memory.id} memory={memory} onDelete={forget} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
