import type { Meta, StoryObj } from "@storybook/react";

import { kantoAtStakeAt } from "~/test/kantoPoll.factory";

import { BandLadder } from "./BandLadder.ui";
import { Screen } from "./Screen.ui";

const PALLET_GATE = 0;
const CASCADE_GATE = 2;
const LAVENDER_GATE = 4;
const CASCADE_THIN = 53.3;
const FULL = 100;

const ladderAt = (gate: number, coverageHeld: number) =>
	kantoAtStakeAt({ gate, configs: [], coverageHeld }).ladder;

const meta: Meta<typeof BandLadder> = {
	component: BandLadder,
	title: "Kanto/BandLadder",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<BandLadder {...args} />
		</Screen>
	),
	args: ladderAt(LAVENDER_GATE, 0),
};
export default meta;

type Story = StoryObj<typeof BandLadder>;

export const UnderTheFloor: Story = {};

export const StandingInOk: Story = {
	args: ladderAt(CASCADE_GATE, CASCADE_THIN),
};

export const AtPallet: Story = { args: ladderAt(PALLET_GATE, 0) };

export const FullBar: Story = { args: ladderAt(LAVENDER_GATE, FULL) };

export const InHalfAScreen: Story = {
	render: (args) => (
		<Screen theme="lavender">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<div className="flex w-full min-w-0 flex-col gap-6">
					<BandLadder {...args} />
				</div>
				<div />
			</div>
		</Screen>
	),
};
