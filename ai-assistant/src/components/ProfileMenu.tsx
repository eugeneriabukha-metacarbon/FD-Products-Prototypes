import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { RocketLaunchIcon, SignOutIcon } from "@phosphor-icons/react";

export interface ProfileMenuProps {
  /** Open the paywall (the plans menu item). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/**
 * Profile avatar button + dropdown menu, shared by the app `Header` and the
 * `LaunchpadHeader`. Owns its own open / outside-click / Escape state.
 */
export function ProfileMenu({
  onUpgrade,
  hasPaidPlan = false,
}: ProfileMenuProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

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
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Profile menu"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="button-01 bg-brand-primary-accent text-brand-primary-foreground rounded-sm focus-visible:outline-focus flex size-8 cursor-pointer items-center justify-center outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
      >
        JJ
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
            className="border-card-border bg-card-background rounded-sm shadow-s absolute top-[calc(100%+8px)] right-0 z-20 w-[220px] border py-2"
          >
            <button
              type="button"
              role="menuitem"
              className="hover:bg-card-accent flex w-full cursor-pointer items-center gap-1 py-2 pr-12 pl-4 text-left"
              onClick={() => {
                setMenuOpen(false);
                onUpgrade();
              }}
            >
              <RocketLaunchIcon
                size={16}
                className="text-card-foreground-muted shrink-0"
                aria-hidden="true"
              />
              <span className="body-03 text-card-foreground whitespace-nowrap">
                {hasPaidPlan ? "View plans" : "Upgrade your plan"}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="hover:bg-card-accent flex w-full cursor-pointer items-center gap-1 py-2 pr-12 pl-4 text-left"
              onClick={() => setMenuOpen(false)}
            >
              <SignOutIcon
                size={16}
                className="text-card-foreground-muted shrink-0"
                aria-hidden="true"
              />
              <span className="body-03 text-card-foreground whitespace-nowrap">
                Sign out
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
