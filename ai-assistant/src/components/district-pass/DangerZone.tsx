import * as React from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { Input } from "@financedistrict/apps-ui/input";
import { Dialog } from "@financedistrict/apps-ui/dialog";

const CONFIRM_WORD = "DELETE";

/**
 * Destructive-styled block at the bottom of the Security tab — no wrapper
 * needed since it carries its own red-tinted heading/border. Opens a
 * confirmation `Dialog` that requires the user to type `DELETE` and enter a
 * password before the destructive confirm button enables. Deletion is
 * simulated: confirming just closes the dialog and calls `onDeleted` (the
 * parent shows a toast) — no routing, no real deletion.
 */
export function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [password, setPassword] = React.useState("");

  const canDelete = confirmText.trim() === CONFIRM_WORD && password.length > 0;

  const reset = () => {
    setConfirmText("");
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
    <div className="border-destructive-primary-foreground/40 flex flex-col gap-3 rounded-sm border p-4">
      <div className="flex flex-col gap-1">
        <h2 className="display-04 text-destructive-primary-foreground">
          Danger zone
        </h2>
        <p className="body-03 text-primary-foreground-muted">
          Deleting your District Pass is permanent and cannot be undone.
        </p>
      </div>
      <div>
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            <Button variation="destructive" size="sm" type="button">
              Delete account
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header
              icon={<WarningIcon weight="fill" />}
              title="Delete your District Pass?"
              description="This permanently removes your identity, revokes all connected-app access, and erases your activity history. This cannot be undone."
              showClose
            />
            <Dialog.Body>
              <div className="flex flex-col gap-6">
                <Input
                  label={`Type ${CONFIRM_WORD} to confirm`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
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
      </div>
    </div>
  );
}
