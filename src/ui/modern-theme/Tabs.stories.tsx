import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, type TabItem } from "./Tabs.ui";

const meta: Meta<typeof Tabs> = {
	component: Tabs,
	title: "Modern/Tabs",
	decorators: [
		(Story) => (
			<div className="max-w-3xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const ITEMS: readonly TabItem[] = [
	{ id: "polls", label: "Polls", count: "23/418" },
	{ id: "configs", label: "Configs", count: "12/30" },
	{ id: "swatches", label: "Swatches", count: "1/13" },
	{ id: "audits", label: "Audits", count: "0/11" },
	{ id: "gates", label: "Gates", count: "1/13" },
];

const Browsing = () => {
	const [activeId, setActiveId] = useState("gates");

	return (
		<Tabs
			items={ITEMS}
			activeId={activeId}
			onSelect={setActiveId}
			label="Collection"
		/>
	);
};

export const Counted: Story = { render: () => <Browsing /> };

export const Uncounted: Story = {
	args: {
		items: [
			{ id: "all", label: "All" },
			{ id: "mine", label: "Mine" },
		],
		activeId: "all",
		onSelect: () => {},
		label: "Filter",
	},
};
