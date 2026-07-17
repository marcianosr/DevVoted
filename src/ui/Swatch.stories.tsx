import type { Meta, StoryObj } from "@storybook/react";

import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Swatch } from "./Swatch.component";

const meta: Meta<typeof Swatch> = {
	component: Swatch,
	title: "UI/Swatch",
	decorators: [
		(Story) => (
			<div {...categoryTheme("js")}>
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
