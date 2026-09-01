import type { Meta, StoryObj } from "@storybook/react";

import { Legend } from "./Legend.ui";

const meta: Meta<typeof Legend> = {
	component: Legend,
	title: "Terminal/Legend",
	decorators: [
		(Story) => (
			<div className="max-w-lg bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Legend>;

export const EveryMarker: Story = {
	args: {
		variants: [
			"on",
			"on",
			"on",
			"on",
			"on",
			"on",
			"action",
			"blocked",
			"off",
			"off",
		],
	},
};

export const OnlyWhatIsOnScreen: Story = {
	args: { variants: ["on", "on", "on", "off"] },
};

export const OneState: Story = { args: { variants: ["on", "on"] } };
