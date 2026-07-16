import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<path fill="#151515" d="M16 30A14 14 0 1 0 2 16a13.965 13.965 0 0 0 14 14"/><g fill="#fff"><path d="m23.523 17.982-2.494 2.14-2.682 2.284h-4.505v-2.32h6.618c.047 0 .685 0 .685-.798v-4.86h2.378z"/><path d="M23.522 12.103H12.064c-.253.011-.601.1-.601.617v9.682H9v-8.16l2.463-2.14L13.953 10h9.57z"/></g>';

export const FDUSDIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
FDUSDIcon.displayName = "FDUSDIcon";
