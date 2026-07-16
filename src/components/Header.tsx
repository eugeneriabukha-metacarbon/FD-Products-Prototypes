import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  RocketLaunchIcon,
  SignOutIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";

import logoUrl from "../assets/ai-assistant-logo.svg";

export interface HeaderProps {
  /** Open the paywall (the plans menu item). */
  onUpgrade: () => void;
  /** Paid users see "View plans" instead of "Upgrade your plan". */
  hasPaidPlan?: boolean;
}

/** App header: app-switcher + product logo on the left, profile on the right. */
export function Header({ onUpgrade, hasPaidPlan = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close the profile menu on outside click / Escape.
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
    <header className="z-10 flex w-full shrink-0 items-center justify-between p-4">
      {/* left-side */}
      <div className="flex w-72 items-center gap-4">
        <button
          type="button"
          aria-label="Apps"
          className="text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus cursor-pointer rounded-xs transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
        >
          <SquaresFourIcon size={24} aria-hidden="true" />
        </button>

        <div className="bg-border h-[9px] w-px" aria-hidden="true" />

        <div className="flex items-center gap-[7px]">
          <span className="flex size-6 items-center justify-center">
            <img src={logoUrl} alt="" className="h-[17px] w-[17.75px]" />
          </span>
          <span
            className="font-sans text-lg leading-none font-semibold tracking-[-0.36px] text-black"
            style={{ fontVariationSettings: '"wdth" 105' }}
          >
            AI Assistant
          </span>
        </div>
      </div>

      {/* right-side */}
      <div className="flex w-72 items-center justify-end gap-4">
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
      </div>
    </header>
  );
}
