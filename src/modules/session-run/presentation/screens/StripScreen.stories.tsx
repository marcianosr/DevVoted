import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster";
import { StripScreen } from "./StripScreen.ui";

const meta: Meta<typeof StripScreen> = {
	component: StripScreen,
	title: "Session Run/Screens/Strip",
};
export default meta;

type Story = StoryObj<typeof StripScreen>;

export const Default: Story = {
	args: {
		stripsRemaining: 2,
		configs: [CONFIGS.js, CONFIGS.copilot, CONFIGS.deployFriday],
		onStrip: () => {},
	},
};
