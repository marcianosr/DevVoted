import type { Meta, StoryObj } from "@storybook/react";

import { kantoAtStakeAt } from "~/test/kantoPoll.factory";

import { BandOutcomes } from "./BandOutcomes.ui";
import { Screen } from "./Screen.ui";

const PALLET_GATE = 0;
const CASCADE_GATE = 2;
const LAVENDER_GATE = 4;
const CASCADE_THIN = 53.3;
const HEALTHY_HELD = 70;
const FULL = 100;

const atStake = (gate: number, coverageHeld: number) =>
	kantoAtStakeAt({ gate, configs: [], coverageHeld });

const meta: Meta<typeof BandOutcomes> = {
	component: BandOutcomes,
	title: "Kanto/BandOutcomes",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="lavender">
			<BandOutcomes {...args} />
		</Screen>
	),
	args: atStake(LAVENDER_GATE, 0),
};
export default meta;

type Story = StoryObj<typeof BandOutcomes>;

export const UnderTheFloor: Story = {};

export const StandingInOk: Story = {
	args: atStake(CASCADE_GATE, CASCADE_THIN),
};

export const StandingInHealthy: Story = {
	args: atStake(LAVENDER_GATE, HEALTHY_HELD),
};

export const AtTheCalibrationGate: Story = {
	args: atStake(PALLET_GATE, 0),
};

export const FullBar: Story = { args: atStake(LAVENDER_GATE, FULL) };

export const InHalfAScreen: Story = {
	render: (args) => (
		<Screen theme="lavender">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<div className="flex w-full min-w-0 flex-col gap-6">
					<BandOutcomes {...args} />
				</div>
				<div />
			</div>
		</Screen>
	),
};
