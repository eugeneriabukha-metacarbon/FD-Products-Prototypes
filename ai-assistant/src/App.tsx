import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  CANNED_REPLIES,
  createSeedChats,
  titleFromMessage,
  uid,
  type Chat,
} from "./data/chats";
import {
  AttachmentsRow,
  createDemoAttachments,
  type Attachment,
} from "./components/Attachments";
import { Header } from "./components/Header";
import { ChatsSidebar } from "./components/ChatsSidebar";
import { ChatView } from "./components/ChatView";
import { Composer } from "./components/Composer";
import { Paywall, type PlanId } from "./components/Paywall";
import { QuickActions } from "./components/QuickActions";
import { Launchpad } from "./components/Launchpad";
import { DistrictPass } from "./components/DistrictPass";

/** Top-level screen. The assistant is the default; the Launchpad is the app
 *  switcher reached from the header, and District Pass is a coming-soon stub. */
type AppView = "assistant" | "launchpad" | "district-pass";

/**
 * AI Assistant prototype — simulated chat experience over the FD design
 * system. Screens from Figma: Empty Chat (484:217191), chat with attachments
 * (488:227528), Paywall (488:227717). All assistant replies are canned.
 */
export default function App() {
  const [chats, setChats] = React.useState<Chat[]>(createSeedChats);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<PlanId>("free");
  const [view, setView] = React.useState<AppView>("assistant");
  const replyCounter = React.useRef(0);
  const replyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    [],
  );

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;

  /** Queue the simulated assistant reply for a chat. */
  const scheduleReply = (chatId: string) => {
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const reply =
        CANNED_REPLIES[replyCounter.current % CANNED_REPLIES.length];
      replyCounter.current += 1;
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { id: uid("msg"), role: "assistant", text: reply },
                ],
              }
            : chat,
        ),
      );
      setTyping(false);
    }, 1100);
  };

  /** Commit the current draft as a user message. */
  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    if (activeChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { id: uid("msg"), role: "user", text },
                ],
              }
            : chat,
        ),
      );
      scheduleReply(activeChat.id);
    } else {
      // First message of a new conversation — create the chat.
      const newChat: Chat = {
        id: uid("chat"),
        title: titleFromMessage(text),
        messages: [{ id: uid("msg"), role: "user", text }],
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      scheduleReply(newChat.id);
    }

    setDraft("");
    setAttachments([]);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setDraft("");
    setTyping(false);
    setAttachments([]);
    if (replyTimer.current) clearTimeout(replyTimer.current);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setDraft("");
    setTyping(false);
    setAttachments([]);
    if (replyTimer.current) clearTimeout(replyTimer.current);
  };

  const handleAttach = () => {
    // Demo: stage the sample file set (only if nothing is staged yet).
    setAttachments((prev) =>
      prev.length > 0 ? prev : createDemoAttachments(),
    );
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleRenameChat = (id: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)),
    );
  };

  const handleTogglePin = (id: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    // Deleting the open chat drops back to the empty state.
    if (activeChatId === id) {
      setActiveChatId(null);
      setDraft("");
      setTyping(false);
      setAttachments([]);
      if (replyTimer.current) clearTimeout(replyTimer.current);
    }
  };

  if (paywallOpen) {
    return (
      <Paywall
        onClose={() => setPaywallOpen(false)}
        currentPlan={currentPlan}
        onChangePlan={setCurrentPlan}
      />
    );
  }

  if (view === "launchpad") {
    return (
      <Launchpad
        onOpenAssistant={() => setView("assistant")}
        onOpenDistrictPass={() => setView("district-pass")}
        onUpgrade={() => setPaywallOpen(true)}
        hasPaidPlan={currentPlan !== "free"}
      />
    );
  }

  if (view === "district-pass") {
    return (
      <DistrictPass
        onOpenLaunchpad={() => setView("launchpad")}
        onUpgrade={() => setPaywallOpen(true)}
        hasPaidPlan={currentPlan !== "free"}
      />
    );
  }

  return (
    <div className="bg-surface isolate flex h-screen flex-col">
      <Header
        onUpgrade={() => setPaywallOpen(true)}
        hasPaidPlan={currentPlan !== "free"}
        onOpenLaunchpad={() => setView("launchpad")}
      />

      <div className="isolate relative flex min-h-0 w-full flex-1 items-start">
        <ChatsSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onTogglePin={handleTogglePin}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />

        {activeChat ? (
          <ChatView
            title={activeChat.title}
            messages={activeChat.messages}
            typing={typing}
            attachments={attachments}
            onRemoveAttachment={handleRemoveAttachment}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            onAttach={handleAttach}
          />
        ) : (
          /* Empty state — greeting, composer, quick actions (Figma 484:217191). */
          <main className="bg-surface flex h-full min-w-px flex-1 flex-col items-center overflow-y-auto pt-16 pb-4">
            <div className="flex w-[906px] max-w-full flex-1 items-start justify-center gap-8">
              <div className="flex h-full min-w-px flex-1 flex-col items-center gap-8 py-32">
                <motion.div
                  className="flex w-full max-w-[600px] flex-col gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h1
                    className="display-02 text-primary-foreground w-full text-center"
                    style={{ fontVariationSettings: '"wdth" 110' }}
                  >
                    Hi, Janno! What can I do for you?
                  </h1>
                </motion.div>

                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div
                      key="attachments"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="flex w-full justify-center overflow-hidden"
                    >
                      <AttachmentsRow
                        attachments={attachments}
                        onRemove={handleRemoveAttachment}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className="flex w-full justify-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
                >
                  <Composer
                    value={draft}
                    onChange={setDraft}
                    onSend={handleSend}
                    onAttach={handleAttach}
                  />
                </motion.div>

                <QuickActions onPick={setDraft} />
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
