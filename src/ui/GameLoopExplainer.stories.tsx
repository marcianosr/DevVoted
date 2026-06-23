import type { Meta, StoryObj } from "@storybook/react";
import { GameLoopExplainer } from "./GameLoopExplainer.component";

const meta: Meta<typeof GameLoopExplainer> = {
	component: GameLoopExplainer,
	title: "UI/GameLoopExplainer",
};
export default meta;

type Story = StoryObj<typeof GameLoopExplainer>;

export const Default: Story = {};
