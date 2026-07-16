import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<path fill="#8C8C8C" d="M7.225 20.67a.88.88 0 0 1 .6-.23h20.75c.378 0 .567.425.3.675l-4.1 3.82a.88.88 0 0 1-.6.232H3.425c-.378 0-.567-.427-.3-.676zm0-14.272a.88.88 0 0 1 .6-.231h20.75c.378 0 .567.426.3.675l-4.1 3.82a.88.88 0 0 1-.6.232H3.425c-.378 0-.567-.427-.3-.676zm17.55 7.091a.88.88 0 0 0-.6-.232H3.425c-.378 0-.567.427-.3.676l4.1 3.82a.88.88 0 0 0 .6.232h20.75c.378 0 .567-.427.3-.676z"/>';

export const SolanaIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
SolanaIcon.displayName = "SolanaIcon";
