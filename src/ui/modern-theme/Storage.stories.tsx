import type { Meta, StoryObj } from "@storybook/react";

import { Storage } from "./Storage.ui";

// Game-design reason: storage is the run's wallet and its ceiling at once, so the
// bar has to say how much room is left, not just how much has been banked.
const meta: Meta<typeof Storage> = {
	component: Storage,
	title: "Modern/Storage",
	args: { plan: "Free tier", used: 0, cap: 512 },
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="bg-surface p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Storage>;

export const Empty: Story = {};

export const PartlyFull: Story = { args: { used: 184, cap: 768 } };

/** At the cap the bar is the warning — the next reward has nowhere to land. */
export const Full: Story = { args: { plan: "Pro tier", used: 768, cap: 768 } };
