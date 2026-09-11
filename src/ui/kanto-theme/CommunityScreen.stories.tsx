import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoCommunity,
	kantoCommunityBeforePolls,
	kantoCommunityFirstClimb,
} from "~/test/kantoCommunity.factory";

import { CommunityScreen } from "./CommunityScreen.ui";

const meta: Meta<typeof CommunityScreen> = {
	component: CommunityScreen,
	title: "Kanto/Screens/CommunityScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof CommunityScreen>;

export const AfterTheFive: Story = {
	render: () => <CommunityScreen {...kantoCommunity()} />,
};

export const BeforeTheFive: Story = {
	render: () => <CommunityScreen {...kantoCommunityBeforePolls()} />,
};

export const FirstClimb: Story = {
	render: () => <CommunityScreen {...kantoCommunityFirstClimb()} />,
};
