import type { Meta, StoryObj } from "@storybook/react";

import { SlotTrack } from "./SlotTrack.ui";

const meta: Meta<typeof SlotTrack> = {
	component: SlotTrack,
	title: "Terminal/SlotTrack",
	decorators: [
		(Story) => (
			<div className="w-[700px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof SlotTrack>;

export const ShopBuild: Story = {
	args: {
		numbered: true,
		slots: 6,
		segments: [
			{ family: "focus", slots: 1 },
			{ family: "defense", slots: 1 },
			{ family: "economy", slots: 2 },
		],
	},
};

export const SittingOutGap: Story = {
	args: {
		slots: 6,
		segments: [
			{ family: "focus", slots: 1 },
			{ slots: 1 },
			{ family: "risk", slots: 2 },
			{ family: "defense", slots: 1 },
		],
	},
};

export const Empty: Story = { args: { slots: 4, segments: [] } };
