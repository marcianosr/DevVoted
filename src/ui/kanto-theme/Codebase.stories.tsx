import type { Meta, StoryObj } from "@storybook/react";

import { kantoCodebaseAt } from "~/test/kantoPoll.factory";

import { Codebase } from "./Codebase.ui";
import { Screen } from "./Screen.ui";

const CASCADE_GATE = 2;
const LAVENDER_GATE = 4;
const CHAMPION_GATE = 12;

const meta: Meta<typeof Codebase> = {
	component: Codebase,
	title: "Kanto/Codebase",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Codebase {...args} />
		</Screen>
	),
	args: kantoCodebaseAt(CASCADE_GATE, 53.3),
};
export default meta;

type Story = StoryObj<typeof Codebase>;

export const ThreeGatesHalfCovered: Story = {};

export const FreshRun: Story = { args: kantoCodebaseAt(0, 0) };

export const HealthyAtLavender: Story = {
	args: kantoCodebaseAt(LAVENDER_GATE, 64),
};

export const ChampionPrismatic: Story = {
	args: kantoCodebaseAt(CHAMPION_GATE, 92.5),
};
