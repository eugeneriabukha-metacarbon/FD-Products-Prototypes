import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiamondsFourIcon, XSquareIcon } from "@phosphor-icons/react";

import { Button } from "../button";
import { Input } from "../input";
import { Dialog } from "./Dialog";

/**
 * Compound modal `Dialog` (Figma `Dialog`, nodes `4985:12074` / `4988:1882`).
 * The library owns the overlay plumbing (portal, focus trap, scroll-lock,
 * Escape, ARIA); apps only supply content. Dialog is presentation-neutral —
 * there is no `variation` prop, so the "basic" and "destructive" Figma looks are
 * reproduced here purely via the header icon + footer `Button variation`.
 */
const FIGMA_DIALOG =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=4985-12074";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog.Root,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_DIALOG },
  },
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Drive the useful props from the controls panel. Uncontrolled (opened by the
 * trigger); toggle `dismissable`. The header X close button shows by default
 * (absolute, 24px from the card's top/right) — see `WithoutCloseButton` for the
 * `showClose={false}` opt-out.
 */
export const Playground: Story = {
  args: { dismissable: true },
  argTypes: {
    dismissable: { control: "boolean" },
    open: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
  },
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger asChild>
        <Button>Open dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header
          icon={<DiamondsFourIcon />}
          title="Dialog title"
          description="A short description of what this dialog is asking for."
        />
        <Dialog.Body>
          <p className="body-03 text-foreground-muted">
            Body content goes here. It can be any composition — text, inputs, or
            other components — and scrolls internally when it grows tall.
          </p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variation="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variation="primary">Confirm</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

/**
 * A single assembled dialog cell. `look` swaps the header icon + footer
 * confirm-button variation (basic vs destructive). The close X is shown by
 * default (library default) — pass `withClose={false}` to hide it.
 */
function DialogCell({
  label,
  look = "basic",
  withIcon = true,
  withDescription = true,
  withClose = true,
}: {
  label: string;
  look?: "basic" | "destructive";
  withIcon?: boolean;
  withDescription?: boolean;
  withClose?: boolean;
}) {
  // No `weight` passed on purpose: the header icon slot defaults Phosphor icons
  // to `weight="fill"` via IconContext (the dialog's filled-icon rule).
  const icon = look === "destructive" ? <XSquareIcon /> : <DiamondsFourIcon />;
  return (
    <Dialog.Root defaultOpen={false}>
      <Dialog.Trigger asChild>
        <Button variation="secondary" size="sm">
          {label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header
          icon={withIcon ? icon : undefined}
          title={look === "destructive" ? "Delete item?" : "Dialog title"}
          description={
            withDescription
              ? "A short description of what this dialog is asking for."
              : undefined
          }
          showClose={withClose}
        />
        {/* Destructive is header + footer only (no body), matching Figma. */}
        {look !== "destructive" && (
          <Dialog.Body>
            <p className="body-03 text-foreground-muted">
              Body content goes here.
            </p>
          </Dialog.Body>
        )}
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variation="secondary">Cancel</Button>
          </Dialog.Close>
          <Button
            variation={look === "destructive" ? "destructive" : "primary"}
          >
            {look === "destructive" ? "Delete" : "Confirm"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * The useful axes as a grid of triggers (open each to inspect): basic vs
 * destructive look, close X shown (default) vs hidden, and with/without
 * icon/description. Only one dialog opens at a time.
 */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h4 className="caption-02-medium text-foreground-muted uppercase">
          Basic
        </h4>
        <div className="flex flex-wrap gap-3">
          <DialogCell label="Full (icon + description)" />
          <DialogCell label="No close button" withClose={false} />
          <DialogCell label="No icon" withIcon={false} />
          <DialogCell label="No description" withDescription={false} />
          <DialogCell
            label="Title only"
            withIcon={false}
            withDescription={false}
          />
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h4 className="caption-02-medium text-foreground-muted uppercase">
          Destructive
        </h4>
        <div className="flex flex-wrap gap-3">
          <DialogCell label="Destructive" look="destructive" />
        </div>
      </section>
    </div>
  ),
};

// ── Individual examples ──────────────────────────────────────────────────────

/** Basic dialog — the default look (`DiamondsFour` icon + primary confirm) with the default close X. */
export const Basic: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DialogCell label="Open basic dialog" />,
};

/**
 * Non-dismissable — Escape and backdrop clicks do NOT close it, and the close X
 * is hidden (`showClose={false}`) so the footer buttons are the only exit.
 */
export const NonDismissable: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Dialog.Root dismissable={false}>
      <Dialog.Trigger asChild>
        <Button>Open non-dismissable</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header
          icon={<DiamondsFourIcon />}
          title="Confirm your choice"
          description="You must choose an option — Escape and backdrop are disabled."
          showClose={false}
        />
        <Dialog.Body>
          <p className="body-03 text-foreground-muted">
            This dialog can only be closed through an explicit action below.
          </p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variation="secondary">Decline</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variation="primary">Accept</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

/** Form-in-body — inputs live in the flexible body slot (the "content varies" case). */
export const FormInBody: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header
          icon={<DiamondsFourIcon />}
          title="Edit profile"
          description="Update your details and save."
        />
        <Dialog.Body>
          <div className="flex flex-col gap-4">
            <Input label="Full name" placeholder="Ada Lovelace" />
            <Input label="Email" placeholder="ada@example.com" />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variation="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variation="primary">Save changes</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

/** Controlled — the parent owns `open`; the dialog reflects it. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open (controlled)</Button>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Content>
            <Dialog.Header
              icon={<DiamondsFourIcon />}
              title="Controlled dialog"
              description="Open state is owned by the parent component."
            />
            <Dialog.Body>
              <p className="body-03 text-foreground-muted">
                No trigger is rendered — the button above drives `open`.
              </p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variation="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  },
};
