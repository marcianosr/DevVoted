import type { Meta, StoryObj } from "@storybook/react";

import { PollActiveConfigStrip } from "./PollActiveConfigStrip.ui";
import { withGateTheme } from "./story-utils";

const meta: Meta<typeof PollActiveConfigStrip> = {
	component: PollActiveConfigStrip,
	title: "Polls/PollActiveConfigStrip",
	decorators: [withGateTheme("marsh")],
};
export default meta;

type Story = StoryObj<typeof PollActiveConfigStrip>;

export const WithConfigs: Story = {
	args: {
		configs: [
			{
				id: "prettier",
				name: "Prettier",
				description: "Reveals how many correct answers you have selected.",
				rarity: "common",
			},
			{
				id: "webpack",
				name: "Webpack",
				description: "Bundles two categories so coverage counts for both.",
				rarity: "rare",
			},
			{
				id: "babel",
				name: "Babel",
				description: "Transpiles a wrong answer into a hint before you submit.",
				rarity: "legendary",
			},
		],
	},
};

export const Empty: Story = {
	args: {
		configs: [],
	},
};
