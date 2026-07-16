import * as React from "react";

export type RecorderStatus = "idle" | "recording" | "transcribing";

/** Number of amplitude bars in the rolling waveform window. High enough that
 *  thin 2px bars (with 2px gaps) fill the composer-width waveform track. */
const BAR_COUNT = 120;

/** Mock speech-to-text results, rotated per recording so the demo varies. */
const MOCK_TRANSCRIPTS = [
  "What are the best staking opportunities for my USDC right now?",
  "Summarize my portfolio performance over the last month.",
  "Walk me through swapping ETH for USDC with the lowest fees.",
];

/**
 * Fully mocked voice capture — no microphone access is requested. Recording
 * shows a simulated waveform + timer; stopping runs a brief "transcribing"
 * step, then hands back mock transcribed text (the caller drops it into the
 * composer so the user sees what they "said").
 */
export function useVoiceRecorder(onTranscript: (text: string) => void) {
  const [status, setStatus] = React.useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = React.useState(0);
  const [levels, setLevels] = React.useState<number[]>(() =>
    Array(BAR_COUNT).fill(0),
  );

  const onTranscriptRef = React.useRef(onTranscript);
  React.useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const transcribeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptIndex = React.useRef(0);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveRef.current) clearInterval(waveRef.current);
    if (transcribeRef.current) clearTimeout(transcribeRef.current);
    timerRef.current = null;
    waveRef.current = null;
    transcribeRef.current = null;
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  const start = React.useCallback(() => {
    clearTimers();
    setStatus("recording");
    setSeconds(0);
    setLevels(Array(BAR_COUNT).fill(0));
    timerRef.current = setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    );
    // Simulated amplitude: a drifting base with jitter so it reads like speech.
    waveRef.current = setInterval(() => {
      setLevels((prev) => {
        const next = prev.slice(1);
        next.push(0.2 + Math.random() * 0.8);
        return next;
      });
    }, 80);
  }, [clearTimers]);

  const stop = React.useCallback(() => {
    clearTimers();
    setStatus("transcribing");
    // Keep the captured waveform frozen (not cleared) while transcribing.
    // Brief pause to sell the speech-to-text step, then emit mock text.
    transcribeRef.current = setTimeout(() => {
      const text = MOCK_TRANSCRIPTS[transcriptIndex.current % MOCK_TRANSCRIPTS.length];
      transcriptIndex.current += 1;
      setStatus("idle");
      setSeconds(0);
      onTranscriptRef.current(text);
    }, 1100);
  }, [clearTimers]);

  const cancel = React.useCallback(() => {
    clearTimers();
    setStatus("idle");
    setSeconds(0);
    setLevels(Array(BAR_COUNT).fill(0));
  }, [clearTimers]);

  return { status, seconds, levels, start, stop, cancel };
}

/** Format elapsed seconds as `m:ss`. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
