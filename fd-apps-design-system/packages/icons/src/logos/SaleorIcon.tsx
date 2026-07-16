import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<path fill="#151515" fill-rule="evenodd" d="M16 2c7.732 0 14 6.268 14 14s-6.268 14-14 14S2 23.732 2 16 8.268 2 16 2m-5 11-5 6h15l5-6z" clip-rule="evenodd"/>';

export const SaleorIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
SaleorIcon.displayName = "SaleorIcon";
