import * as React from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { Input } from "@financedistrict/apps-ui/input";
import { Dialog } from "@financedistrict/apps-ui/dialog";

/**
 * Account-deletion row in the Security section — a FeatureCard matching the
 * sibling Password row (Warning leading icon, permanence copy as the subtitle)
 * with a destructive "Delete account" button in the trailing slot. The button
 * opens a confirmation `Dialog` that requires the user to enter their password
 * before the destructive confirm button enables. Deletion is simulated:
 * confirming just closes the dialog and calls `onDeleted` (the parent shows a
 * toast) — no routing, no real deletion.
 */
export function DangerZone({
  onDeleted,
  disabled = false,
}: {
  onDeleted: () => void;
  /** Disabled while a Security card is in edit mode. */
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const canDelete = password.length > 0;

  const reset = () => {
    setPassword("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleDelete = () => {
    if (!canDelete) return;
    handleOpenChange(false);
    onDeleted();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <FeatureCard
        title="Delete account"
        subtitle="Deleting your District Pass is permanent and cannot be undone."
        caret={false}
        leading={<WarningIcon />}
        trailing={
          <Dialog.Trigger asChild>
            <Button
              variation="destructive"
              size="sm"
              type="button"
              disabled={disabled}
              className="shrink-0 whitespace-nowrap"
            >
              Delete account
            </Button>
          </Dialog.Trigger>
        }
      />
      <Dialog.Content>
            <Dialog.Header
              icon={<WarningIcon weight="fill" />}
              title="Delete your District Pass?"
              description="This permanently removes your identity, revokes all connected-app access, and erases your activity history. This cannot be undone."
              showClose
            />
            <Dialog.Body>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variation="secondary" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variation="destructive"
                type="button"
                disabled={!canDelete}
                onClick={handleDelete}
              >
                Delete account
              </Button>
            </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
  );
}
