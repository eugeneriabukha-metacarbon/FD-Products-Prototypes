import * as React from "react";
import { motion } from "motion/react";
import {
  ArrowUpIcon,
  CheckIcon,
  MicrophoneIcon,
  PaperclipIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { useCutCornerClipPath } from "@financedistrict/apps-ui/cut-corner";

import { formatDuration, useVoiceRecorder } from "../hooks/useVoiceRecorder";

/**
 * Composer field — 16px cut corners (a NEW cut size for this prototype; the DS
 * buttons use 8px). Same geometry rules as the DS `BUTTON_CUT`: sharp diagonal
 * chamfers, 2px arcs on the square corners. The border is an SVG stroke tracing
 * the cut outline (the DS secondary-button pattern) since a CSS border would
 * clip square across the chamfer; on focus it takes the input accent color
 * (Figma focused-field state).
 */
const FIELD_CUT = { cut: 16, radius: 2, radiusCuts: 0 } as const;

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Send the current draft (Enter or the send button). */
  onSend: () => void;
  /** Stage demo attachments (paperclip button). */
  onAttach?: () => void;
  autoFocus?: boolean;
}

export function Composer({
  value,
  onChange,
  onSend,
  onAttach,
  autoFocus = false,
}: ComposerProps) {
  const { ref, clipPath, pathD } = useCutCornerClipPath<HTMLDivElement>(
    FIELD_CUT.cut,
    { radius: FIELD_CUT.radius, radiusCuts: FIELD_CUT.radiusCuts },
  );
  // A finished (mock) recording transcribes into the draft so the user sees
  // and can edit what they "said" before sending.
  const recorder = useVoiceRecorder(onChange);
  const busy = recorder.status !== "idle";

  const canSend = value.trim().length > 0;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  const placeholder =
    recorder.status === "recording" ? "Listening…" : "Ask anything";

  return (
    // Named group — the DS Button wrapper uses the unnamed `group` for its
    // focus ring (`group-has-[:focus-visible]`), so an unnamed group here
    // would light up every toolbar button's ring while the textarea is focused.
    <div className="group/composer relative w-full max-w-[600px]">
      <div
        ref={ref}
        style={{ clipPath }}
        className="bg-input-background flex h-32 flex-col"
      >
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          readOnly={busy}
          placeholder={placeholder}
          aria-label="Message the AI Assistant"
          className="body-03 text-input-foreground-accent placeholder:text-input-foreground min-h-0 w-full flex-1 resize-none bg-transparent px-4 pt-3 outline-none"
        />

        {/* toolbar — swaps to the voice recorder controls while recording */}
        <div className="flex h-[56px] shrink-0 items-center justify-between p-3">
          {recorder.status !== "idle" ? (
            <VoiceRecordingBar
              seconds={recorder.seconds}
              levels={recorder.levels}
              transcribing={recorder.status === "transcribing"}
              onCancel={recorder.cancel}
              onStop={recorder.stop}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variation="secondary"
                  size="sm"
                  iconOnly
                  aria-label="Attach a file"
                  onClick={onAttach}
                >
                  <PaperclipIcon aria-hidden="true" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variation="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Record a voice message"
                  onClick={recorder.start}
                >
                  <MicrophoneIcon aria-hidden="true" />
                </Button>
                <Button
                  variation="brand"
                  size="sm"
                  iconOnly
                  aria-label="Send message"
                  disabled={!canSend}
                  onClick={onSend}
                >
                  <ArrowUpIcon aria-hidden="true" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Border stroke following the cut outline (DS secondary-button pattern);
          accent color while the field has focus (Figma focused state). */}
      {pathD && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d={pathD}
            fill="none"
            strokeWidth={1}
            className="stroke-input-border group-focus-within/composer:stroke-input-border-accent transition-colors"
          />
        </svg>
      )}
    </div>
  );
}

interface VoiceRecordingBarProps {
  seconds: number;
  levels: number[];
  /** After confirm: the frozen bar stays, only the confirm button spins. */
  transcribing: boolean;
  onCancel: () => void;
  onStop: () => void;
}

/**
 * Compact recorder that lives IN the composer toolbar row: indicator + mono
 * timer, a live (simulated) waveform, and cancel / confirm controls. Confirm
 * runs transcription — signalled only by a spinner in that button (DS Button
 * `loading`), no extra text. All colors are DS tokens.
 */
function VoiceRecordingBar({
  seconds,
  levels,
  transcribing,
  onCancel,
  onStop,
}: VoiceRecordingBarProps) {
  return (
    <div className="flex h-full w-full items-center gap-3">
      <div className="flex shrink-0 items-center gap-2">
        <motion.span
          className="bg-destructive-primary-foreground size-2 rounded-full"
          // Pulse only while actively recording; hold steady during transcription.
          animate={transcribing ? { opacity: 1 } : { opacity: [1, 0.25, 1] }}
          transition={
            transcribing
              ? { duration: 0 }
              : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          }
          aria-hidden="true"
        />
        <span className="body-mono-03 text-input-foreground-accent tabular-nums">
          {formatDuration(seconds)}
        </span>
      </div>

      {/* live (simulated) waveform — thin 2px bars pinned right so the newest
          amplitude reads as a right-to-left scroll; older bars clip on the left. */}
      <div
        className="flex h-6 flex-1 items-center justify-end gap-[2px] overflow-hidden"
        role="img"
        aria-label="Recording voice message"
      >
        {levels.map((level, index) => (
          <span
            key={index}
            className="bg-input-foreground-accent w-[2px] shrink-0"
            style={{ height: `${Math.max(10, level * 100)}%` }}
          />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variation="ghost"
          size="sm"
          iconOnly
          aria-label="Cancel recording"
          onClick={onCancel}
        >
          <TrashIcon aria-hidden="true" />
        </Button>
        <Button
          variation="brand"
          size="sm"
          iconOnly
          loading={transcribing}
          aria-label="Confirm and transcribe"
          onClick={onStop}
        >
          <CheckIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
