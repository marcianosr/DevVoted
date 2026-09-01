import type { Meta, StoryObj } from "@storybook/react";

import { FamilyDot } from "./FamilyDot.ui";
import { FAMILY_ORDER } from "./families";
import { Text } from "./Text.ui";

const meta: Meta<typeof FamilyDot> = {
	component: FamilyDot,
	title: "Terminal/FamilyDot",
	decorators: [
		(Story) => (
			<div className="bg-zinc-950 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof FamilyDot>;

export const Focus: Story = { args: { family: "focus" } };

export const Unseen: Story = { args: { family: "risk", dim: true } };

export const EveryFamily: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			{FAMILY_ORDER.map((family) => (
				<span key={family} className="flex items-center gap-1.5">
					<FamilyDot family={family} />
					<Text tone="muted">{family}</Text>
				</span>
			))}
		</div>
	),
};

export const SeenAgainstUnseen: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			{FAMILY_ORDER.map((family) => (
				<span key={family} className="flex items-center gap-1.5">
					<FamilyDot family={family} />
					<FamilyDot family={family} dim />
				</span>
			))}
		</div>
	),
};
