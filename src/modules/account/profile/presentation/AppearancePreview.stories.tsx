import type { Meta, StoryObj } from "@storybook/react";

import {
	AppearancePreview,
	type AppearancePreviewProps,
} from "~/modules/account/profile/presentation/AppearancePreview.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const NAME = "misty_cerulean";
const WORN_BORDER = "/borders/00b9a62e09a1e452d6840170849e8ac06f6d3ef5.png";
const TRIED_BORDER = "/borders/0a006140df75df78a40df5081313d0856a52069f.png";

const wearing = (borderUrl: string): AppearancePreviewProps => ({
	card: {
		name: NAME,
		handle: "misty",
		rank: "'Long Polling'",
		titles: ["Git GOAT", "Summit"],
		borderUrl,
	},
	byline: {
		handle: "misty",
		title: "Git GOAT",
		size: "sm",
		rule: false,
		borderUrl,
	},
	climber: { name: NAME, title: "Git GOAT", borderUrl },
});

const meta: Meta<typeof AppearancePreview> = {
	component: AppearancePreview,
	title: "Account/AppearancePreview",
	render: (args) => (
		<Screen theme="fuchsia">
			<AppearancePreview {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof AppearancePreview>;

export const Worn: Story = { args: wearing(WORN_BORDER) };

export const TryingOn: Story = {
	args: { ...wearing(TRIED_BORDER), tryingOn: "Merge Conflict" },
};

export const Bare: Story = {
	args: {
		card: { name: "brock", titles: [] },
		byline: { handle: "brock", size: "sm", rule: false },
		climber: { name: "brock" },
	},
};
