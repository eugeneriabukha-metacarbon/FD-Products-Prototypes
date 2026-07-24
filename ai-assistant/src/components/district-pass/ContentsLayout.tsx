import * as React from "react";
import { motion } from "motion/react";

import { type DistrictPassSection } from "./SidebarLayout";

/** A section's top must be within this distance of the scrollport top (px)
 *  to count as the current one. */
const SPY_THRESHOLD = 120;

/** TOC row height (h-8) and the accent segment centered within it (px). */
const TOC_ROW_HEIGHT = 32;
const TOC_INDICATOR_HEIGHT = 16;

/**
 * Contents navigation variant (configurator axis): the right side is a
 * one-pager — every section stacked with its title, separated by dividers —
 * and the left column is a sticky table of contents (same `SidebarNavItem`
 * rows as the sidebar variant). Scrolling the page highlights the section
 * currently under the scrollport top (scroll-spy against the `<main>` scroll
 * container); clicking an item smooth-scrolls its section into place. When
 * scrolled to the very bottom the last section wins, so short tail sections
 * can still activate.
 */
export function ContentsLayout({
  sections,
}: {
  sections: DistrictPassSection[];
}) {
  const [active, setActive] = React.useState(sections[0]?.value);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef(new Map<string, HTMLElement>());
  const idBase = React.useId();

  React.useEffect(() => {
    const scroller = rootRef.current?.closest("main");
    if (!scroller) return;

    const update = () => {
      const scrollerTop = scroller.getBoundingClientRect().top;
      let current = sections[0]?.value;
      for (const section of sections) {
        const el = sectionRefs.current.get(section.value);
        if (!el) continue;
        if (el.getBoundingClientRect().top - scrollerTop <= SPY_THRESHOLD) {
          current = section.value;
        }
      }
      // Bottom latch — the tail section may be too short to reach the
      // threshold, but at full scroll it is unambiguously the current one.
      if (
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 2
      ) {
        current = sections.at(-1)?.value ?? current;
      }
      setActive(current);
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  const jumpTo = (value: string) => {
    sectionRefs.current
      .get(value)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={rootRef} className="flex items-start gap-8">
      {/* Sticky TOC — pins below the scrollport top while the page scrolls.
          Sticky offsets resolve against the scrollport's padding edge, so
          `<main>`'s 64px top padding is part of the pinned gap — the -20px
          nets a 44px visible gap below the header.

          Visual: docs-style contents rail (deliberately different from the
          sidebar variant's filled rows) — a hairline along the left with a
          spring-animated accent segment marking the active section, mono
          two-digit numbers (the FD metadata language), plain text labels. */}
      <nav
        aria-label="On this page"
        className="border-card-border sticky top-[-20px] flex w-[202px] shrink-0 flex-col border-l"
      >
        <motion.span
          aria-hidden="true"
          className="absolute -left-px w-0.5 rounded-full bg-[#6b1cbb]"
          initial={false}
          animate={{
            top:
              Math.max(
                0,
                sections.findIndex((section) => section.value === active),
              ) *
                TOC_ROW_HEIGHT +
              (TOC_ROW_HEIGHT - TOC_INDICATOR_HEIGHT) / 2,
            height: TOC_INDICATOR_HEIGHT,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
        {sections.map((section) => {
          const isActive = section.value === active;
          return (
            <button
              key={section.value}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => jumpTo(section.value)}
              className="group/toc focus-visible:outline-focus flex h-8 cursor-pointer items-center rounded-xs pl-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
            >
              <span
                className={`transition-colors ${
                  isActive
                    ? "body-03-medium text-primary-foreground"
                    : "body-03 text-primary-foreground-muted group-hover/toc:text-primary-foreground"
                }`}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* One-pager: every section with its title, dividers between. */}
      <div className="divide-card-border flex min-w-0 flex-1 flex-col divide-y">
        {sections.map((section) => (
          <section
            key={section.value}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.value, el);
              else sectionRefs.current.delete(section.value);
            }}
            aria-labelledby={`${idBase}-${section.value}`}
            // The last section gets a near-viewport min-height: without the
            // extra scroll runway, short tail sections (Security) could never
            // reach the spy line and were skipped straight to the bottom latch.
            // scroll-mt-22 (88px) = the 64px glass-header overlay + 24px gap,
            // so TOC jumps land below the frosted bar instead of behind it.
            className="flex scroll-mt-22 flex-col gap-6 py-10 first:pt-0 last:min-h-[calc(100vh-240px)] last:pb-0"
          >
            <h2
              id={`${idBase}-${section.value}`}
              className="display-04 text-primary-foreground"
            >
              {section.label}
            </h2>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  );
}
