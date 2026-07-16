import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<path fill="#151515" d="M30 16c0-7.732-6.268-14-14-14S2 8.268 2 16s6.268 14 14 14 14-6.268 14-14"/><path fill="#FEFEFE" d="M16.019 21a5.003 5.003 0 0 1-5.01-5c0-2.762 2.242-5 5.01-5a5.005 5.005 0 0 1 4.934 4.167H26C25.574 10.033 21.27 6 16.019 6 10.488 6 6 10.48 6 16s4.488 10 10.019 10c5.251 0 9.555-4.033 9.981-9.167h-5.051A5 5 0 0 1 16.019 21"/>';

export const CoinbaseBgIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
CoinbaseBgIcon.displayName = "CoinbaseBgIcon";
