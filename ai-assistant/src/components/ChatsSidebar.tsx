import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CaretUpIcon,
  DotsThreeIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  PushPinIcon,
  PushPinSlashIcon,
  SidebarSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";

export interface ChatListItem {
  id: string;
  title: string;
  pinned?: boolean;
}

/** Drag-resize bounds for the bg rail (user requirement: 160–320, default 244). */
const SIDEBAR_MIN_WIDTH = 160;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_DEFAULT_WIDTH = 244;

export interface ChatsSidebarProps {
  chats: ChatListItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onTogglePin: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  /**
   * Configurator preview axis (Figma 583:128915): render the rail as an
   * in-flow floating card — surface, border, rounded, inset from the edges —
   * so the chat content re-centers in the remaining width. Off = the current
   * transparent full-height overlay (content centered on the page).
   */
  showBackground?: boolean;
  /** Surface used when `showBackground` — beige (gray-50) or white. */
  backgroundColor?: "beige" | "white";
}

interface ChatRowProps {
  chat: ChatListItem;
  active: boolean;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

/** Shared menu-item style for the row's more-menu. */
const MENU_ITEM =
  "flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left transition-colors";

/**
 * One chat row: a truncating select button + pin / more-menu actions that fade
 * in on hover (or keyboard focus). The more-menu holds Rename (inline-edits the
 * title) and Delete. Renaming swaps the title for a chrome-less input.
 */
function ChatRow({
  chat,
  active,
  onSelect,
  onTogglePin,
  onRename,
  onDelete,
}: ChatRowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(chat.title);
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

  const startRename = () => {
    setDraft(chat.title);
    setMenuOpen(false);
    setEditing(true);
  };

  const commitRename = () => {
    if (!editing) return;
    const next = draft.trim();
    if (next && next !== chat.title) onRename(chat.id, next);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      // Lift above sibling rows while the menu is open so it isn't clipped.
      className={`group/row flex w-full shrink-0 items-center gap-1 ${
        menuOpen ? "relative z-30" : ""
      }`}
    >
      {editing ? (
        <input
          value={draft}
          autoFocus
          onFocus={(event) => event.target.select()}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitRename();
            } else if (event.key === "Escape") {
              setEditing(false);
            }
          }}
          onBlur={commitRename}
          aria-label="Rename chat"
          className="body-03 text-primary-foreground min-w-0 flex-1 truncate bg-transparent outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => onSelect(chat.id)}
          aria-current={active || undefined}
          className={`${
            active
              ? "body-03-medium text-primary-foreground"
              : "body-03 text-primary-foreground-muted group-hover/row:text-primary-foreground"
          } focus-visible:outline-focus min-w-0 flex-1 cursor-pointer truncate rounded-xs text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid`}
        >
          {chat.title}
        </button>
      )}

      {/* Actions — shown on hover/focus, or kept visible while the menu is open.
          Hidden entirely during inline rename to keep the field clean. */}
      {!editing && (
        <div
          className={`${
            menuOpen ? "flex" : "hidden group-focus-within/row:flex group-hover/row:flex"
          } shrink-0 items-center gap-1`}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.82 }}
            aria-label={chat.pinned ? "Unpin chat" : "Pin chat"}
            aria-pressed={chat.pinned || undefined}
            onClick={() => onTogglePin(chat.id)}
            className="text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus flex cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
          >
            {chat.pinned ? (
              <PushPinSlashIcon size={16} aria-hidden="true" />
            ) : (
              <PushPinIcon size={16} aria-hidden="true" />
            )}
          </motion.button>

          <div ref={menuRef} className="relative flex">
            <motion.button
              type="button"
              whileTap={{ scale: 0.82 }}
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus flex cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
            >
              <DotsThreeIcon size={16} weight="bold" aria-hidden="true" />
            </motion.button>

            {menuOpen && (
              <div
                role="menu"
                className="border-card-border bg-card-background rounded-sm shadow-s absolute top-[calc(100%+4px)] right-0 z-30 w-[140px] border py-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={startRename}
                  className={`${MENU_ITEM} text-card-foreground hover:bg-card-accent`}
                >
                  <PencilSimpleIcon size={16} aria-hidden="true" />
                  <span className="body-03">Rename</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(chat.id);
                  }}
                  className={`${MENU_ITEM} text-destructive-primary-foreground hover:bg-card-accent`}
                >
                  <TrashIcon size={16} aria-hidden="true" />
                  <span className="body-03">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface ChatSectionProps {
  label: string;
  chats: ChatListItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
}

