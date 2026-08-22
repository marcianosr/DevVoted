import type { Meta, StoryObj } from "@storybook/react";

import { Legend } from "./Legend.ui";

// Game-design reason: a colour-coded tier is only readable once, so the pipeline
// carries its own key rather than asking the player to remember four hues.
const meta: Meta<typeof Legend> = {
	component: Legend,
	title: "Modern/Legend",
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Legend>;

export const FourTiers: Story = {};
