import type { Meta, StoryObj } from "@storybook/react";

import { Meter } from "./Meter.ui";

// Game-design reason: every quantity the run spends or banks reads as a length
// of bar — storage against its cap, coverage toward a slot, what a finished run
// carried out. This is the rail all of them are drawn on, so its proportions
// and its overflow behaviour are worth eyeballing in one place.
const meta: Meta<typeof Meter> = {
	component: Meter,
	title: "UI/Meter",
	decorators: [
		(Story) => (
			<div className="w-56">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Meter>;

export const SingleFill: Story = {
	args: {
		cap: 512,
		label: "storage used",
		segments: [{ value: 184, className: "rounded-full bg-zinc-400" }],
	},
};

/** GainBar's shape: what was already held, then what this gate added. */
export const HeldPlusGain: Story = {
	args: {
		cap: 512,
		label: "storage",
		value: 208,
		segments: [
			{ value: 104, className: "bg-zinc-500" },
			{ value: 104, className: "rounded-r-full bg-viridian" },
		],
	},
};

/** MetaStorageBar's shape: a taller, squarer rail in the banking colour. */
export const Banked: Story = {
	args: {
		cap: 240,
		segments: [{ value: 96, className: "rounded bg-saffron" }],
		trackClassName: "h-2 rounded",
	},
};

export const Empty: Story = {
	args: {
		cap: 512,
		segments: [{ value: 0, className: "rounded-full bg-zinc-400" }],
	},
};

/** Overshooting the cap fills the rail rather than running past its end. */
export const OverTheCap: Story = {
	args: {
		cap: 512,
		segments: [{ value: 900, className: "rounded-full bg-cinnabar" }],
	},
};
