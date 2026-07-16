import * as React from "react";
import { Icon, type IconProps } from "../lib/Icon";

const BODY =
  '<circle cx="16" cy="16" r="14" fill="#151515"/><path fill="#FEFEFE" d="m22.928 19.724-2.311 2.441a.54.54 0 0 1-.393.168H9.268a.27.27 0 0 1-.246-.159.26.26 0 0 1 .05-.285l2.313-2.442a.54.54 0 0 1 .391-.168h10.956a.27.27 0 0 1 .246.16.26.26 0 0 1-.05.285m-2.311-4.916a.54.54 0 0 0-.393-.168H9.268a.27.27 0 0 0-.246.159.26.26 0 0 0 .05.285l2.313 2.442a.54.54 0 0 0 .391.168h10.956a.27.27 0 0 0 .246-.16.26.26 0 0 0-.05-.285zM9.268 13.054h10.956a.54.54 0 0 0 .393-.168l2.31-2.441a.26.26 0 0 0 .05-.286.27.27 0 0 0-.245-.159H11.776a.54.54 0 0 0-.391.168l-2.312 2.441a.263.263 0 0 0 .195.445"/>';

export const SolanaBgIcon = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => <Icon ref={ref} body={BODY} {...props} />,
);
SolanaBgIcon.displayName = "SolanaBgIcon";
