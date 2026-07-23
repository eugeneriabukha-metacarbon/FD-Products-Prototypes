import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BrainIcon,
  DotsThreeIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Dialog } from "@financedistrict/apps-ui/dialog";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { Switch } from "@financedistrict/apps-ui/switch";
import { MEMORIES, type Memory } from "./mockData";

/** Muted icon-button styling for the per-row more affordance. */
const MORE_BUTTON_CLASS =
  "text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus flex shrink-0 cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid";

/** Dropdown menu-item base (the chat-row more-menu idiom). */
const MENU_ITEM =
  "flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left transition-colors";

/**
 * Multiline sibling of the DS `Input` (which is a single-line `<input>`):
 * the same uppercase label + `field`/`lg` box classes (bg/border/radius/
 * padding, accent border on focus), wrapping a fixed-height `<textarea>` so a
 * whole memory sentence stays visible while editing.
 */
function MemoryTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="caption-03-medium text-input-foreground uppercase"
      >
        {label}
      </label>
      <div className="bg-input-background border-input-border focus-within:border-input-border-accent rounded-sm flex w-full cursor-text border px-3 py-2 transition-colors">
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="body-03 text-input-foreground-accent caret-input-foreground-accent placeholder:text-input-foreground-muted w-full min-w-0 resize-none bg-transparent outline-none"
        />
      </div>
    </div>
  );
}

/**
 * A single memory row: memory text · source chat · saved date, plus a more
 * (DotsThree) menu with Edit / Delete — the chat-row dropdown idiom
 * (outside-click/Escape close, row raised above siblings while open).
 */
function MemoryRow({
  memory,
  onEdit,
  onDelete,
}: {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close the more-menu on outside click / Escape.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <motion.li
      layout
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`border-card-border border-b last:border-b-0 ${
        // Keep the open dropdown above the following rows.
        menuOpen ? "relative z-30" : ""
      }`}
    >
      <FeatureCard
        caret={false}
        // Memory rows read one type step smaller than the FeatureCard defaults
        // (title 16→14, subtitle 14→12) — overridden via inner spans.
        title={<span className="body-03-medium">{memory.text}</span>}
        subtitle={<span className="body-04">{`From "${memory.source}"`}</span>}
        trailing={
          <div className="flex items-center gap-2">
            <span className="body-03 whitespace-nowrap">{memory.savedOn}</span>
            <div ref={menuRef} className="relative flex">
              <button
                type="button"
                aria-label={`Memory options: ${memory.text}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className={MORE_BUTTON_CLASS}
              >
                {/* `size-4!` overrides FeatureCard's trailing `[&_svg]:size-6`. */}
                <DotsThreeIcon weight="bold" className="size-4!" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="border-card-border bg-card-background rounded-sm shadow-s absolute top-[calc(100%+4px)] right-0 z-30 w-[140px] border py-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(memory);
                    }}
                    className={`${MENU_ITEM} text-card-foreground hover:bg-card-accent`}
                  >
                    <PencilSimpleIcon className="size-4!" aria-hidden="true" />
                    <span className="body-03">Edit</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(memory);
                    }}
                    className={`${MENU_ITEM} text-destructive-primary-foreground hover:bg-card-accent`}
                  >
                    <TrashIcon className="size-4!" aria-hidden="true" />
                    <span className="body-03">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />
    </motion.li>
  );
}

/**
 * Memory tab — ChatGPT-style assistant memories. A master Memory switch on
 * top; below it the saved memories as rows (memory text · source chat ·
 * saved date · trailing more-menu with Edit / Delete), and a "Clear all
 * memories" danger row behind a confirmation Dialog. Edit opens a Dialog
 * prefilled with the memory text. Turning Memory off hides the list (saved
 * memories are kept and come back when re-enabled). All actions are simulated
 * and confirmed via `onToast`.
 */
export function MemoryTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [enabled, setEnabled] = React.useState(true);
  const [memories, setMemories] = React.useState<Memory[]>(MEMORIES);
  const [clearOpen, setClearOpen] = React.useState(false);
  // The memory being edited in the dialog (null = closed) + its draft text.
  const [editing, setEditing] = React.useState<Memory | null>(null);
  const [draft, setDraft] = React.useState("");

  const toggle = (next: boolean) => {
    setEnabled(next);
    onToast(next ? "Memory turned on." : "Memory turned off.");
  };

  const forget = (memory: Memory) => {
    setMemories((prev) => prev.filter((m) => m.id !== memory.id));
    onToast("Memory deleted.");
  };

  const startEdit = (memory: Memory) => {
    setDraft(memory.text);
    setEditing(memory);
  };

  const saveEdit = () => {
    if (!editing) return;
    const next = draft.trim();
    if (next && next !== editing.text) {
      setMemories((prev) =>
        prev.map((m) => (m.id === editing.id ? { ...m, text: next } : m)),
      );
      onToast("Memory updated.");
    }
    setEditing(null);
  };

  const clearAll = () => {
    setMemories([]);
    setClearOpen(false);
    onToast("All memories cleared.");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* master switch */}
      <FeatureCard
        caret={false}
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

      {!enabled ? (
        <p className="body-03 text-primary-foreground-muted">
          Memory is off — the assistant won't save or use memories. Your saved
          memories are kept and come back when you turn Memory on.
        </p>
      ) : memories.length === 0 ? (
        <p className="body-03 text-primary-foreground-muted">
          No memories yet — the assistant saves helpful details as you chat.
        </p>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {memories.map((memory) => (
              <MemoryRow
                key={memory.id}
                memory={memory}
                onEdit={startEdit}
                onDelete={forget}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* edit memory — Dialog prefilled with the memory text */}
      <Dialog.Root
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <Dialog.Content>
          <Dialog.Header
            icon={<NotePencilIcon weight="fill" />}
            title="Edit memory"
            showClose
          />
          <Dialog.Body>
            <MemoryTextarea label="Memory" value={draft} onChange={setDraft} />
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variation="secondary" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variation="primary"
              type="button"
              disabled={!draft.trim()}
              onClick={saveEdit}
            >
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

      {/* clear all — danger-zone layout, hidden while Memory is off */}
      {enabled && (
        <Dialog.Root open={clearOpen} onOpenChange={setClearOpen}>
          <div className="flex items-center justify-between gap-4">
            <p className="body-03 text-primary-foreground-muted">
              Clearing memories is permanent and cannot be undone.
            </p>
            <Dialog.Trigger asChild>
              <Button
                variation="destructive"
                size="sm"
                type="button"
                className="shrink-0 whitespace-nowrap"
                disabled={memories.length === 0}
              >
                Clear all memories
              </Button>
            </Dialog.Trigger>
          </div>
          <Dialog.Content>
            <Dialog.Header
              icon={<WarningIcon weight="fill" />}
              title="Clear all memories?"
              description="The assistant will forget everything it has learned from your chats. This cannot be undone."
              showClose
            />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variation="secondary" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button variation="destructive" type="button" onClick={clearAll}>
                Clear all memories
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </div>
  );
}
