import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<path fill="#8C8C8C" d="M18.707 25.253v3.138L15.96 30l-2.667-1.61v-3.137l2.667 1.61zM4 14.39 6.667 16v5.39l4.606 2.736v3.138L4 23zm23.92 0V23l-7.354 4.264v-3.138l4.606-2.735V16zm-7.354-4.265 2.747 1.61v3.138l-4.606 2.735v5.471l-2.667 1.61-2.666-1.61v-5.47l-4.768-2.736v-3.138l2.748-1.61 4.606 2.736zm-11.96 7 2.667 1.61v3.138l-2.667-1.61zm14.707 0v3.138l-2.667 1.61v-3.138zM6.667 7.391 9.414 9l-2.747 1.61v3.137L4 12.137V9zm18.586 0L28 9v3.138l-2.747 1.61v-3.139L22.586 9zm-9.293 0L18.707 9l-2.747 1.61L13.293 9zm0-5.391 7.353 4.264-2.667 1.61-4.606-2.736-4.686 2.736-2.667-1.61z"/>';

export const BinanceSmartChainIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
BinanceSmartChainIcon.displayName = "BinanceSmartChainIcon";
