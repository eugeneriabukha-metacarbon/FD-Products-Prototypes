import * as React from "react";
import { AtIcon } from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { ACCOUNT_EMAIL } from "./mockData";
import { RevealButton } from "./fieldReveal";

/**
 * Email row — a FeatureCard that expands in place into a change-email form
 * (New email / Confirm / Current password with reveal). Edit → Cancel/Save;
 * the Save is simulated and confirmed via `onToast`. Lives in the Account
 * section alongside the Nickname row.
 */
export function EmailRow({
  onToast,
  onEditingChange,
  lockedByOthers = false,
}: {
  onToast: (message: string) => void;
  /** Reports whether the email form is currently open. */
  onEditingChange?: (editing: boolean) => void;
  /** Another card in the section is being edited — lock this card's Edit. */
  lockedByOthers?: boolean;
}) {
  const [email, setEmail] = React.useState(ACCOUNT_EMAIL);
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({
    newEmail: "",
    confirmEmail: "",
    password: "",
  });
  const [passwordRevealed, setPasswordRevealed] = React.useState(false);

  React.useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  const startEdit = () => {
    setForm({ newEmail: "", confirmEmail: "", password: "" });
    setPasswordRevealed(false);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const next = form.newEmail.trim();
    if (next) setEmail(next);
    setEditing(false);
    onToast("Your email has been updated.");
  };

  return (
    <form onSubmit={handleSave}>
      <FeatureCard
        title="Email"
        subtitle={email}
        caret={false}
        leading={<AtIcon />}
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
            label="New email"
            type="email"
            value={form.newEmail}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, newEmail: event.target.value }))
            }
          />
          <Input
            label="Confirm new email"
            type="email"
            value={form.confirmEmail}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, confirmEmail: event.target.value }))
            }
          />
          <Input
            label="Current password"
            type={passwordRevealed ? "text" : "password"}
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            rightSlot={
              <RevealButton
                shown={passwordRevealed}
                onToggle={() => setPasswordRevealed((value) => !value)}
              />
            }
          />
        </div>
      )}
    </form>
  );
}
