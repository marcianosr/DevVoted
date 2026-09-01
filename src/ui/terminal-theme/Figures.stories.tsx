import type { Meta, StoryObj } from "@storybook/react";

import { Figures } from "./Figures.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Figures> = {
	component: Figures,
	title: "Terminal/Figures",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Text tone="muted">
					<Story />
				</Text>
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Figures>;

export const Multiplier: Story = { args: { text: "JS polls ×1.25" } };

export const Gain: Story = { args: { text: "+8 KB an answer · 96 of 320" } };

export const Loss: Story = { args: { text: "−3.8% · streak lost" } };

export const Faded: Story = {
	args: { text: "×2.5 → ×2.0 · gone in 2 clears" },
};

export const NoFigures: Story = {
	args: { text: "cross out a wrong answer · fee doubles" },
};
