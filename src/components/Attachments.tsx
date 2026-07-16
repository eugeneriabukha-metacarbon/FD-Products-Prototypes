import { AnimatePresence, motion } from "motion/react";
import { FileIcon, XIcon } from "@phosphor-icons/react";

import { uid } from "../data/chats";
import photoUrl from "../assets/attachment-photo.jpg";

export interface Attachment {
  id: string;
  name: string;
  kind: "image" | "pdf" | "doc";
  /** Object/asset URL for image attachments. */
  url?: string;
}

/** The demo set staged when the paperclip is clicked (mirrors the Figma screen). */
export function createDemoAttachments(): Attachment[] {
  return [
    { id: uid("att"), kind: "image", name: "wallet-overview.jpg", url: photoUrl },
    { id: uid("att"), kind: "pdf", name: "Wallet_Addresses.pdf" },
    { id: uid("att"), kind: "doc", name: "Wallet_Addresses.doc" },
  ];
}

/** Circular remove control that fades in on hover/focus of its attachment. */
function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="bg-primary-foreground text-surface shadow-s focus-visible:outline-focus absolute top-1 right-1 flex size-[18px] cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity outline-none group-focus-within/att:opacity-100 group-hover/att:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
    >
      <XIcon size={11} weight="bold" aria-hidden="true" />
    </motion.button>
  );
}

const ITEM_MOTION = {
  layout: true,
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

export interface AttachmentsRowProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

/**
 * Staged-attachments row above the composer (Figma "Attachments" screen):
 * image thumb + file cards, horizontally scrollable with a right-edge fader.
 * Hovering (or focusing) any item reveals a corner X to remove just that one.
 */
export function AttachmentsRow({ attachments, onRemove }: AttachmentsRowProps) {
  return (
    <div className="relative w-full max-w-[600px]">
      <div className="flex items-center gap-2 overflow-x-auto pr-[52px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {attachments.map((attachment) =>
            attachment.kind === "image" ? (
              <motion.div
                key={attachment.id}
                {...ITEM_MOTION}
                className="group/att relative shrink-0"
              >
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="rounded-sm size-[52px] object-cover"
                />
                <RemoveButton
                  label={`Remove ${attachment.name}`}
                  onClick={() => onRemove(attachment.id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={attachment.id}
                {...ITEM_MOTION}
                className="group/att relative shrink-0"
              >
                {/* Inline file card (the DS FeatureCard is fixed at 64px / 16px
                    type) — matches the Figma attachment chip: 12px vertical
                    padding, 14px black title, 12px muted subtitle. */}
                <div className="bg-card-background border-card-border rounded-sm flex h-[52px] w-[280px] items-center gap-3 border px-3 py-3">
                  <FileIcon
                    size={20}
                    weight="fill"
                    className={`shrink-0 ${
                      attachment.kind === "pdf"
                        ? "text-destructive-primary-foreground"
                        : "text-info-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {/* leading-4 / leading-3 (16 + 12 = 28px) keep both lines inside
                      the 52px card once the 12px vertical padding is subtracted. */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="body-03-medium text-card-foreground truncate leading-4">
                      {attachment.name}
                    </p>
                    <p className="body-04 text-card-foreground-muted truncate leading-3">
                      {attachment.kind.toUpperCase()}
                    </p>
                  </div>
                </div>
                <RemoveButton
                  label={`Remove ${attachment.name}`}
                  onClick={() => onRemove(attachment.id)}
                />
              </motion.div>
            ),
          )}
        </AnimatePresence>
      </div>

      {/* right-edge fader hint that the row scrolls */}
      <div
        aria-hidden="true"
        className="from-fader-02 to-fader-01 pointer-events-none absolute top-0 right-0 bottom-0 w-[52px] bg-gradient-to-r"
      />
    </div>
  );
}
