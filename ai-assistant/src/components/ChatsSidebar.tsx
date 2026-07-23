import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BrainIcon,
  CaretDownIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  PushPinIcon,
  PushPinSlashIcon,
  SidebarSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { SearchBar } from "@financedistrict/apps-ui/search-bar";

export interface ChatListItem {
  id: string;
  title: string;
  pinned?: boolean;
  /** Chat messages — searched by the sidebar (only plain-`text` entries). */
  messages?: { text?: string }[];
}

/** Drag-resize bounds for the bg rail (user requirement: 180–320, default 244). */
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_DEFAULT_WIDTH = 244;

/**
 * Render `text` with every case-insensitive occurrence of `query` wrapped in a
 * brand-tinted `<mark>` (browser default mark styling overridden).
 */
function HighlightText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i <= text.length) {
    const idx = lower.indexOf(ql, i);
    if (idx === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark
        key={idx}
        className="bg-brand-primary-background rounded-[2px] text-inherit"
      >
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    i = idx + q.length;
  }
  return <>{parts}</>;
}

/** A one-line message excerpt centered on the first `query` match. */
function makeSnippet(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  const start = Math.max(0, idx - 24);
  const end = Math.min(text.length, idx + query.length + 48);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${
    end < text.length ? "…" : ""
  }`;
}

/**
 * A search-result row — select-only (no pin/rename/delete). The matched text is
 * the primary line in full foreground with the query highlighted: the chat
 * title for title matches, or the message quote for content matches — the
 * latter with a 12px chat name underneath to say where the quote is from.
 */
function SearchResultRow({
  chat,
  snippet,
  query,
  active,
  onSelect,
}: {
  chat: ChatListItem;
  snippet?: string;
  query: string;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(chat.id)}
      aria-current={active || undefined}
      className="focus-visible:outline-focus w-full min-w-0 cursor-pointer rounded-xs text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
    >
      <span
        className={`${
          active ? "body-03-medium" : "body-03"
        } text-primary-foreground block w-full truncate`}
      >
        <HighlightText text={snippet ?? chat.title} query={query} />
      </span>
      {snippet && (
        <span className="body-04 text-primary-foreground-muted block w-full truncate">
          {chat.title}
        </span>
      )}
    </button>
  );
}

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
  /** Open the Memory settings dialog (sidebar-footer entry point). */
  onOpenMemory?: () => void;
  /** Memory on/off — reflected in the footer item label ("Memory (on/off)"). */
  memoryEnabled?: boolean;
}

interface ChatRowProps {
  chat: ChatListItem;
  active: boolean;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  /**
   * Enable framer `layout` animation (pin/unpin reorder). Off while the rail
   * is being drag-resized — otherwise every width change springs behind the
   * cursor instead of tracking it.
   */
  animateLayout?: boolean;
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
  animateLayout = true,
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
      layout={animateLayout}
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
            menuOpen
              ? "flex"
              : "hidden group-focus-within/row:flex group-hover/row:flex"
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
  /** Forwarded to the rows — off while the rail is being drag-resized. */
  animateLayout?: boolean;
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
  animateLayout = true,
}: ChatSectionProps) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className="flex w-full flex-col">
      {/* Accordion title (Figma 566:40627): leading 12px caret (right when
          collapsed, down when expanded) + uppercase caption; muted at rest,
          full foreground on hover/focus, focus ring on the row. */}
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="group/acc focus-visible:outline-focus flex shrink-0 cursor-pointer items-center gap-1 rounded-[3px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-solid"
      >
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-primary-foreground-muted group-hover/acc:text-primary-foreground group-focus-visible/acc:text-primary-foreground flex transition-colors"
        >
          <CaretDownIcon size={12} weight="fill" aria-hidden="true" />
        </motion.span>
        <span className="caption-02-medium text-primary-foreground-muted group-hover/acc:text-primary-foreground group-focus-visible/acc:text-primary-foreground uppercase transition-colors">
          {label}
        </span>
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
                    animateLayout={animateLayout}
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
  onOpenMemory,
  memoryEnabled = true,
}: ChatsSidebarProps) {
  const memoryStateLabel = `Memory (${memoryEnabled ? "on" : "off"})`;
  const pinned = chats.filter((chat) => chat.pinned);
  const recent = chats.filter((chat) => !chat.pinned);
  const [collapsed, setCollapsed] = React.useState(false);
  // Sidebar search (debounced via the DS SearchBar). Non-empty query swaps the
  // pinned/chats sections for a flat highlighted results list.
  const [query, setQuery] = React.useState("");
  const asideRef = React.useRef<HTMLElement>(null);
  // Set by the collapsed rail's search button: after expanding, focus the
  // freshly-mounted search field so the user can type immediately.
  const focusSearchOnExpand = React.useRef(false);
  React.useEffect(() => {
    if (collapsed || !focusSearchOnExpand.current) return;
    focusSearchOnExpand.current = false;
    asideRef.current
      ?.querySelector<HTMLInputElement>('input[aria-label="Search chats"]')
      ?.focus();
  }, [collapsed]);
  const q = query.trim();
  const searching = q.length > 0;
  const results = searching
    ? chats
        .flatMap((chat) => {
          // Message-content match wins so every result reads the same way —
          // quote + source chat name; a plain title row only remains for
          // chats matched solely by their title.
          const message = chat.messages?.find((m) =>
            m.text?.toLowerCase().includes(q.toLowerCase()),
          );
          if (message?.text)
            return [{ chat, snippet: makeSnippet(message.text, q) }];
          if (chat.title.toLowerCase().includes(q.toLowerCase()))
            return [{ chat, snippet: undefined as string | undefined }];
          return [];
        })
        .sort((a, b) => (b.chat.pinned ? 1 : 0) - (a.chat.pinned ? 1 : 0))
    : [];
  // Drag-resizable width for the bg rail (Figma default 244; clamped 200–320).
  const [width, setWidth] = React.useState(SIDEBAR_DEFAULT_WIDTH);
  // While true, the rows' framer `layout` animations are OFF so the list
  // tracks the cursor 1:1 instead of spring-lagging behind the drag.
  const [resizing, setResizing] = React.useState(false);

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
    setResizing(true);
    const onMove = (e: PointerEvent) => {
      setWidth(
        Math.min(
          SIDEBAR_MAX_WIDTH,
          Math.max(SIDEBAR_MIN_WIDTH, startWidth + (e.clientX - startX)),
        ),
      );
    };
    const onUp = () => {
      setResizing(false);
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
      ref={asideRef}
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
          <Button
            variation="secondary"
            size="sm"
            iconOnly
            aria-label="Search chats"
            onClick={() => {
              // Expand and drop the caret into the search field.
              focusSearchOnExpand.current = true;
              setCollapsed(false);
            }}
          >
            <MagnifyingGlassIcon aria-hidden="true" />
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
            onClick={() => {
              setCollapsed(true);
              // The search field unmounts with the expanded header — reset the
              // query so re-expanding shows the normal sections again.
              setQuery("");
            }}
            className="shrink-0"
          >
            <SidebarSimpleIcon className="-scale-x-100" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Sidebar search — filters titles + message content as you type. On the
          beige rail the field's gray-50 fill would melt into the surface, so it
          swaps to a white fill there. */}
      {!collapsed && (
        <SearchBar
          placeholder="Search..."
          aria-label="Search chats"
          onSearch={setQuery}
          wrapperClassName="w-full"
          fieldClassName={
            showBackground && backgroundColor === "beige"
              ? "bg-card-background"
              : undefined
          }
        />
      )}

      {/* Drag handle — resize the bg rail from its right edge (180–320px).
          The grab strip spans the FULL height (hover anywhere on the edge to
          resize); the visible hover indicator is a short 64px centered 4px bar. */}
      {showBackground && !collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={handleResizeStart}
          className="group/resize absolute inset-y-0 -right-1 flex w-2 cursor-col-resize items-center justify-center"
        >
          <div
            aria-hidden="true"
            className="group-hover/resize:bg-brand-primary-background h-16 w-1 rounded-full transition-colors"
          />
        </div>
      )}

      {/* Chat list — hidden while collapsed (`hidden` beats an absent `flex`).
          `flex-1` so it fills the space and pins the Memory footer to the bottom. */}
      <div
        className={`${collapsed ? "hidden" : "flex"} min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto`}
      >
        {searching ? (
          // Search results — flat list (pinned matches first), query highlighted.
          <div className="flex w-full flex-col">
            <span className="caption-02-medium text-primary-foreground-muted uppercase">
              results
            </span>
            {results.length === 0 ? (
              <p className="body-03 text-primary-foreground-muted pt-3">
                No chats found.
              </p>
            ) : (
              <div className="flex flex-col gap-3 pt-3">
                {results.map(({ chat, snippet }) => (
                  <SearchResultRow
                    key={chat.id}
                    chat={chat}
                    snippet={snippet}
                    query={q}
                    active={chat.id === activeChatId}
                    onSelect={onSelectChat}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {pinned.length > 0 && (
                <motion.div
                  key="pinned-section"
                  layout={!resizing}
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
                    animateLayout={!resizing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div layout={!resizing} className="w-full">
              <ChatSection
                label="chats"
                chats={recent}
                activeChatId={activeChatId}
                onSelectChat={onSelectChat}
                onTogglePin={onTogglePin}
                onRenameChat={onRenameChat}
                onDeleteChat={onDeleteChat}
                animateLayout={!resizing}
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Memory — pinned to the very bottom (`mt-auto`); full row when expanded,
          icon-only in the collapsed rail. Opens the Memory settings dialog. */}
      {onOpenMemory &&
        (collapsed ? (
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            aria-label={memoryStateLabel}
            onClick={onOpenMemory}
            className="mt-auto"
          >
            <BrainIcon aria-hidden="true" />
          </Button>
        ) : (
          <button
            type="button"
            onClick={onOpenMemory}
            // Divider above only on the bg rail; the transparent overlay drops it.
            className={`group/mem text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus mt-auto flex w-full shrink-0 cursor-pointer items-center gap-2 rounded-xs pt-4 text-left outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid ${
              showBackground ? "border-card-border border-t" : ""
            }`}
          >
            <BrainIcon size={16} aria-hidden="true" className="shrink-0" />
            <span className="body-03">{memoryStateLabel}</span>
          </button>
        ))}
    </aside>
  );
}
