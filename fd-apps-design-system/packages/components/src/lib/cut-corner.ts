"use client";

import * as React from "react";

/**
 * Cut-corner geometry — ported from the FD marketing site (`fd-website`
 * `useCutCornerClipPath`). Two diagonally-opposite corners (top-left and
 * bottom-right) are chamfered; the other two are rounded 90° corners.
 *
 * The chamfer size and arc radii feed SVG path math, so the shape can't be
 * expressed with CSS `border-radius` / `clip-path: polygon()` alone — the path
 * depends on the measured pixel width/height. We therefore measure the element
 * and recompute on resize.
 *
 * FD apps use SHARPER edges than the marketing site: the default arc radius is
 * `2px` (Figma `radius/xs`) on every vertex, versus the site's softer `6/8px`.
 */
export interface UseCutCornerClipPathOptions {
  /** Border-radius (px) applied to every vertex unless overridden below. */
  radius?: number;
  /** Radius override for the two diagonal chamfer arcs. */
  radiusCuts?: number;
  /** Radius override for the top-right 90° corner. */
  radiusTopRight?: number;
  /** Radius override for the bottom-left 90° corner. */
  radiusBottomLeft?: number;
  /**
   * If set, also emit `outsetPathD` — the same shape expanded uniformly outward
   * by this many px. Used to draw a focus ring that follows the cut-corner
   * outline instead of a plain rounded rectangle.
   */
  outset?: number;
}

interface CutPathParams {
  W: number;
  H: number;
  cut: number;
  rTR: number;
  rBL: number;
  rCut: number;
  /** Origin offset, so an outset path can be emitted in the element's own coordinate space. */
  ox?: number;
  oy?: number;
}

/** The chamfered/rounded outline as an SVG path, in the element's pixel space. */
function buildCutPath({
  W,
  H,
  cut,
  rTR,
  rBL,
  rCut,
  ox = 0,
  oy = 0,
}: CutPathParams): string {
  const rCutSq = rCut / Math.SQRT2;
  const x = (v: number) => v + ox;
  const y = (v: number) => v + oy;
  return [
    `M ${x(cut + rCut)} ${y(0)}`,
    `L ${x(W - rTR)} ${y(0)}`,
    `Q ${x(W)} ${y(0)} ${x(W)} ${y(rTR)}`,
    `L ${x(W)} ${y(H - cut - rCut)}`,
    `Q ${x(W)} ${y(H - cut)} ${x(W - rCutSq)} ${y(H - cut + rCutSq)}`,
    `L ${x(W - cut + rCutSq)} ${y(H - rCutSq)}`,
    `Q ${x(W - cut)} ${y(H)} ${x(W - cut - rCut)} ${y(H)}`,
    `L ${x(rBL)} ${y(H)}`,
    `Q ${x(0)} ${y(H)} ${x(0)} ${y(H - rBL)}`,
    `L ${x(0)} ${y(cut + rCut)}`,
    `Q ${x(0)} ${y(cut)} ${x(rCutSq)} ${y(cut - rCutSq)}`,
    `L ${x(cut - rCutSq)} ${y(rCutSq)}`,
    `Q ${x(cut)} ${y(0)} ${x(cut + rCut)} ${y(0)}`,
    `Z`,
  ].join(" ");
}

export function useCutCornerClipPath<T extends HTMLElement = HTMLElement>(
  cut: number,
  {
    radius = 2,
    radiusCuts,
    radiusTopRight,
    radiusBottomLeft,
    outset,
  }: UseCutCornerClipPathOptions = {},
) {
  const ref = React.useRef<T>(null);
  const [clipPath, setClipPath] = React.useState<string | undefined>();
  const [pathD, setPathD] = React.useState<string | undefined>();
  const [outsetPathD, setOutsetPathD] = React.useState<string | undefined>();

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rTR = radiusTopRight ?? radius;
    const rBL = radiusBottomLeft ?? radius;
    const rCut = radiusCuts ?? radius;

    // FRACTIONAL size, not offsetWidth/offsetHeight: text makes button widths
    // fractional (e.g. 102.56px), and the integer rounding puts the whole error
    // on the right/bottom — the path (and the focus ring riding on it) ends up
    // visibly asymmetric. ResizeObserver's borderBoxSize reports unrounded
    // layout px; the initial call falls back to getBoundingClientRect().
    function compute(W: number, H: number) {
      const d = buildCutPath({ W, H, cut, rTR, rBL, rCut });
      setClipPath(`path('${d}')`);
      setPathD(d);

      if (outset != null) {
        const g = outset;
        // Uniform outward offset by g: straight edges move out by g, convex
        // arcs grow by g, and the 45° chamfer moves out (its flat length grows
        // by (2 − √2)·g). Emitted in the button's own coordinate space (origin
        // shifted by −g) so the ring SVG shares the button's 0..W / 0..H frame.
        setOutsetPathD(
          buildCutPath({
            W: W + 2 * g,
            H: H + 2 * g,
            cut: cut + (2 - Math.SQRT2) * g,
            rTR: rTR + g,
            rBL: rBL + g,
            rCut: rCut + g,
            ox: -g,
            oy: -g,
          }),
        );
      }
    }

    const initial = el.getBoundingClientRect();
    compute(initial.width, initial.height);
    const ro = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.borderBoxSize?.[0];
      if (box) {
        compute(box.inlineSize, box.blockSize);
      } else {
        const rect = el.getBoundingClientRect();
        compute(rect.width, rect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [cut, radius, radiusCuts, radiusTopRight, radiusBottomLeft, outset]);

  return { ref, clipPath, pathD, outsetPathD };
}

/**
 * Fixed cut-corner preset for buttons (Figma `01. Buttons` → `cut-8px`):
 * an 8px chamfer. The two diagonal cuts are sharp (`radiusCuts: 0`); the two
 * square corners keep a subtle 2px arc. Same value for `sm` and `lg`.
 */
export const BUTTON_CUT = { cut: 8, radius: 2, radiusCuts: 0 } as const;
