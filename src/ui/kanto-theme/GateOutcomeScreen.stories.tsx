import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateCaught,
	kantoGateCaughtFrame,
	kantoGateDanger,
	kantoGateHealthy,
	kantoGateHeldUnscored,
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
	type GateOutcomeFixture,
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

export const HeldUnscored: Story = { args: kantoGateHeldUnscored() };

export const ShakyPartlyPaid: Story = { args: kantoGateShakyPicking() };

export const ShakyCollected: Story = { args: kantoGateShakyCollected() };

export const Danger: Story = { args: kantoGateDanger() };

export const Caught: Story = { args: kantoGateCaught() };

export const GateZero: Story = { args: kantoGateZero() };

export const Summit: Story = { args: kantoGateSummit() };

export const Won: Story = { args: kantoGateWon() };

export const AllOpen: Story = { args: kantoGateOutcomeOpen() };

const HeldWithPicks = ({ fixture }: { fixture: GateOutcomeFixture }) => {
	const [chosen, setChosen] = useState<readonly string[]>([]);
	const [fromStorage, setFromStorage] = useState(false);

	const toggle = (configId: string) =>
		setChosen((held) =>
			held.includes(configId)
				? held.filter((id) => id !== configId)
				: [...held, configId]
		);

	return (
		<GateOutcomeScreen
			{...kantoGateOutcomeAt({
				...fixture,
				chosen,
				onToggle: toggle,
				fromStorage,
				onToggleStorage: () => setFromStorage((paying) => !paying),
			})}
		/>
	);
};

const shakyAt = (balanceBeforeKb: number): GateOutcomeFixture => ({
	gate: 4,
	answers: SHAKY_ANSWERS,
	balanceBeforeKb,
	configs: kantoGateOutcomeBuild,
});

export const Picking: Story = {
	render: () => <HeldWithPicks fixture={shakyAt(12)} />,
};

export const PickingWithStorage: Story = {
	render: () => <HeldWithPicks fixture={shakyAt(512)} />,
};

export const CaughtPicking: Story = {
	render: () => <HeldWithPicks fixture={kantoGateCaughtFrame()} />,
};
