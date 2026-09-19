import type { Meta, StoryObj } from "@storybook/react";

import { Action } from "./Action.ui";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

const meta: Meta<typeof Tooltip> = {
	component: Tooltip,
	title: "Old/Modern/Tooltip",
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

export const AlignedToEitherEdge: Story = {
	render: () => (
		<div className="flex w-64 justify-between border border-edge p-2">
			<Tooltip hint="Rent a wider plan for more slots">
				<Text size="meta">left</Text>
			</Tooltip>
			<Tooltip hint="Rent a wider plan for more slots" align="right">
				<Text size="meta">right</Text>
			</Tooltip>
		</div>
	),
};

export const OpeningEitherWay: Story = {
	render: () => (
		<div className="flex items-center justify-between border border-edge p-8">
			<Tooltip hint="Over capacity by 4 slots. Minify, uninstall, or rent more room.">
				<Text size="meta">below</Text>
			</Tooltip>
			<Tooltip
				hint="Over capacity by 4 slots. Minify, uninstall, or rent more room."
				side="above"
				align="right"
			>
				<Text size="meta">above</Text>
			</Tooltip>
		</div>
	),
};
