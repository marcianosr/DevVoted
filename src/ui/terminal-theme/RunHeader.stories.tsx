import type { Meta, StoryObj } from "@storybook/react";

import { RunHeader } from "./RunHeader.ui";
import type { TrackSwatch } from "./SwatchTrack.ui";

const climb: readonly TrackSwatch[] = [
	{ theme: "pallet", state: "earned" },
	{ theme: "boulder", state: "earned" },
	{ theme: "cascade", state: "earned" },
	{ theme: "volcano", state: "earned" },
	{ theme: "lavender", state: "current" },
	...Array.from({ length: 8 }, () => ({ state: "locked" }) as const),
];

const meta: Meta<typeof RunHeader> = {
	component: RunHeader,
	title: "Terminal/RunHeader",
	decorators: [
		(Story) => (
			<div data-swatch-theme="lavender" className="w-[700px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof RunHeader>;

export const MidGate: Story = {
	args: {
		title: "Gate 4 · Lavender",
		swatch: "lavender",
		balance: "102 KB balance",
		swatches: climb,
		gateLabel: "gate 4 / 12",
		coverage: { label: "coverage", reading: "28 / 60%", percent: 46 },
	},
};
