import * as React from "react";
import {
  CheckCircleIcon,
  CircleIcon,
  LockIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { RevealButton } from "./fieldReveal";

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
 * Password row — a FeatureCard that expands in place into a change-password
 * form (Current / New with a live requirement checklist / Confirm, each with a
 * reveal toggle). Edit → Cancel/Save; the Save is simulated and confirmed via
 * `onToast`. Lives on its own in the Security section.
 */
export function PasswordRow({
  onToast,
  onEditingChange,
  lockedByOthers = false,
}: {
  onToast: (message: string) => void;
  /** Reports whether the password form is currently open. */
  onEditingChange?: (editing: boolean) => void;
  /** Another card in the section is being edited — lock this card's Edit. */
  lockedByOthers?: boolean;
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
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  const toggleReveal = (field: PasswordField) =>
    setRevealed((prev) => ({ ...prev, [field]: !prev[field] }));

  const revealToggle = (field: PasswordField) => (
    <RevealButton shown={revealed[field]} onToggle={() => toggleReveal(field)} />
  );

  const resetForm = () => {
    setPasswords({ current: "", new: "", confirm: "" });
    setRevealed({ current: false, new: false, confirm: false });
  };

  const startEdit = () => setEditing(true);

  const cancelEdit = () => {
    setEditing(false);
    resetForm();
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    resetForm();
    setEditing(false);
    onToast("Your password has been changed.");
  };

  return (
    <form onSubmit={handleSave}>
      <FeatureCard
        title="Password"
        subtitle="••••••••"
        caret={false}
        leading={<LockIcon />}
        trailing={
          editing ? (
            <div className="flex gap-2">
              <Button
                variation="secondary"
                size="sm"
                type="button"
                onClick={cancelEdit}
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
              onClick={startEdit}
              disabled={lockedByOthers}
            >
              Edit
            </Button>
          )
        }
      />
      {editing && (
        <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
          <Input
            label="Current password"
            type={revealed.current ? "text" : "password"}
            value={passwords.current}
            onChange={(event) =>
              setPasswords((prev) => ({ ...prev, current: event.target.value }))
            }
            rightSlot={revealToggle("current")}
          />
          <div className="flex flex-col gap-3">
            <Input
              label="New password"
              type={revealed.new ? "text" : "password"}
              value={passwords.new}
              onChange={(event) =>
                setPasswords((prev) => ({ ...prev, new: event.target.value }))
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
              setPasswords((prev) => ({ ...prev, confirm: event.target.value }))
            }
            rightSlot={revealToggle("confirm")}
          />
        </div>
      )}
    </form>
  );
}
