/**
 * Types for the vendored React Bits `PixelBlast.jsx` (JS + CSS variant).
 * `allowJs` is off in this project, so this sibling declaration file is what
 * TypeScript resolves for `./pixel-blast/PixelBlast`; Vite bundles the .jsx.
 */
import * as React from "react";

export interface PixelBlastProps {
  /** Pixel shape variant. */
  variant?: "square" | "circle" | "triangle" | "diamond";
  /** Base pixel size (auto scaled for DPI). */
  pixelSize?: number;
  /** Pixel color. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  antialias?: boolean;
  /** Noise/pattern scale. */
  patternScale?: number;
  /** Pattern density adjustment. */
  patternDensity?: number;
  /** Enable liquid distortion effect. */
  liquid?: boolean;
  /** Liquid distortion strength. */
  liquidStrength?: number;
  /** Liquid touch brush radius scale. */
  liquidRadius?: number;
  /** Random jitter applied to coverage. */
  pixelSizeJitter?: number;
  /** Enable click ripple waves. */
  enableRipples?: boolean;
  /** Ripple intensity multiplier. */
  rippleIntensityScale?: number;
  /** Ripple ring thickness. */
  rippleThickness?: number;
  /** Ripple propagation speed. */
  rippleSpeed?: number;
  /** Liquid wobble frequency. */
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  /** Animation time scale. */
  speed?: number;
  /** Transparent background. */
  transparent?: boolean;
  /** Edge fade distance (0-1). */
  edgeFade?: number;
  /** Post noise amount. */
  noiseAmount?: number;
}

declare const PixelBlast: React.FC<PixelBlastProps>;

export default PixelBlast;
