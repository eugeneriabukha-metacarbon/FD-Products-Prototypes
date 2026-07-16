import { describe, it, expect } from "vitest";

import { scrollbarVariants } from "./scrollbar";

describe("scrollbarVariants", () => {
  it("styles the WebKit thumb as a 4px pill in the muted card token", () => {
    const cls = scrollbarVariants();
    expect(cls).toContain("[&::-webkit-scrollbar]:w-3");
    expect(cls).toContain("[&::-webkit-scrollbar-thumb]:rounded-full");
    // 4px-in-12px trick: transparent border + content-box clip.
    expect(cls).toContain("[&::-webkit-scrollbar-thumb]:border-4");
    expect(cls).toContain("[&::-webkit-scrollbar-thumb]:border-transparent");
    expect(cls).toContain("[&::-webkit-scrollbar-thumb]:bg-clip-content");
    expect(cls).toContain(
      "[&::-webkit-scrollbar-thumb]:bg-card-foreground-muted",
    );
  });

  it("sets the Firefox thin themed scrollbar over a transparent track", () => {
    const cls = scrollbarVariants();
    expect(cls).toContain("[scrollbar-width:thin]");
    expect(cls).toContain(
      "[scrollbar-color:var(--color-card-foreground-muted)_transparent]",
    );
  });

  it("adds the leading track stroke by default, omits it when stroke=false", () => {
    expect(scrollbarVariants()).toContain(
      "[&::-webkit-scrollbar-track]:border-card-border",
    );
    expect(scrollbarVariants({ stroke: false })).not.toContain(
      "[&::-webkit-scrollbar-track]:border-card-border",
    );
  });
});
