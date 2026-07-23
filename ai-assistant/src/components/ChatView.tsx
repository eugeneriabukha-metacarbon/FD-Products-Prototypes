import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { scrollbarVariants } from "@financedistrict/apps-ui/scrollbar";

import type { ChatMessage } from "../data/chats";
import { AttachmentsRow, type Attachment } from "./Attachments";
import { Composer } from "./Composer";

export interface ChatViewProps {
  title: string;
  messages: ChatMessage[];
  typing: boolean;
  attachments: Attachment[];
  onRemoveAttachment: (id: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onAttach: () => void;
  /** Extra classes on the root `<main>` (e.g. the configurator's canvas pattern). */
  className?: string;
}

/** Active conversation: scrollable transcript + docked composer. */
export function ChatView({
  title,
  messages,
  typing,
  attachments,
  onRemoveAttachment,
  draft,
  onDraftChange,
  onSend,
  onAttach,
  className = "",
}: ChatViewProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows. Scroll the
  // container explicitly (scrollIntoView's smooth animation lands on a stale
  // target when the transcript height changes mid-animation, e.g. the typing
  // indicator swapping for the reply).
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  return (
    // No own background — the app root paints the surface, and the
    // configurator's pattern canvas (behind at -z-10) must show through.
    <main
      className={`flex h-full min-w-px flex-1 flex-col items-center overflow-hidden py-4 ${className}`}
    >
      <div className="flex min-h-0 w-[906px] max-w-full flex-1 flex-col items-center">
        {/* transcript */}
        <div
          ref={scrollerRef}
          className={`flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto ${scrollbarVariants()}`}
        >
          <div className="flex w-full max-w-[672px] flex-col gap-8 px-4 pb-8">
            <h1 className="display-03 text-primary-foreground w-full max-w-[600px] self-center">
              {title}
            </h1>

            {messages.map((message) =>
              message.role === "user" ? (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex w-full flex-col items-end"
                >
                  <div className="bg-card-primary-background border-card-primary-border rounded-md max-w-[400px] border px-3 py-2">
                    <p className="body-03 text-card-primary-foreground">
                      {message.text}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-primary-foreground w-full max-w-[600px] self-center"
                >
                  {message.rich ?? (
                    <p className="body-03 whitespace-pre-line">{message.text}</p>
                  )}
                </motion.div>
              ),
            )}

            <AnimatePresence>
              {typing && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex w-full max-w-[600px] items-center gap-1 self-center"
                  role="status"
                  aria-label="Assistant is typing"
                >
                  <motion.span
                    className="bg-primary-foreground-muted size-1.5 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="bg-primary-foreground-muted size-1.5 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                  />
                  <motion.span
                    className="bg-primary-foreground-muted size-1.5 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* input block */}
        <div className="flex w-full shrink-0 flex-col items-center gap-3 px-4 pt-3">
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
                  onRemove={onRemoveAttachment}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex w-full flex-col items-center gap-2">
            <Composer
              value={draft}
              onChange={onDraftChange}
              onSend={onSend}
              onAttach={onAttach}
              autoFocus
            />
            <p className="body-04 text-secondary-foreground-muted w-full truncate text-center">
              AI Agent can make mistakes. Please verify all trade details before
              executing.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
