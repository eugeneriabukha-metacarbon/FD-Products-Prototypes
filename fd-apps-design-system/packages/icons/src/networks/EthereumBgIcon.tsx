import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<circle cx="16" cy="16" r="14" fill="#151515"/><path fill="#B2B2B2" d="m15.999 7-.124.41v11.902l.124.12 5.664-3.265z"/><path fill="#fff" d="m15.998 7-5.665 9.167 5.665 3.266z"/><path fill="#B2B2B2" d="m15.999 20.479-.07.083v4.24L16 25l5.668-7.785z"/><path fill="#fff" d="M15.998 25v-4.52l-5.665-3.264z"/><path fill="#686868" d="m15.997 19.433 5.664-3.266-5.664-2.511z"/><path fill="#B2B2B2" d="m10.333 16.167 5.665 3.266v-5.777z"/>';

export const EthereumBgIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
EthereumBgIcon.displayName = "EthereumBgIcon";
