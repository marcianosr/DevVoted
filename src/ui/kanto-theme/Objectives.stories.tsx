import type { Meta, StoryObj } from "@storybook/react";

import { Objectives, type Objective } from "./Objectives.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";

const CLEAR: Objective = {
	name: "Clear the gate",
	detail: "gate 1 opens tomorrow",
	met: true,
	requirements: [
		{ lead: "reach", figure: "OK", color: "saffron" },
		{ lead: "answer", figure: "2 of 5" },
	],
};

const SWATCH: Objective = {
	name: "Earn the Pallet swatch",
	detail: "kept for good",
	met: false,
	requirements: [{ lead: "answer", figure: "5 of 5" }],
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
	args: { objectives: [CLEAR, SWATCH] },
};
export default meta;

type Story = StoryObj<typeof Objectives>;

export const OnTheCalibrationGate: Story = {};

export const NothingInHandYet: Story = {
	args: { objectives: [{ ...CLEAR, met: false }, SWATCH] },
};

export const BothWon: Story = {
	args: { objectives: [CLEAR, { ...SWATCH, met: true }] },
};

export const AtTheSummit: Story = {
	render: (args) => (
		<Screen theme="indigo" width="narrow">
			<Panel>
				<Objectives {...args} />
			</Panel>
		</Screen>
	),
	args: {
		objectives: [
			{ ...CLEAR, detail: "the climb ends here", met: false },
			{ ...SWATCH, name: "Earn the Champion swatch" },
		],
	},
};
