import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { kantoScoringAt } from "~/test/kantoPoll.factory";

import { Scoring } from "./Scoring.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const PALLET_GATE = 0;
const VERMILION_GATE = 3;
const LAVENDER_GATE = 4;
const INDIGO_ELITE_GATE = 11;
const CHAMPION_GATE = 12;

const SWEEP = "grid w-full gap-8 xl:grid-cols-2";
const GATE_JOIN = " · gate ";

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

export const AtVermilion: Story = { args: kantoScoringAt(VERMILION_GATE) };

export const AtIndigoElite: Story = {
	args: kantoScoringAt(INDIGO_ELITE_GATE),
};

export const AtTheChampion: Story = { args: kantoScoringAt(CHAMPION_GATE) };

export const EveryGate: Story = {
	render: () => (
		<div className={SWEEP}>
			{ALL_SWATCHES.map((swatch) => (
				<Screen key={swatch.gate} gate={swatch.theme} width="narrow" floor="0">
					<Typography variant="caption">
						{`${swatch.gateName}${GATE_JOIN}${swatch.gate}`}
					</Typography>
					<Scoring {...kantoScoringAt(swatch.gate)} />
				</Screen>
			))}
		</div>
	),
};
