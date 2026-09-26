import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateDanger,
	kantoGateHealthy,
	kantoGateHeldByFloor,
	kantoGateOk,
	kantoGateOutcomeAt,
	kantoGateOutcomeBuild,
	kantoGateOutcomeOpen,
	kantoGatePerfect,
	kantoGateShaky,
	kantoGateShakyCollected,
	kantoGateShakyFunded,
	kantoGateShakyPicking,
	kantoGateSummit,
	kantoGateWon,
	kantoGateZero,
	SHAKY_ANSWERS,
} from "~/test/kantoGate.factory";

import { GateOutcomeScreen } from "./GateOutcomeScreen.ui";

const meta: Meta<typeof GateOutcomeScreen> = {
	component: GateOutcomeScreen,
	title: "Kanto/Screens/GateOutcomeScreen",
	parameters: { controls: { disable: true } },
	argTypes: {
		width: { control: "inline-radio", options: ["narrow", "default"] },
	},
	args: kantoGateHealthy(),
	render: (args) => <GateOutcomeScreen {...args} />,
};
export default meta;

type Story = StoryObj<typeof GateOutcomeScreen>;

export const Healthy: Story = {};

export const Perfect: Story = { args: kantoGatePerfect() };

export const Ok: Story = { args: kantoGateOk() };

export const Shaky: Story = { args: kantoGateShaky() };

export const ShakyFunded: Story = { args: kantoGateShakyFunded() };

export const HeldByFloor: Story = { args: kantoGateHeldByFloor() };

export const ShakyPartlyPaid: Story = { args: kantoGateShakyPicking() };

export const ShakyCollected: Story = { args: kantoGateShakyCollected() };

export const Danger: Story = { args: kantoGateDanger() };

export const GateZero: Story = { args: kantoGateZero() };

export const Summit: Story = { args: kantoGateSummit() };

export const Won: Story = { args: kantoGateWon() };

export const AllOpen: Story = { args: kantoGateOutcomeOpen() };

const ShakyWithPicks = () => {
	const [chosen, setChosen] = useState<readonly string[]>([]);

	const toggle = (configId: string) =>
		setChosen((held) =>
			held.includes(configId)
				? held.filter((id) => id !== configId)
				: [...held, configId]
		);

	return (
		<GateOutcomeScreen
			{...kantoGateOutcomeAt({
				gate: 4,
				answers: SHAKY_ANSWERS,
				balanceBeforeKb: 12,
				configs: kantoGateOutcomeBuild,
				streak: 3,
				chosen,
				onToggle: toggle,
			})}
		/>
	);
};

export const Picking: Story = { render: () => <ShakyWithPicks /> };
