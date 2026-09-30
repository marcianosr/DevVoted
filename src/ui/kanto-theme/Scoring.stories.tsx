import type { Meta, StoryObj } from "@storybook/react";

import { kantoScoringAt } from "~/test/kantoPoll.factory";

import { Scoring } from "./Scoring.ui";
import { Screen } from "./Screen.ui";

const PALLET_GATE = 0;
const THUNDER_GATE = 3;
const LAVENDER_GATE = 4;
const ELITE_GATE = 11;
const CHAMPION_GATE = 12;

const meta: Meta<typeof Scoring> = {
	component: Scoring,
	title: "Kanto/Scoring",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<Scoring {...args} />
		</Screen>
	),
	args: kantoScoringAt(LAVENDER_GATE),
};
export default meta;

type Story = StoryObj<typeof Scoring>;

export const AtLavender: Story = {};

export const AtPallet: Story = { args: kantoScoringAt(PALLET_GATE) };

export const AtThunder: Story = { args: kantoScoringAt(THUNDER_GATE) };

export const AtElite: Story = { args: kantoScoringAt(ELITE_GATE) };

export const AtTheChampion: Story = { args: kantoScoringAt(CHAMPION_GATE) };
