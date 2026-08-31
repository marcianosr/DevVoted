import type { Meta, StoryObj } from "@storybook/react";

import { PlanRow } from "./PlanRow.ui";

const meta: Meta<typeof PlanRow> = {
	component: PlanRow,
	title: "Modern/PlanRow",
	decorators: [
		(Story) => (
			<div data-gate-theme="rainbow" className="max-w-lg p-4">
				<Story />
			</div>
		),
	],
	args: {
		label: "1 MB",
		terms: "32 KB a gate",
		held: false,
		pick: { onUse: () => {} },
	},
};
export default meta;

type Story = StoryObj<typeof PlanRow>;

export const OnOffer: Story = {};

export const Held: Story = { args: { held: true } };

export const TheFreeCap: Story = {
	args: { label: "512 KB", terms: "free", free: true, held: true },
};

export const ADowngradeThatBurns: Story = {
	args: { label: "512 KB", terms: "free", free: true, warns: "burns 240 KB" },
};

export const CannotSwitchToIt: Story = {
	args: { pick: { disabled: true, onUse: () => {} } },
};
