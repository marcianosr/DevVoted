import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.ui";
import { ProfileCard } from "./ProfileCard.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof ProfileCard> = {
	component: ProfileCard,
	title: "Kanto/ProfileCard",
	args: { name: "marciano_schildmeijer" },
	render: (args) => (
		<Screen theme="cerulean" width="wide" ground="bare">
			<ProfileCard {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof ProfileCard>;

const BORDER = "/borders/border-ts-lavender.svg";
const PHOTO = "/editors/misty.png";

const EDIT = <Button size="sm" tone="ambient" label="edit profile" />;

export const NoTitleYet: Story = {
	args: { borderUrl: BORDER, trailing: EDIT },
};

export const OneTitle: Story = {
	args: { borderUrl: BORDER, titles: ["Git Maintainer"], trailing: EDIT },
};

export const ThreeTitles: Story = {
	args: {
		borderUrl: BORDER,
		titles: ["Git Maintainer", "First Ascent", "Summit"],
		trailing: EDIT,
	},
};

export const WithPhoto: Story = {
	args: {
		name: "Misty",
		handle: "misty",
		photoUrl: PHOTO,
		borderUrl: BORDER,
		titles: ["Completer"],
	},
};

export const NoPhotoNoBorder: Story = {
	args: { name: "Brock", titles: ["Flawless"] },
};

export const Yours: Story = {
	args: {
		borderUrl: BORDER,
		titles: ["Git Maintainer"],
		you: true,
		trailing: EDIT,
	},
};

export const AsALink: Story = {
	args: {
		name: "Sabrina",
		handle: "sabrina",
		photoUrl: PHOTO,
		borderUrl: BORDER,
		titles: ["Summit"],
		href: "/profile/sabrina",
	},
};
