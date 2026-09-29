import type { Meta, StoryObj } from "@storybook/react";

import { kantoStrictnessAt } from "~/test/kantoPoll.factory";

import { GateStrictness } from "./GateStrictness.ui";
import { Screen } from "./Screen.ui";

const LAVENDER_GATE = 4;
const CHAMPION_GATE = 12;

const meta: Meta<typeof GateStrictness> = {
	component: GateStrictness,
	title: "Kanto/GateStrictness",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<GateStrictness {...args} />
		</Screen>
	),
	args: kantoStrictnessAt(LAVENDER_GATE),
};
export default meta;

type Story = StoryObj<typeof GateStrictness>;

export const AtLavender: Story = {};

export const AtPallet: Story = { args: kantoStrictnessAt(0) };

export const AtTheChampion: Story = { args: kantoStrictnessAt(CHAMPION_GATE) };
