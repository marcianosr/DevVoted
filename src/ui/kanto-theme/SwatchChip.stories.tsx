import type { Meta, StoryObj } from "@storybook/react";

import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "./Screen.ui";
import { SwatchChip } from "./SwatchChip.ui";

const LAVENDER = GATE_SWATCHES[4];
const CHAMPION = GATE_SWATCHES[12];

const meta: Meta<typeof SwatchChip> = {
	component: SwatchChip,
	title: "Kanto/SwatchChip",
	args: {
		swatch: { state: "current", swatch: LAVENDER },
		label: `${LAVENDER.gateName} swatch`,
	},
	render: (args) => (
		<Screen gate={LAVENDER.theme} width="narrow">
			<SwatchChip {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof SwatchChip>;

export const Unearned: Story = {};

export const Earned: Story = {
	args: { swatch: { state: "discovered", swatch: LAVENDER } },
};

export const Prismatic: Story = {
	args: {
		swatch: { state: "current", swatch: CHAMPION },
		label: `${CHAMPION.gateName} swatch`,
	},
};

export const Undiscovered: Story = {
	args: { swatch: { state: "undiscovered" }, label: "an unearned swatch" },
};
