import type { Meta, StoryObj } from "@storybook/react";

import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";

const meta: Meta<typeof ConfigdexPanel> = {
	component: ConfigdexPanel,
	title: "Dex/ConfigdexPanel",
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-950 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof ConfigdexPanel>;

export const Default: Story = {};
