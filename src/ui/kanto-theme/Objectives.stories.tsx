import type { Meta, StoryObj } from "@storybook/react";

import { Objectives, type Objective } from "./Objectives.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";

const CLEAR: Objective = {
	statement: { lead: "Finish at", figure: "OK", color: "saffron" },
	explain: "to clear the gate",
	met: true,
};

const SWATCH: Objective = {
	statement: { lead: "Finish at", figure: "PERFECT", color: "cerulean" },
	explain: "to earn the Pallet swatch",
	met: false,
	figures: [{ label: "5 of 5" }],
};

const AUDIT: Objective = {
	statement: {
		lead: "Finish at",
		figure: "HEALTHY",
		color: "viridian",
		trail: "or better",
	},
	explain: "to arm an audit",
	met: false,
};

const meta: Meta<typeof Objectives> = {
	component: Objectives,
	title: "Kanto/Objectives",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="pallet" width="narrow">
			<Panel>
				<Objectives {...args} />
			</Panel>
		</Screen>
	),
	args: {
		requiredLead: "Main objective",
		required: {
			...CLEAR,
			statement: { ...CLEAR.statement, trail: "or better" },
		},
		optionalLead: "Extra objectives",
		optional: [SWATCH, AUDIT],
	},
};
export default meta;

type Story = StoryObj<typeof Objectives>;

export const OnTheCalibrationGate: Story = {};

export const NothingInHandYet: Story = {
	args: { required: { ...CLEAR, met: false } },
};

export const EveryPrizeWon: Story = {
	args: {
		optional: [
			{ ...SWATCH, met: true },
			{ ...AUDIT, met: true },
		],
	},
};

export const AnExtraOutOfReach: Story = {
	args: { optional: [{ ...SWATCH, lost: true }, AUDIT] },
};

export const NothingOnTheSide: Story = {
	args: { optional: [] },
};
