import type { Meta, StoryObj } from "@storybook/react";

import { GYM_LEADERS } from "~/test/kanto";
import { SummaryDropdown } from "./SummaryDropdown.ui";

const meta: Meta<typeof SummaryDropdown> = {
	component: SummaryDropdown,
	title: "Run/SummaryDropdown",
	// The panel opens to the trigger's left edge — give it room in the canvas.
	decorators: [
		(Story) => (
			<div className="flex justify-end p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof SummaryDropdown>;

// Click the trigger to toggle the panel.
export const Default: Story = {
	args: {
		trigger: (
			<span className="text-sm text-white">
				Badges <span className="text-pewter">3 / 8</span>
			</span>
		),
		children: (
			<ul className="flex flex-col gap-1 text-sm text-white">
				{GYM_LEADERS.slice(0, 3).map((leader) => (
					<li key={leader.name}>
						{leader.badge} — {leader.name}
					</li>
				))}
			</ul>
		),
	},
};

export const WidePanel: Story = {
	args: {
		trigger: <span className="text-sm text-white">Loadout</span>,
		panelClassName: "w-72",
		children: (
			<p className="text-sm text-pewter">
				Free slots host drafted configs; the pipeline runs them at every gate.
			</p>
		),
	},
};
