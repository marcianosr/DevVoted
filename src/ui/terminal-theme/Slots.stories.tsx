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

export const OneSlot: Story = { args: { slots: 1 } };

export const TwoSlots: Story = { args: { slots: 2 } };

/** Every rung of the ramp, including the two ADR-047 reserved sizes no roster
 * config uses yet: the only way to check six fills read apart from each other. */
export const EverySize: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{(
				[
					{ slots: 1, name: ".js" },
					{ slots: 2, name: "IndexedDB" },
					{ slots: 4, name: "Deprecated" },
					{ slots: 8, name: "Dependabot" },
					{ slots: 12, name: "(reserved)" },
					{ slots: 16, name: "(reserved)" },
				] as const
			).map((config) => (
				<span key={config.slots} className="flex items-center gap-3">
					<Slots slots={config.slots} />
					<Text tone="muted" size="caption">
						{config.slots} · {config.name}
					</Text>
				</span>
			))}
		</div>
	),
};
