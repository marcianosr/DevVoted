import type { Meta, StoryObj } from "@storybook/react";

import { Ledger } from "./Ledger.ui";

const meta: Meta<typeof Ledger> = {
	component: Ledger,
	title: "Terminal/Ledger",
	decorators: [
		(Story) => (
			<div className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Ledger>;

export const Cleared: Story = {
	args: {
		rows: [
			{ name: "gate cleared", figure: "+160 KB" },
			{ name: "4 correct answers", figure: "+32 KB" },
			{
				name: "IndexedDB",
				chip: { slots: 2, version: 2, maxVersion: 4 },
				figure: "+32 KB",
			},
			{
				name: "Unit Tests",
				chip: { slots: 1, version: 1, maxVersion: 5 },
				figure: "+32 KB",
			},
			{ name: "storage plan · 768 KB", figure: "−16 KB" },
			{ name: "balance", value: "310 KB" },
		],
	},
};

export const Held: Story = {
	args: {
		rows: [
			{ name: "gate cleared", value: "not paid", muted: true },
			{ name: "2 correct answers", figure: "+16 KB" },
			{ name: "storage plan · 768 KB", figure: "−16 KB" },
			{ name: "balance", value: "102 KB" },
		],
	},
};
