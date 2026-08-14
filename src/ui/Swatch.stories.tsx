import type { Meta, StoryObj } from "@storybook/react";

import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Swatch } from "./Swatch.component";

const meta: Meta<typeof Swatch> = {
	component: Swatch,
	title: "UI/Swatch",
	decorators: [
		(Story) => (
			<div {...swatchTheme("cascade")}>
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Swatch>;

export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };
export const ExtraLarge: Story = { args: { size: "xl" } };
