import type { Meta, StoryObj } from "@storybook/react";

import { SplitBar } from "./SplitBar.ui";

const meta: Meta<typeof SplitBar> = {
	component: SplitBar,
	title: "Terminal/SplitBar",
	decorators: [
		(Story) => (
			<div className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof SplitBar>;

export const Archive: Story = {
	args: {
		kept: { label: "48 KB kept", percent: 22 },
		lost: { label: "174 KB lost" },
	},
};
