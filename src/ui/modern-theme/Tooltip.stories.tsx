import type { Meta, StoryObj } from "@storybook/react";

import { Action } from "./Action.ui";
import { Mark } from "./Mark.ui";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

const meta: Meta<typeof Tooltip> = {
	component: Tooltip,
	title: "Modern/Tooltip",
	decorators: [
		(Story) => (
			<div className="p-4 pb-24">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const OnText: Story = {
	args: {
		hint: "Coverage is the share of the category you have answered.",
		children: <Text size="body">coverage</Text>,
	},
};

export const OnADisabledAction: Story = {
	args: {
		hint: "Pick 1 more config to remove",
		children: (
			<Action
				label="Remove and go to shop"
				size="lg"
				emphasis="danger"
				disabled
				onUse={() => {}}
			/>
		),
	},
};

export const OnEveryMark: Story = {
	render: () => (
		<div className="flex gap-6">
			<Mark variant="pass" hint="This ran and paid out in full" />
			<Mark variant="warn" hint="This ran, but paid out in part" />
			<Mark variant="fail" hint="This ran and paid out nothing" />
			<Mark variant="idle" hint="This has not run yet" />
			<Mark variant="blank" shape="box" hint="This didn't run" />
		</div>
	),
};
