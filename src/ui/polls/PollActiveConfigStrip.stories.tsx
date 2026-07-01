import type { Meta, StoryObj } from "@storybook/react";

import { PollActiveConfigStrip } from "./PollActiveConfigStrip.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollActiveConfigStrip> = {
	component: PollActiveConfigStrip,
	title: "Polls/PollActiveConfigStrip",
	decorators: [withCategoryTheme("js")],
};
export default meta;

type Story = StoryObj<typeof PollActiveConfigStrip>;

export const WithConfigs: Story = {
	args: {
		configs: [
			{ id: "prettier", name: "Prettier", rarity: "common" },
			{ id: "webpack", name: "Webpack", rarity: "rare" },
			{ id: "babel", name: "Babel", rarity: "legendary" },
		],
	},
};

export const Empty: Story = {
	args: {
		configs: [],
	},
};
