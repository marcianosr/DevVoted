import type { Meta, StoryObj } from "@storybook/react";

import { Slots } from "./Slots.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Slots> = {
	component: Slots,
	title: "Terminal/Slots",
	decorators: [
		(Story) => (
			<div className="bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Slots>;

export const OneSlot: Story = { args: { family: "focus", slots: 1 } };

export const TwoSlots: Story = { args: { family: "economy", slots: 2 } };

export const EveryFamily: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{(
				[
					{ family: "focus", slots: 1, name: ".js" },
					{ family: "defense", slots: 1, name: "ESLint" },
					{ family: "economy", slots: 2, name: "IndexedDB" },
					{ family: "risk", slots: 4, name: "Deprecated" },
					{ family: "amplify", slots: 8, name: "Dependabot" },
				] as const
			).map((config) => (
				<span key={config.name} className="flex items-center gap-3">
					<Slots family={config.family} slots={config.slots} />
					<Text tone="muted" size="caption">
						{config.name} · {config.slots}
					</Text>
				</span>
			))}
		</div>
	),
};
