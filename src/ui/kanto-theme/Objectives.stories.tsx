import { gateSwatchAt } from "~/test/swatchTrack.factory";

import type { Meta, StoryObj } from "@storybook/react";

import { Objectives, type Objective } from "./Objectives.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";

const PALLET = gateSwatchAt(0);
const VERMILION = gateSwatchAt(3);
const CHAMPION = gateSwatchAt(12);

const CLEAR: Objective = {
	statement: ["Finish at ", { band: "ok" }, " or better"],
	earns: [
		"earns the ",
		{ figure: "advance to Pewter" },
		" and ",
		{ figure: "+13 KB", band: "ok" },
		" or more",
	],
};

const SWATCH: Objective = {
	statement: ["Answer all 5 right"],
	earns: [
		"earns ",
		{ swatch: PALLET, label: "Pallet swatch" },
		" and ",
		{ figure: "+48 KB", band: "perfect" },
	],
};

const meta: Meta<typeof Objectives> = {
	component: Objectives,
	title: "Kanto/Objectives",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen gate="gate-pallet" width="narrow">
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

export const OnAnAuditedGate: Story = {
	render: (args) => (
		<Screen gate="gate-vermilion" width="narrow">
			<Panel>
				<Objectives {...args} />
			</Panel>
		</Screen>
	),
	args: {
		objectives: [
			{
				statement: ["Finish at ", { band: "ok" }, " or better"],
				earns: [
					"earns the ",
					{ figure: "advance to Lavender" },
					" and ",
					{ figure: "+40 KB", band: "ok" },
					" or more",
				],
			},
			{
				statement: ["Answer all 5 right"],
				earns: [
					"earns ",
					{ swatch: VERMILION, label: "Vermilion swatch" },
					" and ",
					{ figure: "+96 KB", band: "perfect" },
				],
			},
		],
	},
};

export const WhereTheLadderAsksHealthy: Story = {
	args: {
		objectives: [
			{
				statement: ["Finish at ", { band: "healthy" }, " or better"],
				earns: [
					"earns the ",
					{ figure: "advance to Indigo Elite" },
					" and ",
					{ figure: "+312 KB", band: "healthy" },
					" or more",
				],
			},
			SWATCH,
		],
	},
};

export const AtTheSummit: Story = {
	render: (args) => (
		<Screen gate="gate-champion" width="narrow">
			<Panel>
				<Objectives {...args} />
			</Panel>
		</Screen>
	),
	args: {
		objectives: [
			{
				statement: ["Finish at ", { band: "healthy" }, " or better"],
				earns: ["earns ", { figure: "+704 KB", band: "healthy" }, " or more"],
			},
			{
				statement: ["Answer all 5 right"],
				earns: [
					"earns ",
					{ swatch: CHAMPION, label: "Champion swatch" },
					" and ",
					{ figure: "+1408 KB", band: "perfect" },
				],
			},
		],
	},
};

export const OnlyTheClear: Story = {
	args: { objectives: [CLEAR] },
};
