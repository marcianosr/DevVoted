import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Paragraph } from "~/ui/typography/Paragraph.component";

import { DexScreen } from "~/modules/collection/dex/presentation/DexScreen.ui";

const meta: Meta<typeof DexScreen> = {
	component: DexScreen,
	title: "Dex/DexScreen",
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-950">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof DexScreen>;

const Interactive = () => {
	const [tab, setTab] = useState("polls");
	return (
		<DexScreen
			tabs={[
				{ id: "polls", label: "Polls", count: "124/418" },
				{ id: "configs", label: "Configs", count: "24" },
			]}
			activeTab={tab}
			onSelectTab={setTab}
		>
			<Paragraph tone="muted">
				{tab === "polls" ? "Polls tab body" : "Configs tab body"}
			</Paragraph>
		</DexScreen>
	);
};

export const Default: Story = { render: () => <Interactive /> };
