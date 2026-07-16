import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<path fill="#343434" d="m15.999 4-.165.547v15.87l.165.16 7.552-4.354z"/><path fill="#8C8C8C" d="M15.997 4 8.444 16.223l7.553 4.354z"/><path fill="#3C3C3C" d="m15.999 21.972-.093.11v5.653l.093.265 7.557-10.38z"/><path fill="#8C8C8C" d="M15.997 28v-6.028L8.444 17.62z"/><path fill="#141414" d="m15.996 20.577 7.552-4.355-7.552-3.348z"/><path fill="#3C3C3C" d="m8.444 16.222 7.553 4.354v-7.702z"/>';

export const EthereumIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
EthereumIcon.displayName = "EthereumIcon";
