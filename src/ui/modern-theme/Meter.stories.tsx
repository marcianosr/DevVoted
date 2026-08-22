import type { Meta, StoryObj } from "@storybook/react";

import { Meter } from "./Meter.ui";

// Game-design reason: coverage is the run's score, and what the current build is
// projected to add is the decision the shop is asking about — both belong on one
// bar, or the player has to do the arithmetic themselves.
const meta: Meta<typeof Meter> = {
	component: Meter,
	title: "Modern/Meter",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-72">
				<Story />
			</div>
		),
	],
	args: { max: 100, label: "Coverage" },
};
export default meta;

type Story = StoryObj<typeof Meter>;

export const HeldAndProjected: Story = {
	args: { held: 38.6, projected: 23.1 },
};

export const NothingProjected: Story = { args: { held: 38.6 } };

export const Empty: Story = { args: { held: 0, projected: 0 } };

/** A projection that would overshoot is clamped, so the two slices never
 * overflow the track. */
export const Overshooting: Story = { args: { held: 80, projected: 40 } };

export const Full: Story = { args: { held: 100 } };
