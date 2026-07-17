import type { Meta, StoryObj } from "@storybook/react";

import { GameOverScreen } from "./GameOverScreen.ui";

const meta: Meta<typeof GameOverScreen> = {
	component: GameOverScreen,
	title: "Run/Screens/GameOver",
	args: { onClimbAgain: () => {} },
};
export default meta;

type Story = StoryObj<typeof GameOverScreen>;

export const Summited: Story = {
	args: {
		won: true,
		gatesCleared: 5,
		victoryGate: 5,
		coverage: 24,
		storage: 640,
		lootCollected: 320,
	},
};

export const DiedEarly: Story = {
	args: {
		won: false,
		gatesCleared: 2,
		victoryGate: 5,
		coverage: 9,
		storage: 120,
		lootCollected: 60,
	},
};

export const DiedBareBuild: Story = {
	args: {
		won: false,
		gatesCleared: 0,
		victoryGate: 5,
		coverage: 0,
		storage: 0,
		lootCollected: 5,
	},
};
