import type { Meta, StoryObj } from "@storybook/react";

import { Contribution } from "./Contribution.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof Contribution> = {
	component: Contribution,
	title: "Kanto/Contribution",
	args: { role: "Poll editor", published: 12, answers: 1842 },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Contribution {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Contribution>;

export const Editor: Story = {};

export const PlayerAuthor: Story = {
	args: { role: undefined, published: 1, answers: 1 },
};
