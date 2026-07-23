import * as React from "react";
import { UserIcon } from "@phosphor-icons/react";
import { Input } from "@financedistrict/apps-ui/input";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";

/**
 * Nickname row — a FeatureCard that expands in place into a single-field form
 * for the display name shown on the hero PassCard. Edit → Cancel/Save; Save
 * lifts the new name to the parent via `onNameSave` and confirms via `onToast`.
 * Lives at the top of the Account section (this replaced the PassCard's inline
 * edit pencil).
 */
export function NicknameRow({
  name,
  onNameSave,
  onToast,
  onEditingChange,
  lockedByOthers = false,
}: {
  name: string;
  onNameSave: (name: string) => void;
  onToast: (message: string) => void;
  /** Reports whether the nickname form is currently open. */
  onEditingChange?: (editing: boolean) => void;
  /** Another card in the section is being edited — lock this card's Edit. */
  lockedByOthers?: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(name);

  React.useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  const startEdit = () => {
    setDraft(name);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    onNameSave(draft.trim() || name);
    setEditing(false);
    onToast("Your nickname has been updated.");
  };

  return (
    <form onSubmit={handleSave}>
      <FeatureCard
        title="Nickname"
        subtitle={name}
        caret={false}
        leading={<UserIcon />}
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
            label="Nickname"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
      )}
    </form>
  );
}
