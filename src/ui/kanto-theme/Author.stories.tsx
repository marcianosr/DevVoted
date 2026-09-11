import type { Meta, StoryObj } from "@storybook/react";

import { Author } from "./Author.ui";
import { Screen } from "./Screen.ui";

const BORDER = "/borders/border-grass.png";

const meta: Meta<typeof Author> = {
	component: Author,
	title: "Kanto/Author",
	args: { handle: "matthijsgroen", title: "Poll editor", borderUrl: BORDER },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Author {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Author>;

export const Default: Story = {};

export const NoBorderEquipped: Story = { args: { borderUrl: undefined } };

export const NoTitle: Story = { args: { title: undefined } };

export const AvatarFallback: Story = {
	args: { handle: "not-a-real-github-account-xyzzy" },
};

export const LongTitle: Story = {
	args: { title: "Poll editor and Kanto Pokédex maintainer" },
};
