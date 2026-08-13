import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_TOWNS } from "~/test/kanto";
import { Stack } from "./Stack.ui";

const meta: Meta<typeof Stack> = {
	component: Stack,
	title: "Layout/Stack",
	args: {
		children: KANTO_TOWNS.slice(0, 3).map((town) => (
			<div
				key={town.name}
				className="rounded-lg border border-edge-strong p-4 text-white"
			>
				{town.name}
			</div>
		)),
	},
};
export default meta;

type Story = StoryObj<typeof Stack>;

export const Default: Story = {};

export const TightGap: Story = { args: { gap: "4" } };

export const LooseGap: Story = { args: { gap: "8" } };
