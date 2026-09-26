import type { Meta, StoryObj } from "@storybook/react";

import { kantoRunOver, kantoRunSummit } from "~/test/kantoRunOver.factory";

import { RunOverScreen } from "./RunOverScreen.ui";

const meta: Meta<typeof RunOverScreen> = {
	component: RunOverScreen,
	title: "Kanto/Screens/RunOverScreen",
	parameters: { controls: { disable: true } },
	argTypes: {
		width: { control: "inline-radio", options: ["narrow", "default"] },
	},
	args: kantoRunOver(),
	render: (args) => <RunOverScreen {...args} />,
};
export default meta;

type Story = StoryObj<typeof RunOverScreen>;

export const Dead: Story = {};

export const Summited: Story = { args: kantoRunSummit() };

export const FirstGate: Story = {
	args: kantoRunOver({
		gate: 0,
		answers: [],
		payouts: { rows: [] },
		bar: { floor: 0, ok: 40, healthy: 60, held: 8 },
		unitsHeld: 1.6,
		swatchGates: [],
		configs: [],
		space: 4,
		weight: 0,
		balanceKb: 0,
		upkeepPaidKb: 0,
		unlocked: [],
	}),
};

export const WithArchive: Story = {
	args: kantoRunOver({ archiveAfterKb: 8_400 }),
};
