import type { Meta, StoryObj } from "@storybook/react";

import { Contribution } from "./Contribution.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof Contribution> = {
	component: Contribution,
	title: "Kanto/Contribution",
	args: {
		answered: 412,
		authored: { role: "Poll editor", published: 12, answers: 1842 },
	},
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
	args: { answered: 30, authored: { published: 1, answers: 1 } },
};

export const Player: Story = {
	args: { answered: 30, authored: undefined },
};
