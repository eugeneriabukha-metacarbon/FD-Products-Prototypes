import * as React from "react";
import {
  DesktopIcon,
  DeviceMobileIcon,
  LaptopIcon,
  SignOutIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Dialog } from "@financedistrict/apps-ui/dialog";
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
 * trailing X to sign that device out. Below the list, an "End other sessions"
 * row (danger-zone layout: muted copy + destructive button) opens a
 * confirmation dialog and, on confirm, ends every session except the current
 * one. All actions are simulated and confirmed with a toast.
 */
export function DevicesTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [devices, setDevices] = React.useState<DeviceSession[]>(DEVICES);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const otherSessions = devices.filter((d) => !d.current);

  const signOut = (device: DeviceSession) => {
    setDevices((prev) => prev.filter((d) => d.id !== device.id));
    onToast(`Signed out of ${device.name}.`);
  };

  const endAllOthers = () => {
    setDevices((prev) => prev.filter((d) => d.current));
    setConfirmOpen(false);
    onToast("All other sessions ended.");
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

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <div className="flex items-center justify-between gap-4">
          <p className="body-03 text-primary-foreground-muted">
            This action will end all active sessions except your current one.
          </p>
          <Dialog.Trigger asChild>
            <Button
              variation="destructive"
              size="sm"
              type="button"
              className="shrink-0 whitespace-nowrap"
              disabled={otherSessions.length === 0}
            >
              End other sessions
            </Button>
          </Dialog.Trigger>
        </div>
        <Dialog.Content>
          <Dialog.Header
            icon={<SignOutIcon weight="fill" />}
            title="End other sessions?"
            description="This ends every active session except your current one. Those devices will need to sign in again."
            showClose
          />
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variation="secondary" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variation="destructive"
              type="button"
              onClick={endAllOthers}
            >
              End other sessions
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
