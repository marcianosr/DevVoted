import type { Meta, StoryObj } from "@storybook/react";

import { ExtraSpotRow } from "./ExtraSpotRow.ui";

const meta: Meta<typeof ExtraSpotRow> = {
	component: ExtraSpotRow,
	title: "Modern/ExtraSpotRow",
	decorators: [
		(Story) => (
			<div data-gate-theme="rainbow" className="max-w-lg p-4">
				<Story />
			</div>
		),
	],
	args: {
		label: "+2 spots",
		makes: "makes 10",
		terms: "16 KB a gate",
		held: false,
		pick: { onUse: () => {} },
	},
};
export default meta;

type Story = StoryObj<typeof ExtraSpotRow>;

export const OnOffer: Story = {};

export const Held: Story = { args: { held: true } };

export const NoneAtAll: Story = {
	args: {
		label: "none",
		makes: "makes 8",
		terms: "free",
		settled: true,
		held: true,
	},
};

export const CannotAffordIt: Story = {
	args: { pick: { disabled: true, onUse: () => {} } },
};

export const NotYetSold: Story = {
	args: {
		label: "+3 spots",
		makes: "makes 11",
		terms: "24 KB a gate",
		pick: undefined,
		opensAt: "opens at gate 5",
	},
};
