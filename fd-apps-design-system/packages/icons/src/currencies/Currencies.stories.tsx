import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconGrid } from "../lib/IconGrid";
import * as icons from "./index";

const meta = {
  title: "Icons/Currencies",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

export const Gallery: StoryObj = {
  render: () => <IconGrid icons={icons as never} />,
};
