import type { Meta, StoryObj } from "@storybook/react";

import { LookSaveBar } from "~/modules/account/profile/presentation/LookSaveBar.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const meta: Meta<typeof LookSaveBar> = {
	component: LookSaveBar,
	title: "Account/LookSaveBar",
	args: { canSave: true, onSave: noop, onDiscard: noop },
	render: (args) => (
		<Screen theme="cerulean">
			<LookSaveBar {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof LookSaveBar>;

export const Unsaved: Story = {};

export const Saving: Story = { args: { canSave: false } };

export const Refused: Story = {
	args: { error: "Cannot wear a border you don't own" },
};
