import * as React from "react";
import {
  DesktopIcon,
  DeviceMobileIcon,
  LaptopIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { DEVICES, type DeviceKind, type DeviceSession } from "./mockData";

const DEVICE_ICON: Record<DeviceKind, typeof LaptopIcon> = {
  phone: DeviceMobileIcon,
  laptop: LaptopIcon,
  desktop: DesktopIcon,
};

/** Muted icon-button styling for the per-row sign-out affordance. */
const SIGN_OUT_BUTTON_CLASS =
  "text-primary-foreground-muted hover:text-primary-foreground focus-visible:outline-focus flex shrink-0 cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid";

/**
 * Devices tab — active signed-in sessions. Each row reuses the Activity-tab
 * row layout (leading icon · name · browser/location · last-active) plus a
 * trailing X to sign that device out. Below the list, an "End all sessions"
 * row reuses the Security tab's danger-zone layout (muted copy + destructive
 * button). All actions are simulated and confirmed with a toast.
 */
export function DevicesTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [devices, setDevices] = React.useState<DeviceSession[]>(DEVICES);

  const signOut = (device: DeviceSession) => {
    setDevices((prev) => prev.filter((d) => d.id !== device.id));
    onToast(`Signed out of ${device.name}.`);
  };

  const endAll = () => {
    setDevices([]);
    onToast("All sessions ended.");
  };

  return (
    <div className="flex flex-col gap-8">
      {devices.length === 0 ? (
        <p className="body-03 text-primary-foreground-muted">
          You're not signed in on any other devices.
        </p>
      ) : (
        <ul className="flex flex-col">
          {devices.map((device) => {
            const Icon = DEVICE_ICON[device.kind];
            return (
              <li
                key={device.id}
                className="border-card-border flex items-center gap-3 border-b py-3 last:border-b-0"
              >
                <Icon
                  size={20}
                  className="text-primary-foreground-muted shrink-0"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-primary-foreground truncate text-sm font-medium">
                    {device.name}
                  </span>
                  <span className="body-03 text-primary-foreground-muted truncate">
                    {device.browser} · {device.location}
                  </span>
                </div>
                <span className="body-03 text-primary-foreground-muted shrink-0">
                  {device.lastActive}
                </span>
                <button
                  type="button"
                  aria-label={`Sign out ${device.name}`}
                  onClick={() => signOut(device)}
                  className={SIGN_OUT_BUTTON_CLASS}
                >
                  <XIcon size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="body-03 text-primary-foreground-muted">
          Sign out of every device where you're currently signed in, including
          this one.
        </p>
        <Button
          variation="destructive"
          size="sm"
          type="button"
          className="shrink-0 whitespace-nowrap"
          disabled={devices.length === 0}
          onClick={endAll}
        >
          End all sessions
        </Button>
      </div>
    </div>
  );
}
