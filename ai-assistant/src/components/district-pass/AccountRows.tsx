import * as React from "react";
import {
  AtIcon,
  CheckCircleIcon,
  CircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { ACCOUNT_EMAIL } from "./mockData";

/** Shared muted icon-button styling (reveal toggles + edit affordances). */
const ICON_BUTTON_CLASS =
  "text-input-foreground-muted hover:text-input-foreground focus-visible:outline-focus flex cursor-pointer items-center rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid";

type PasswordField = "current" | "new" | "confirm";

/** New-password requirements, validated live against the typed value. */
const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
];

/**
 * Live password-requirement checklist. Before anything is typed every rule is
 * neutral (filled circle); once typing starts each rule flips to a filled
 * check (met) or filled x (unmet).
 */
function PasswordRules({ value }: { value: string }) {
  const touched = value.length > 0;
  return (
    <ul
      id="new-password-rules"
      aria-live="polite"
      className="flex flex-col gap-1.5"
    >
      {PASSWORD_RULES.map((rule) => {
        const state = !touched
          ? "default"
          : rule.test(value)
            ? "success"
            : "error";
        const Icon =
          state === "success"
            ? CheckCircleIcon
            : state === "error"
              ? XCircleIcon
              : CircleIcon;
        const iconColor =
          state === "success"
            ? "text-success-primary-foreground"
            : state === "error"
              ? "text-destructive-primary-foreground"
              : "text-primary-foreground-muted";
        return (
          <li key={rule.label} className="flex items-center gap-2">
            <Icon
              size={16}
              weight="fill"
              className={`shrink-0 ${iconColor}${state === "default" ? " opacity-50" : ""}`}
              aria-hidden="true"
            />
            <span className="body-03 text-primary-foreground-muted">
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Account rows — Email / Password FeatureCard rows; each expands in place
 * into an edit form (Edit → Cancel/Save, other rows' Edit disabled while
 * editing). Saves are simulated and confirmed via `onToast`.
 */
export function AccountRows({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [passwords, setPasswords] = React.useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [revealed, setRevealed] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [editingPassword, setEditingPassword] = React.useState(false);
  const [email, setEmail] = React.useState(ACCOUNT_EMAIL);
  const [editingEmail, setEditingEmail] = React.useState(false);
  const [emailForm, setEmailForm] = React.useState({
    newEmail: "",
    confirmEmail: "",
    password: "",
  });
  const [emailPasswordRevealed, setEmailPasswordRevealed] =
    React.useState(false);

  const toggleReveal = (field: PasswordField) =>
    setRevealed((prev) => ({ ...prev, [field]: !prev[field] }));

  const revealButton = (shown: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      className={ICON_BUTTON_CLASS}
    >
      {shown ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
    </button>
  );

  const revealToggle = (field: PasswordField) =>
    revealButton(revealed[field], () => toggleReveal(field));

  const startEditEmail = () => {
    setEmailForm({ newEmail: "", confirmEmail: "", password: "" });
    setEmailPasswordRevealed(false);
    setEditingEmail(true);
  };

  const cancelEditEmail = () => setEditingEmail(false);

  const handleSaveEmail = (event: React.FormEvent) => {
    event.preventDefault();
    const next = emailForm.newEmail.trim();
    if (next) setEmail(next);
    setEditingEmail(false);
    onToast("Your email has been updated.");
  };

  const resetPasswordForm = () => {
    setPasswords({ current: "", new: "", confirm: "" });
    setRevealed({ current: false, new: false, confirm: false });
  };

  const startEditPassword = () => setEditingPassword(true);

  const cancelEditPassword = () => {
    setEditingPassword(false);
    resetPasswordForm();
  };

  const handleSavePassword = (event: React.FormEvent) => {
    event.preventDefault();
    resetPasswordForm();
    setEditingPassword(false);
    onToast("Your password has been changed.");
  };

  return (
    <div className="flex flex-col">
      {/* Email — header stays visible; form expands beneath it. */}
      <form onSubmit={handleSaveEmail} className="border-card-border border-b">
        <FeatureCard
          title="Email"
          subtitle={email}
          caret={false}
          leading={<AtIcon />}
          trailing={
            editingEmail ? (
              <div className="flex gap-2">
                <Button
                  variation="secondary"
                  size="sm"
                  type="button"
                  onClick={cancelEditEmail}
                >
                  Cancel
                </Button>
                <Button variation="primary" size="sm" type="submit">
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variation="secondary"
                size="sm"
                type="button"
                onClick={startEditEmail}
                disabled={editingPassword}
              >
                Edit
              </Button>
            )
          }
        />
        {editingEmail && (
          <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
            <Input
              label="New email"
              type="email"
              value={emailForm.newEmail}
              onChange={(event) =>
                setEmailForm((prev) => ({
                  ...prev,
                  newEmail: event.target.value,
                }))
              }
            />
            <Input
              label="Confirm new email"
              type="email"
              value={emailForm.confirmEmail}
              onChange={(event) =>
                setEmailForm((prev) => ({
                  ...prev,
                  confirmEmail: event.target.value,
                }))
              }
            />
            <Input
              label="Current password"
              type={emailPasswordRevealed ? "text" : "password"}
              value={emailForm.password}
              onChange={(event) =>
                setEmailForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              rightSlot={revealButton(emailPasswordRevealed, () =>
                setEmailPasswordRevealed((value) => !value),
              )}
            />
          </div>
        )}
      </form>

      {/* Password — header stays visible; form expands beneath it. */}
      <form onSubmit={handleSavePassword}>
        <FeatureCard
          title="Password"
          subtitle="••••••••"
          caret={false}
          leading={<LockIcon />}
          trailing={
            editingPassword ? (
              <div className="flex gap-2">
                <Button
                  variation="secondary"
                  size="sm"
                  type="button"
                  onClick={cancelEditPassword}
                >
                  Cancel
                </Button>
                <Button variation="primary" size="sm" type="submit">
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variation="secondary"
                size="sm"
                type="button"
                onClick={startEditPassword}
                disabled={editingEmail}
              >
                Edit
              </Button>
            )
          }
        />
        {editingPassword && (
          <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
            <Input
              label="Current password"
              type={revealed.current ? "text" : "password"}
              value={passwords.current}
              onChange={(event) =>
                setPasswords((prev) => ({
                  ...prev,
                  current: event.target.value,
                }))
              }
              rightSlot={revealToggle("current")}
            />
            <div className="flex flex-col gap-3">
              <Input
                label="New password"
                type={revealed.new ? "text" : "password"}
                value={passwords.new}
                onChange={(event) =>
                  setPasswords((prev) => ({
                    ...prev,
                    new: event.target.value,
                  }))
                }
                aria-describedby="new-password-rules"
                rightSlot={revealToggle("new")}
              />
              <PasswordRules value={passwords.new} />
            </div>
            <Input
              label="Confirm password"
              type={revealed.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(event) =>
                setPasswords((prev) => ({
                  ...prev,
                  confirm: event.target.value,
                }))
              }
              rightSlot={revealToggle("confirm")}
            />
          </div>
        )}
      </form>
    </div>
  );
}
