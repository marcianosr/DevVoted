import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "./Text.ui";
import { Weight } from "./Weight.ui";

const meta: Meta<typeof Weight> = {
	component: Weight,
	title: "Terminal/Weight",
	decorators: [
		(Story) => (
			<div className="bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Weight>;

export const OneSlot: Story = { args: { slots: 1 } };

export const SixteenSlots: Story = { args: { slots: 16 } };

/** Every rung of the ramp, including the two ADR-047 reserved sizes no roster
 * config uses yet. The block stays one width whatever the figure, which is the
 * point: a 16-slot config no longer crowds the label beside it. */
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
					<Weight slots={config.slots} />
					<Text tone="muted" size="caption">
						{config.slots} · {config.name}
					</Text>
				</span>
			))}
		</div>
	),
};
