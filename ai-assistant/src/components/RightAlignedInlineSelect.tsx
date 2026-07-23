import * as React from "react";
import {
  InlineSelect,
  type InlineSelectProps,
} from "@financedistrict/apps-ui/inline-select";

/**
 * DS `InlineSelect` whose portaled dropdown is right-aligned to the trigger.
 *
 * The DS left-anchors the auto-width dropdown (`computeListboxHorizontal`) and
 * exposes no alignment prop; since the DS is vendored read-only here, we adjust
 * from the outside. While the trigger is open we re-anchor the portaled
 * `<ul role="listbox">` so its right edge meets the trigger's right edge. The
 * DS re-applies its own `left` on open/scroll/resize (React-controlled inline
 * style), so a MutationObserver re-runs the alignment after each of those; the
 * 1px guard makes the correction idempotent (no feedback loop).
 */
export function RightAlignedInlineSelect(props: InlineSelectProps) {
  const wrapRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const trigger = wrapRef.current?.querySelector("button");
    if (!trigger) return;

    let styleObserver: MutationObserver | null = null;

    const alignOnce = () => {
      const id = trigger.getAttribute("aria-controls");
      const listbox = id ? document.getElementById(id) : null;
      if (!listbox) return;
      const desired =
        trigger.getBoundingClientRect().right +
        window.scrollX -
        listbox.offsetWidth;
      // Idempotent: only nudge when the DS's left differs, so re-applying our
      // value in response to our own mutation is a no-op (no observer loop).
      if (Math.abs((parseFloat(listbox.style.left) || 0) - desired) > 1) {
        listbox.style.left = `${desired}px`;
      }
    };

    // Trigger `aria-expanded` flips with open/close — (re)wire the style watch.
    const openObserver = new MutationObserver(() => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      styleObserver?.disconnect();
      styleObserver = null;
      if (!isOpen) return;
      const id = trigger.getAttribute("aria-controls");
      const listbox = id ? document.getElementById(id) : null;
      if (!listbox) return;
      styleObserver = new MutationObserver(alignOnce);
      styleObserver.observe(listbox, {
        attributes: true,
        attributeFilter: ["style"],
      });
      alignOnce();
    });
    openObserver.observe(trigger, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
    });

    return () => {
      openObserver.disconnect();
      styleObserver?.disconnect();
    };
  }, []);

  return (
    <span ref={wrapRef} className="contents">
      <InlineSelect {...props} />
    </span>
  );
}
