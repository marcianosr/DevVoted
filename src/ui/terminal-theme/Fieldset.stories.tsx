import type { Meta, StoryObj } from "@storybook/react";

import { AvatarChip } from "./AvatarChip.ui";
import { Fieldset } from "./Fieldset.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Fieldset> = {
	component: Fieldset,
	title: "Terminal/Fieldset",
	decorators: [
		(Story) => (
			<div className="max-w-xs p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Fieldset>;

export const Plain: Story = {
	args: {
		legend: "deepest",
		children: <Text>gate 10 · poll 2</Text>,
	},
};

export const StandoutBox: Story = {
	args: {
		legend: "against the room",
		children: (
			<>
				<span className="flex items-center gap-2">
					<AvatarChip name="Lisa Boekesteijn" />
					<Text size="title" className="font-bold">
						Lisa
					</Text>
				</span>
				<Text size="caption" tone="muted">
					right on poll 2 · 22% were
				</Text>
			</>
		),
	},
};
