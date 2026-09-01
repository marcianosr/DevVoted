import type { Meta, StoryObj } from "@storybook/react";

import { SwatchTrack, type TrackSwatch } from "./SwatchTrack.ui";

const climb: readonly TrackSwatch[] = [
	{ theme: "pallet", state: "earned" },
	{ theme: "boulder", state: "earned" },
	{ theme: "cascade", state: "earned" },
	{ theme: "volcano", state: "earned" },
	{ theme: "lavender", state: "current" },
	...Array.from({ length: 8 }, () => ({ state: "locked" }) as const),
];

const meta: Meta<typeof SwatchTrack> = {
	component: SwatchTrack,
	title: "Terminal/SwatchTrack",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof SwatchTrack>;

export const Climb: Story = { args: { swatches: climb } };

export const CareerBadges: Story = {
	args: {
		size: "badge",
		swatches: [
			{ theme: "pallet", state: "earned" },
			{ theme: "boulder", state: "earned" },
			{ theme: "cascade", state: "earned" },
			{ theme: "volcano", state: "earned" },
			{ state: "pending" },
			{ state: "pending" },
		],
	},
};

export const EarnedTiles: Story = {
	args: {
		size: "tile",
		swatches: [
			{ theme: "pallet", state: "earned" },
			{ theme: "boulder", state: "earned" },
			{ theme: "cascade", state: "earned" },
			{ theme: "volcano", state: "earned" },
			{ state: "pending" },
		],
	},
};
