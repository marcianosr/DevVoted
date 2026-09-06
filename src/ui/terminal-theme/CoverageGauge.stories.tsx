import type { Meta, StoryObj } from "@storybook/react";

import { CoverageGauge } from "./CoverageGauge.ui";

const meta: Meta<typeof CoverageGauge> = {
	component: CoverageGauge,
	title: "Terminal/CoverageGauge",
	decorators: [
		(Story) => (
			<div data-swatch-theme="cascade" className="flex h-64 items-stretch p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof CoverageGauge>;

/** Nothing picked yet: the gate asks 10%, the run holds 4.1%. */
export const Standing: Story = {
	args: { held: 4.1, demand: 10 },
};

/** An answer is on the table. The dashed block is what a correct one pays. */
export const Picked: Story = {
	args: { held: 4.1, demand: 10, pending: 2 },
};

/** The offer runs past the demand, so the track opens to hold it and a mark
    appears where the gate's 10% falls. The ghost crossing that mark is the tell
    that this answer clears the gate on its own. */
export const PickClearsTheGate: Story = {
	args: { held: 8.4, demand: 10, pending: 4.2 },
};

export const Untouched: Story = {
	args: { held: 0, demand: 25, pending: 3.5 },
};

/** Overextended: gate 0 asks 3% and the run holds 5.3%. The mark is the only
    thing that says how far past the line the surplus went. */
export const PastTheDemand: Story = {
	args: { held: 5.3, demand: 3 },
};

/** A correct answer settles in: the slice above the standing fill grows up off
    it, ending at the new total. */
export const Earned: Story = {
	args: { held: 6.1, demand: 10, earned: 2 },
};

/** A miss: the slice sits above the level the run drops back to, and drains
    onto it. */
export const Lost: Story = {
	args: { held: 4.1, demand: 10, earned: -1.9 },
};
