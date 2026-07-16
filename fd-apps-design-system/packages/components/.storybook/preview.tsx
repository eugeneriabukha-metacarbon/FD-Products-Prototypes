import * as React from "react";
import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";

// The canonical app-root wiring (README): fonts + token CSS, both loaded as
// CSS entries (see preview.css) — the same shape a real app uses.
import "./preview.css";

/**
 * App-root wrapper: tokened background/foreground. Font variables are defined
 * globally on `:root` by `fonts.css` (imported in preview.css), so no wrapper
 * class is needed for them. Theme switching itself is handled by addon-themes,
 * which puts the `light`/`dark` class on <html> — the same mechanism apps use,
 * so no story needs `dark:` variants and portalled content inherits the theme too.
 */
const withAppRoot: Decorator = (Story) => (
  <div className={`bg-background text-foreground font-sans min-h-screen p-8`}>
    <Story />
  </div>
);

const preview: Preview = {
  parameters: {
    // Background comes from the token layer (`bg-background`), not the addon.
    backgrounds: { disable: true },
    layout: "fullscreen",
    // Sidebar order: pin `Base` to the top; `*` keeps every other group in its
    // default (glob) order after it.
    options: {
      storySort: { order: ["Base", "*"] },
    },
  },
  decorators: [
    withAppRoot,
    withThemeByClassName({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
