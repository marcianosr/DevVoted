import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Tabs } from "./Tabs.ui";

const meta: Meta<typeof Tabs> = {
	component: Tabs,
	title: "UI/Tabs",
	decorators: [
		(Story) => (
			<div className="bg-black p-6">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Interactive = () => {
	const [active, setActive] = useState("polls");
	return (
		<Tabs
			tabs={[
				{ id: "polls", label: "Polls", count: "124/418" },
				{ id: "configs", label: "Configs", count: "24" },
			]}
			activeId={active}
			onSelect={setActive}
		/>
	);
};

export const Default: Story = { render: () => <Interactive /> };
