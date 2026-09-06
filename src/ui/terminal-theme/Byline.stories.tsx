import type { Meta, StoryObj } from "@storybook/react";

import { Byline } from "./Byline.ui";

const meta: Meta<typeof Byline> = {
	component: Byline,
	title: "Terminal/Byline",
	decorators: [
		(Story) => (
			<div className="w-[520px] bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Byline>;

const AVATAR = "https://github.com/matthijsgroen.png";
const BORDER = "/borders/00b9a62e09a1e452d6840170849e8ac06f6d3ef5.png";

export const Credited: Story = {
	args: { handle: "@matthijsgroen", avatarUrl: AVATAR },
};

export const Titled: Story = {
	args: { handle: "@matthijsgroen", avatarUrl: AVATAR, title: "Poll editor" },
};

export const Framed: Story = {
	args: {
		handle: "@matthijsgroen",
		avatarUrl: AVATAR,
		borderUrl: BORDER,
		title: "Poll editor",
	},
};

/** No GitHub photo on file: the handle's first letter stands in. */
export const NoPhoto: Story = { args: { handle: "@matthijsgroen" } };
