import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

/** Shared muted icon-button styling (password reveal toggles). */
export const ICON_BUTTON_CLASS =
  "text-input-foreground-muted hover:text-input-foreground focus-visible:outline-focus flex cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid";

/**
 * Eye/eye-slash toggle that reveals a password field. Used by the Email row
 * (Current password) and the Password row. Purely presentational — the caller
 * owns the `shown` state and swaps the input `type`.
 */
export function RevealButton({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      className={ICON_BUTTON_CLASS}
    >
      {shown ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
    </button>
  );
}
