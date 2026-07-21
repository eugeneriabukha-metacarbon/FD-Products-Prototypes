import * as React from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Input } from "@financedistrict/apps-ui/input";
import { Dialog } from "@financedistrict/apps-ui/dialog";

/**
 * Account-deletion row at the bottom of the Security tab: a muted description
 * on the left and a destructive "Delete account" button on the right (no
 * bordered box, no heading — per Figma 549:43866). The button opens a
 * confirmation `Dialog` that requires the user to enter their password before
 * the destructive confirm button enables. Deletion is simulated: confirming
 * just closes the dialog and calls `onDeleted` (the parent shows a toast) —
 * no routing, no real deletion.
 */
export function DangerZone({ onDeleted }: { onDeleted: () => void }) {
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
      <div className="flex items-center justify-between gap-4">
        <p className="body-03 text-primary-foreground-muted">
          Deleting your District Pass is permanent and cannot be undone.
        </p>
        <Dialog.Trigger asChild>
          <Button
            variation="destructive"
            size="sm"
            type="button"
            className="shrink-0 whitespace-nowrap"
          >
            Delete account
          </Button>
        </Dialog.Trigger>
      </div>
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
