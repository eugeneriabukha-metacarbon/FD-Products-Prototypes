import * as React from "react";
import { QrCodeIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";

/**
 * Two-factor authentication row — same FeatureCard expand-to-edit idiom as the
 * Email/Password rows. Off → "Set up" expands a simulated authenticator-app
 * setup (scan the QR, enter the 6-digit code) → On. On → "Turn off". Enable
 * gates on a valid 6-digit code. Simulated and confirmed via `onToast`.
 */
export function TwoFactorRow({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [enabled, setEnabled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");

  const canEnable = /^\d{6}$/.test(code);

  const startSetup = () => {
    setCode("");
    setOpen(true);
  };

  const cancelSetup = () => setOpen(false);

  const handleEnable = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEnable) return;
    setEnabled(true);
    setOpen(false);
    onToast("Two-factor authentication is on.");
  };

  const turnOff = () => {
    setEnabled(false);
    onToast("Two-factor authentication turned off.");
  };

  const subtitle = enabled
    ? "On · Authenticator app"
    : "Add an extra layer of security to your account.";

  return (
    <form onSubmit={handleEnable} className="border-card-border border-t">
      <FeatureCard
        title="Two-factor authentication"
        subtitle={subtitle}
        caret={false}
        leading={<ShieldCheckIcon />}
        trailing={
          open ? (
            <div className="flex gap-2">
              <Button
                variation="secondary"
                size="sm"
                type="button"
                onClick={cancelSetup}
              >
                Cancel
              </Button>
              <Button
                variation="primary"
                size="sm"
                type="submit"
                disabled={!canEnable}
              >
                Enable
              </Button>
            </div>
          ) : enabled ? (
            <Button
              variation="secondary"
              size="sm"
              type="button"
              onClick={turnOff}
            >
              Turn off
            </Button>
          ) : (
            <Button
              variation="secondary"
              size="sm"
              type="button"
              onClick={startSetup}
            >
              Set up
            </Button>
          )
        }
      />

      {open && (
        <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
          <div className="border-card-border flex size-36 items-center justify-center rounded-sm border">
            <QrCodeIcon size={96} className="text-primary-foreground" />
          </div>
          <span className="body-03 text-primary-foreground-muted">
            Scan this with your authenticator app, then enter the 6-digit code
            it shows.
          </span>
          <Input
            label="6-digit code"
            inputMode="numeric"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </div>
      )}
    </form>
  );
}