/** A collapsible titled group of chat rows ("pinned" / "recent" accordions). */
function ChatSection({
  label,
  chats,
  activeChatId,
  onSelectChat,
  onTogglePin,
  onRenameChat,
  onDeleteChat,
}: ChatSectionProps) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="focus-visible:outline-focus flex shrink-0 cursor-pointer items-center gap-1 rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
      >
        <span className="caption-02-medium text-primary-foreground-muted uppercase">
          {label}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 0 : 180 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-primary-foreground-muted flex"
        >
          <CaretUpIcon size={12} weight="fill" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pt-3">
              <AnimatePresence initial={false}>
                {chats.map((chat) => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onSelect={onSelectChat}
                    onTogglePin={onTogglePin}
                    onRename={onRenameChat}
                    onDelete={onDeleteChat}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Left rail: new-chat action + pinned / recent chat accordions. */
export function ChatsSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onTogglePin,
  onRenameChat,
  onDeleteChat,
  showBackground = false,
  backgroundColor = "beige",
}: ChatsSidebarProps) {
  const pinned = chats.filter((chat) => chat.pinned);
  const recent = chats.filter((chat) => !chat.pinned);
  const [collapsed, setCollapsed] = React.useState(false);
  // Drag-resizable width for the bg rail (Figma default 244; clamped 160–320).
  const [width, setWidth] = React.useState(SIDEBAR_DEFAULT_WIDTH);

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startWidth = width;
    const handle = event.currentTarget;
    // Route the whole drag to the handle even when the cursor outruns it.
    // Guarded: capture is unavailable for already-released/synthetic pointers.
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      /* drag still works while the cursor stays over the handle */
    }
    const onMove = (e: PointerEvent) => {
      setWidth(
        Math.min(
          SIDEBAR_MAX_WIDTH,
          Math.max(SIDEBAR_MIN_WIDTH, startWidth + (e.clientX - startX)),
        ),
      );
    };
    const onUp = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
  };

  // Width by state: the bg rail is drag-resizable (inline style); the
  // transparent overlay stays 235px; collapsed is a 64px icon rail (w-16 =
  // 32px button + 16px padding either side). Deliberately NO width transition:
  // the DS Button's cut-corner hook measures on mount, and a button mounting
  // while the width is still animating measures a mid-transition size that
  // never gets corrected here — it then renders clipped to nothing.
  const widthClass = collapsed ? "w-16" : showBackground ? "" : "w-[235px]";
  const widthStyle =
    !collapsed && showBackground ? { width: `${width}px` } : undefined;
  const surfaceClass = showBackground
    ? // Floating card rail (Figma 583:129213): surface, border, 6px radius,
      // inset 8px left/bottom, in normal flow so the chat area re-centers.
      // Surface is beige (gray-50) or white.
      `${
        backgroundColor === "white" ? "bg-card-background" : "bg-background"
      } border-card-border rounded-md relative z-10 mb-2 ml-2 shrink-0 self-stretch border`
    : "absolute top-0 left-0 z-10 h-full";

  return (
    <aside
      style={widthStyle}
      className={`${surfaceClass} ${widthClass} flex flex-col items-start gap-4 p-4`}
    >
      {/* Header (Figma 583:129213 expanded / 583:129317 collapsed) — the two
          states are keyed so the buttons fully remount and their cut-corner
          clip paths re-measure at the final, settled layout. */}
      {collapsed ? (
        // Collapsed rail: expand toggle on top, new-chat icon-button below.
        <div key="header-collapsed" className="flex flex-col items-start gap-2">
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            aria-label="Expand sidebar"
            aria-expanded={false}
            onClick={() => setCollapsed(false)}
          >
            <SidebarSimpleIcon className="-scale-x-100" aria-hidden="true" />
          </Button>
          <Button
            variation="secondary"
            size="sm"
            iconOnly
            aria-label="New chat"
            onClick={onNewChat}
          >
            <NotePencilIcon aria-hidden="true" />
          </Button>
        </div>
      ) : (
        // Expanded header: new-chat button + trailing collapse toggle.
        <div
          key="header-expanded"
          className="flex w-full items-center justify-between gap-2"
        >
          <Button
            variation="secondary"
            size="sm"
            leftSlot={<NotePencilIcon aria-hidden="true" />}
            onClick={onNewChat}
            // Let the button shrink at narrow rail widths (drag-resize min is
            // 160px) — the label truncates instead of wrapping out of the
            // fixed-height button.
            wrapperClassName="min-w-0"
            className="min-w-0 max-w-full"
          >
            <span className="truncate">New chat</span>
          </Button>
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            aria-label="Collapse sidebar"
            aria-expanded
            onClick={() => setCollapsed(true)}
            className="shrink-0"
          >
            <SidebarSimpleIcon className="-scale-x-100" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Drag handle — resize the bg rail from its right edge (160–320px). */}
      {showBackground && !collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={handleResizeStart}
          className="hover:bg-brand-primary-background absolute inset-y-0 -right-1 w-2 cursor-col-resize rounded-full transition-colors"
        />
      )}

      {/* Chat list — hidden while collapsed (`hidden` beats an absent `flex`). */}
      <div
        className={`${collapsed ? "hidden" : "flex"} min-h-0 w-full flex-col gap-4 overflow-y-auto`}
      >
        <AnimatePresence initial={false}>
          {pinned.length > 0 && (
            <motion.div
              key="pinned-section"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <ChatSection
                label="pinned"
                chats={pinned}
                activeChatId={activeChatId}
                onSelectChat={onSelectChat}
                onTogglePin={onTogglePin}
                onRenameChat={onRenameChat}
                onDeleteChat={onDeleteChat}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div layout className="w-full">
          <ChatSection
            label="chats"
            chats={recent}
            activeChatId={activeChatId}
            onSelectChat={onSelectChat}
            onTogglePin={onTogglePin}
            onRenameChat={onRenameChat}
            onDeleteChat={onDeleteChat}
          />
        </motion.div>
      </div>
    </aside>
  );
}
