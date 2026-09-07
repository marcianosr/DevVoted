import type { Meta, StoryObj } from "@storybook/react";

import { AvatarChip } from "./AvatarChip.ui";

const meta: Meta<typeof AvatarChip> = {
	component: AvatarChip,
	title: "Terminal/AvatarChip",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof AvatarChip>;

export const Initials: Story = {
	args: { name: "Lisa Boekesteijn" },
};

export const Photo: Story = {
	args: { name: "Matthijs", photoUrl: "https://github.com/matthijsgroen.png" },
};

export const Bordered: Story = {
	args: {
		name: "Matthijs",
		photoUrl: "https://github.com/matthijsgroen.png",
		borderUrl: "/borders/border-react-celadon.svg",
	},
};

export const You: Story = {
	args: { name: "you", you: true },
};

export const Fallen: Story = {
	args: { name: "Koga", dimmed: true },
};

export const PersonalBestGhost: Story = {
	args: { name: "your best", ghost: true },
};

export const SmallStack: Story = {
	render: () => (
		<span className="flex gap-1">
			<AvatarChip size="sm" name="Owen Vink" />
			<AvatarChip size="sm" name="Lisa Boekesteijn" />
			<AvatarChip size="sm" name="you" you />
		</span>
	),
};
