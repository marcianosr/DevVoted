import type { Meta, StoryObj } from "@storybook/react";

import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { StackPicker } from "~/modules/run/config/presentation/StackPicker.ui";

const meta: Meta<typeof StackPicker> = {
	component: StackPicker,
	title: "Run/StackPicker",
};
export default meta;

type Story = StoryObj<typeof StackPicker>;

export const Unpicked: Story = {
	args: { stacks: STARTER_STACKS, onPick: () => {} },
};

export const ReactSelected: Story = {
	args: {
		stacks: STARTER_STACKS,
		selectedStackId: "ship-it",
		onPick: () => {},
	},
};

export const WithCustomBuildRow: Story = {
	args: { stacks: STARTER_STACKS, onPick: () => {}, onCustomBuild: () => {} },
};
