import type { Meta, StoryObj } from "@storybook/react";

import { Change } from "./Change.ui";

const meta: Meta<typeof Change> = {
	component: Change,
	title: "Terminal/Change",
	decorators: [
		(Story) => (
			<div className="bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Change>;

export const Version: Story = { args: { from: "v1", to: "v2" } };

export const Multiplier: Story = { args: { from: "×1.75", to: "×2" } };

export const Storage: Story = { args: { from: "+8 KB", to: "+16 KB" } };
