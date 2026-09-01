import type { Meta, StoryObj } from "@storybook/react";

import { Tabs } from "./Tabs.ui";

const noop = () => {};

const meta: Meta<typeof Tabs> = {
	component: Tabs,
	title: "Terminal/Tabs",
	decorators: [
		(Story) => (
			<div className="w-[700px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Dex: Story = {
	args: {
		label: "dex",
		activeId: "configs",
		onSelect: noop,
		items: [
			{ id: "polls", label: "Polls", count: "118/423" },
			{ id: "configs", label: "Configs", count: "22/30" },
			{ id: "audits", label: "Audits", count: "4/11" },
			{ id: "gates", label: "Gates", count: "3/13", redacted: true },
			{ id: "swatches", label: "Swatches", count: "6/13" },
		],
	},
};
