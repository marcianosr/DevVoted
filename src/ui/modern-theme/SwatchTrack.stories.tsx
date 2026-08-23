import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { SwatchTrack } from "./SwatchTrack.ui";

const meta: Meta<typeof SwatchTrack> = {
	component: SwatchTrack,
	title: "Modern/SwatchTrack",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof SwatchTrack>;

export const MidRun: Story = { args: { gates: ALL_SWATCHES, cleared: 4 } };

export const FirstGate: Story = { args: { gates: ALL_SWATCHES, cleared: 0 } };

export const Champion: Story = { args: { gates: ALL_SWATCHES, cleared: 12 } };

export const RunOver: Story = {
	args: { gates: ALL_SWATCHES, cleared: 5, atCleared: "locked" },
};

/** A finished climb: past the last gate, so no cell is current. */
export const Won: Story = {
	args: { gates: ALL_SWATCHES, cleared: 13, atCleared: "locked" },
};
