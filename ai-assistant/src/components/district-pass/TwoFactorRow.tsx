import * as React from "react";
import {
  DeviceMobileIcon,
  FingerprintIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";
import { Radio } from "@financedistrict/apps-ui/radio";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";

type Method = "authenticator" | "passkey";

const METHOD_LABEL: Record<Method, string> = {
  authenticator: "Authenticator app",
  passkey: "Passkey",
};

/**
 * Two-factor authentication row — same FeatureCard expand-to-edit idiom as the
 * Email/Password rows. Off → "Set up" expands a simulated setup (choose method
 * → scan QR / enter code, or create a passkey) → On. On → "Turn off". All
 * simulated and confirmed via `onToast`.
 */
export function TwoFactorRow({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [enabled, setEnabled] = React.useState(false);
  const [method, setMethod] = React.useState<Method | null>(null);
  const [open, setOpen] = React.useState(false);
  const [draftMethod, setDraftMethod] = React.useState<Method>("authenticator");
  const [code, setCode] = React.useState("");

  const canEnable =
    draftMethod === "passkey" ||
    (draftMethod === "authenticator" && /^\d{6}$/.test(code));

  const startSetup = () => {
    setDraftMethod("authenticator");
    setCode("");
    setOpen(true);
  };

  const cancelSetup = () => setOpen(false);

  const handleEnable = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEnable) return;
    setEnabled(true);
    setMethod(draftMethod);
    setOpen(false);
    onToast("Two-factor authentication is on.");
  };

  const turnOff = () => {
    setEnabled(false);
    setMethod(null);
    onToast("Two-factor authentication turned off.");
  };

  const subtitle =
    enabled && method
      ? `On · ${METHOD_LABEL[method]}`
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
        <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="body-03 text-primary-foreground-muted mb-2">
              Choose a method
            </legend>
            {(
              [
                {
                  value: "authenticator" as const,
                  icon: <DeviceMobileIcon size={18} />,
                  hint: "Use a TOTP app like 1Password or Google Authenticator.",
                },
                {
                  value: "passkey" as const,
                  icon: <FingerprintIcon size={18} />,
                  hint: "Use your device biometrics or a security key.",
                },
              ] satisfies {
                value: Method;
                icon: React.ReactNode;
                hint: string;
              }[]
            ).map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3"
              >
                <Radio
                  name="two-factor-method"
                  value={option.value}
                  checked={draftMethod === option.value}
                  onCheckedChange={() => setDraftMethod(option.value)}
                  className="mt-0.5"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-primary-foreground flex items-center gap-1.5 text-sm font-medium">
                    {option.icon}
                    {METHOD_LABEL[option.value]}
                  </span>
                  <span className="body-03 text-primary-foreground-muted">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          {draftMethod === "authenticator" ? (
            <div className="flex flex-col gap-3">
              <div className="border-card-border flex size-36 items-center justify-center rounded-sm border">
                <QrCodeIcon size={96} className="text-primary-foreground" />
              </div>
              <span className="body-03 text-primary-foreground-muted">
                Scan this with your authenticator app, then enter the 6-digit
                code it shows.
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
          ) : (
            <span className="body-03 text-primary-foreground-muted">
              You'll be prompted to create a passkey with your device when you
              enable.
            </span>
          )}
        </div>
      )}
    </form>
  );
}
