import type { Meta, StoryObj } from "@storybook/react";

import { Storage } from "./Storage.ui";

const meta: Meta<typeof Storage> = {
	component: Storage,
	title: "Modern/Storage",
	args: { balanceKb: 0 },
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

export const MidRun: Story = { args: { balanceKb: 320 } };

export const Rich: Story = { args: { balanceKb: 2048 } };
