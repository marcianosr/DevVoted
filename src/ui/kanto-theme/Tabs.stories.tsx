import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { Tabs } from "./Tabs.ui";

const noop = () => {};

const DEX = [
	{ id: "polls", label: "polls" },
	{ id: "configs", label: "configs" },
	{ id: "runs", label: "runs" },
];

const SHOP = [
	{ id: "registry", label: "Registry", count: "5" },
	{ id: "build", label: "Build", count: "8/8" },
	{ id: "services", label: "Services", count: "3" },
	{ id: "desk", label: "Desk" },
];

const meta: Meta<typeof Tabs> = {
	component: Tabs,
	title: "Kanto/Tabs",
	argTypes: { look: { control: "inline-radio", options: ["folder", "pill"] } },
	args: { label: "Dex", items: DEX, activeId: "polls", onSelect: noop },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Tabs {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Folder: Story = {};

export const PillsWithCounts: Story = {
	args: {
		label: "Shop panels",
		items: SHOP,
		activeId: "registry",
		look: "pill",
	},
};
