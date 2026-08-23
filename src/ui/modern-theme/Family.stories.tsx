import type { Meta, StoryObj } from "@storybook/react";

import { FAMILY, FAMILY_ORDER, Family } from "./Family.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Family> = {
	component: Family,
	title: "Modern/Family",
	args: { family: "multiplier" },
};
export default meta;

type Story = StoryObj<typeof Family>;

export const Tag: Story = {};

export const Legend: Story = {
	render: () => (
		<ul className="flex flex-col gap-2">
			{FAMILY_ORDER.map((family) => (
				<li key={family} className="flex items-center gap-3">
					<Family family={family} className="w-20" />
					<Text size="meta" tone="muted">
						{FAMILY[family].gloss}
					</Text>
				</li>
			))}
		</ul>
	),
};
