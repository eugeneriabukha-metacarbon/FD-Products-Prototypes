import * as React from "react";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  /** Sets width & height. Number → px. Default 24. viewBox stays "0 0 32 32". */
  size?: number | string;
  /** Accessible label. Set → <title> + role="img"; omitted → aria-hidden. */
  title?: string;
}

interface BaseProps extends IconProps {
  /** Optimized inner-SVG markup, injected build-time (trusted). Internal only. */
  body: string;
}

/**
 * Shared base for every generated icon. Owns the <svg> (size / a11y / viewBox).
 * The icon artwork is injected into an inner <g> via dangerouslySetInnerHTML —
 * the markup is our own SVGO output baked in at build time, never user input.
 * Not exported from any library barrel.
 */
export const Icon = React.forwardRef<SVGSVGElement, BaseProps>(
  ({ size = 24, title, body, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: body }} />
    </svg>
  ),
);
Icon.displayName = "Icon";
