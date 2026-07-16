import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook runs on the nextjs-vite (Vite) framework. Fonts load via the
 * portable `@fontsource` default (`src/fonts.css`, ADR-0008) imported in
 * preview.css — the preview proves Archivo / Chakra Petch resolve through the
 * token stack exactly as they would in a consuming app.
 * Local authoring tool only — never a CI gate (see CHANGELOG 2026-07-02).
 */
const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../../icons/src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs", // autodocs pages per component
    "@storybook/addon-themes", // light/dark toolbar → `.light`/`.dark` on <html>
    "@storybook/addon-designs", // "Design" tab embedding the Figma component node
    "storybook-addon-pseudo-states", // force :hover/:focus-visible/:active in stories
  ],
  framework: { name: "@storybook/nextjs-vite", options: {} },
  async viteFinal(viteConfig) {
    // Tailwind v4 over the token layer (same pipeline as the apps).
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
