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
import logoUrl from "./assets/ai-assistant-logo.svg";
import { Header } from "./components/Header";
import { LaunchpadButton, ProductBrand } from "./components/ProductHeader";
import { ChatsSidebar } from "./components/ChatsSidebar";
import { ChatView } from "./components/ChatView";
import { Composer } from "./components/Composer";
import {
  Configurator,
  DEFAULT_ASSISTANT_CONFIG,
  type AssistantConfig,
} from "./components/Configurator";

// three + postprocessing are heavy — load the pattern only when toggled on.
const PixelBlast = React.lazy(
  () => import("./components/pixel-blast/PixelBlast"),
);
import { Paywall, type PlanId } from "./components/Paywall";
import { QuickActions } from "./components/QuickActions";
import { Launchpad } from "./components/Launchpad";
import { DistrictPass } from "./components/DistrictPass";
import { MemoryDialog } from "./components/MemoryDialog";
import { PreferencesDialog } from "./components/PreferencesDialog";
import type { RiskProfile } from "./components/RiskSlider";

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
  // Memory settings — opened from the sidebar footer as a modal Dialog.
  // `memoryEnabled` is lifted here so the sidebar item can label its state.
  const [memoryDialogOpen, setMemoryDialogOpen] = React.useState(false);
  const [memoryEnabled, setMemoryEnabled] = React.useState(true);
  // Risk appetite (Preferences → Risk profile) — the assistant would tune
  // strategy suggestions to it.
  const [riskProfile, setRiskProfile] = React.useState<RiskProfile>("balanced");
  const [currentPlan, setCurrentPlan] = React.useState<PlanId>("free");
  // Cancelled = still on the paid plan until the billing period ends (the
  // manage view shows the pending-Free card), cleared by picking a plan again.
  const [planCancelled, setPlanCancelled] = React.useState(false);
  // Stakeholder preview axes, driven by the floating Configurator.
  const [assistantConfig, setAssistantConfig] = React.useState<AssistantConfig>(
    DEFAULT_ASSISTANT_CONFIG,
  );
  const patternLayerRef = React.useRef<HTMLDivElement>(null);

  // The PixelBlast canvas sits behind the UI (-z-10), so pointer events never
  // reach it naturally — mirror them onto the canvas so its click ripples and
  // liquid distortion still react through the chat surface.
  const forwardToPattern = (event: React.PointerEvent) => {
    const canvas = patternLayerRef.current?.querySelector("canvas");
    if (!canvas || event.target === canvas) return;
    canvas.dispatchEvent(
      new PointerEvent(event.type, {
        clientX: event.clientX,
        clientY: event.clientY,
      }),
    );
  };
  const [view, setView] = React.useState<AppView>("launchpad");
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
        cancelled={planCancelled}
        onChangePlan={(plan) => {
          setCurrentPlan(plan);
          setPlanCancelled(false);
        }}
        onCancelPlan={() => setPlanCancelled(true)}
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

  // Sidebar-background "sidebar" type: the rail runs full height, hosts the
  // launchpad button + lockup, and the glass header spans only the chat column.
  const appSidebar =
    assistantConfig.sidebarBackground &&
    assistantConfig.sidebarBackgroundType === "sidebar";

  const header = (
    <Header
      onUpgrade={() => setPaywallOpen(true)}
      hasPaidPlan={currentPlan !== "free"}
      onOpenLaunchpad={() => setView("launchpad")}
      showBrand={!appSidebar}
    />
  );

  return (
    <div className="bg-surface isolate relative flex h-screen flex-col">
      {/* Glass header overlays the content row (out of flow) — the row pads
          itself down by the 64px header height, while its absolute pattern
          layer still extends up behind the translucent blur. In the
          app-sidebar layout the header instead lives inside the chat column,
          to the right of the full-height rail. */}
      {!appSidebar && header}

      <div
        className={`isolate relative flex min-h-0 w-full flex-1 items-start ${
          appSidebar ? "" : "pt-16"
        }`}
        onPointerDownCapture={forwardToPattern}
        onPointerMoveCapture={forwardToPattern}
      >
        {/* Background pattern (configurator axis) — behind the sidebar + chat.
            Placement "new-chat" limits it to the empty state (no open chat). */}
        {assistantConfig.backgroundPattern &&
          (assistantConfig.backgroundPatternPlacement === "all" ||
            !activeChat) && (
            <div
              ref={patternLayerRef}
              aria-hidden="true"
              className="absolute inset-0 -z-10"
            >
              <React.Suspense fallback={null}>
                {/* Tuned from the React Bits example (2px #e0e0e0, density .5 —
                  calibrated for dark sites, invisible on our white surface):
                  bigger/darker/denser so the dither reads on white. `liquid`
                  is OFF deliberately — its postprocessing EffectComposer path
                  renders nothing on WebKit/Safari (silently), while the click
                  ripples live in the base shader and work everywhere. */}
                <PixelBlast
                  variant="circle"
                  pixelSize={2}
                  color="#c9c9c9"
                  patternScale={4}
                  patternDensity={1.2}
                  pixelSizeJitter={0.5}
                  enableRipples
                  rippleSpeed={0.4}
                  rippleThickness={0.12}
                  rippleIntensityScale={1.5}
                  speed={0.25}
                  edgeFade={0.1}
                  transparent
                />
              </React.Suspense>
            </div>
          )}

        <ChatsSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onTogglePin={handleTogglePin}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          showBackground={assistantConfig.sidebarBackground}
          backgroundColor={assistantConfig.sidebarBackgroundColor}
          onOpenMemory={() => setMemoryDialogOpen(true)}
          memoryEnabled={memoryEnabled}
          extendedPreferences={assistantConfig.extendedPreferences}
          appSidebar={appSidebar}
          brandSlot={
            <div className="flex w-full items-center gap-4">
              <LaunchpadButton onClick={() => setView("launchpad")} />
              <div className="bg-border h-[9px] w-px" aria-hidden="true" />
              <ProductBrand
                name="AI Assistant"
                icon={
                  <img src={logoUrl} alt="" className="h-[17px] w-[17.75px]" />
                }
                // Mark-only when the rail's CONTENT box (outer width minus
                // p-4 + border) drops under the ~191px the full brand row
                // needs — container queries measure the content box.
                nameClassName="@max-[193px]/sidebar:hidden"
              />
            </div>
          }
          brandSlotCollapsed={
            <LaunchpadButton onClick={() => setView("launchpad")} />
          }
        />

        {/* App-sidebar layout: the chat column is its own positioning context
            so the glass header spans exactly the area right of the rail (at
            any drag width). `contents` keeps the classic layout untouched. */}
        <div
          className={
            appSidebar
              ? "relative flex h-full min-w-0 flex-1 flex-col pt-16"
              : "contents"
          }
        >
          {appSidebar && header}

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
            <main className="flex h-full min-w-px flex-1 flex-col items-center overflow-y-auto pt-16 pb-4">
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

      {/* Stakeholder-only preview panel (bottom-right, collapsible). */}
      <Configurator config={assistantConfig} onChange={setAssistantConfig} />

      {/* Sidebar-footer settings dialog — the extended-preferences axis swaps
          the Memory-only modal for the multi-section Preferences dialog. */}
      {assistantConfig.extendedPreferences ? (
        <PreferencesDialog
          open={memoryDialogOpen}
          onOpenChange={setMemoryDialogOpen}
          memoryEnabled={memoryEnabled}
          onMemoryEnabledChange={setMemoryEnabled}
          riskProfile={riskProfile}
          onRiskProfileChange={setRiskProfile}
        />
      ) : (
        <MemoryDialog
          open={memoryDialogOpen}
          onOpenChange={setMemoryDialogOpen}
          enabled={memoryEnabled}
          onEnabledChange={setMemoryEnabled}
        />
      )}
    </div>
  );
}
