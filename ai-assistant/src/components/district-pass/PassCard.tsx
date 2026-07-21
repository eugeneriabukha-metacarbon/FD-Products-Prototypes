import * as React from "react";
import { PencilSimpleIcon, SealCheckIcon } from "@phosphor-icons/react";
import { useCutCornerClipPath } from "@financedistrict/apps-ui/cut-corner";
import { Button } from "@financedistrict/apps-ui/button";
import { Dialog } from "@financedistrict/apps-ui/dialog";
import { Input } from "@financedistrict/apps-ui/input";
import brandmark from "../../assets/fd-brandmark.svg";
import { PASS_ID, MEMBER_SINCE } from "./mockData";

const CARD_CUT = { cut: 16, radius: 2, radiusCuts: 0 } as const;

/** Subtle-on-dark icon-button styling for the card's edit affordance. */
const EDIT_BUTTON_CLASS =
  "text-surface/60 hover:text-surface focus-visible:outline-focus outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid rounded-xs transition-colors cursor-pointer";

export function PassCard({
  name,
  initials,
  onNameSave,
}: {
  name: string;
  initials: string;
  onNameSave: (name: string) => void;
}) {
  const { ref, clipPath } = useCutCornerClipPath<HTMLDivElement>(CARD_CUT.cut, {
    radius: CARD_CUT.radius,
    radiusCuts: CARD_CUT.radiusCuts,
  });
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(name);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setDraft(name);
  };

  const handleSave = () => {
    onNameSave(draft.trim() || name);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      style={{ clipPath }}
      className="bg-primary-foreground text-surface relative flex flex-col gap-6 overflow-hidden p-6"
    >
      {/* brand watermark */}
      <img
        src={brandmark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-6 size-40 opacity-[0.06]"
      />

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <div className="flex items-center gap-4">
          <span className="button-01 bg-brand-primary-accent text-brand-primary-foreground flex size-14 items-center justify-center rounded-sm text-xl">
            {initials}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold">{name}</span>
              <SealCheckIcon
                size={18}
                weight="fill"
                className="text-brand-primary-accent"
                aria-label="Verified identity"
              />
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Edit name"
                  className={EDIT_BUTTON_CLASS}
                >
                  <PencilSimpleIcon size={16} />
                </button>
              </Dialog.Trigger>
            </div>
            <span className="body-03 opacity-70">{MEMBER_SINCE}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <span className="font-mono text-sm tracking-widest opacity-80">
            {PASS_ID}
          </span>
        </div>

        <Dialog.Content>
          <Dialog.Header title="Edit name" showClose />
          <Dialog.Body>
            <Input
              label="Display name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variation="secondary" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button variation="primary" type="button" onClick={handleSave}>
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
