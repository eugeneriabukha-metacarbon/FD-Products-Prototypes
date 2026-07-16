import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DiamondsFourIcon } from "@phosphor-icons/react";

import { Button } from "../button";
import { Panel } from "./Panel";

/**
 * Compound static `Panel` (Figma `Panel`, node `5041:4303`). Panel is the
 * non-modal sibling of `Dialog` — a plain flow card (no portal, no overlay,
 * no focus trap, no Escape/backdrop dismissal). It shares the same Header /
 * Body / Footer composition shape as Dialog, but the header icon sits
 * inline-left of the title (not absolute) and the close X lives in the
 * header row's flow rather than pinned to the card corner.
 */
const FIGMA_PANEL =
  "https://www.figma.com/design/6knFnontvieC6jrpqc6Tbt/FD-Products-Styleguide---UI-Kit--Internal-?node-id=5041-4303";

const meta = {
  title: "Surfaces/Panel",
  component: Panel.Root,
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_PANEL },
  },
} satisfies Meta<typeof Panel.Root>;

export default meta;

// ── Playground ───────────────────────────────────────────────────────────────

/**
 * Toggle the header's optional pieces — icon, description, close X — from the
 * controls panel. Body and footer are fixed sample content.
 */
export const Playground: StoryObj<{
  withIcon: boolean;
  withDescription: boolean;
  showClose: boolean;
}> = {
  args: { withIcon: false, withDescription: true, showClose: true },
  render: (args) => (
    <Panel.Root>
      <Panel.Header
        icon={args.withIcon ? <DiamondsFourIcon /> : undefined}
        title="Title"
        description={args.withDescription ? "Description." : undefined}
        showClose={args.showClose}
        onClose={() => {}}
      />
      <Panel.Body>
        <p className="body-03 text-card-foreground-muted">
          Panel body content.
        </p>
      </Panel.Body>
      <Panel.Footer>
        <Button onClick={() => {}}>Button</Button>
        <Button variation="secondary" onClick={() => {}}>
          Button
        </Button>
      </Panel.Footer>
    </Panel.Root>
  ),
};

// ── Matrix ───────────────────────────────────────────────────────────────────

/**
 * Mirrors the Figma header variant set: icon × description × close, plus a
 * header-only composition (no body/footer).
 */
export const Matrix: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {/* default: no icon, description, close */}
      <Panel.Root>
        <Panel.Header
          title="Title"
          description="Description."
          onClose={() => {}}
        />
        <Panel.Body>
          <p className="body-03 text-card-foreground-muted">Body content.</p>
        </Panel.Body>
        <Panel.Footer>
          <Button onClick={() => {}}>Button</Button>
          <Button variation="secondary" onClick={() => {}}>
            Button
          </Button>
        </Panel.Footer>
      </Panel.Root>

      {/* with icon */}
      <Panel.Root>
        <Panel.Header
          icon={<DiamondsFourIcon />}
          title="Title"
          description="Description."
          onClose={() => {}}
        />
        <Panel.Body>
          <p className="body-03 text-card-foreground-muted">Body content.</p>
        </Panel.Body>
        <Panel.Footer>
          <Button onClick={() => {}}>Button</Button>
          <Button variation="secondary" onClick={() => {}}>
            Button
          </Button>
        </Panel.Footer>
      </Panel.Root>

      {/* no description */}
      <Panel.Root>
        <Panel.Header title="Title" onClose={() => {}} />
        <Panel.Body>
          <p className="body-03 text-card-foreground-muted">Body content.</p>
        </Panel.Body>
        <Panel.Footer>
          <Button onClick={() => {}}>Button</Button>
        </Panel.Footer>
      </Panel.Root>

      {/* no close */}
      <Panel.Root>
        <Panel.Header
          title="Title"
          description="Description."
          showClose={false}
        />
        <Panel.Body>
          <p className="body-03 text-card-foreground-muted">Body content.</p>
        </Panel.Body>
      </Panel.Root>

      {/* header only */}
      <Panel.Root>
        <Panel.Header
          icon={<DiamondsFourIcon />}
          title="Title"
          description="Description."
          onClose={() => {}}
        />
      </Panel.Root>
    </div>
  ),
};
