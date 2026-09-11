import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateAnswers,
	kantoGateHold,
	kantoGateHoldAt,
	kantoGateHoldCoinedBuild,
	kantoGateHoldCollected,
	kantoGateHoldExact,
	kantoGateHoldOpen,
	kantoGateHoldOver,
	kantoGateHoldShort,
} from "~/test/kantoGate.factory";

import { GateHoldScreen } from "./GateHoldScreen.ui";

const meta: Meta<typeof GateHoldScreen> = {
	component: GateHoldScreen,
	title: "Kanto/Screens/GateHoldScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof GateHoldScreen>;

export const Held: Story = {
	render: () => <GateHoldScreen {...kantoGateHold()} />,
};

export const Short: Story = {
	render: () => <GateHoldScreen {...kantoGateHoldShort()} />,
};

export const ExactChange: Story = {
	render: () => <GateHoldScreen {...kantoGateHoldExact()} />,
};

export const Overpaid: Story = {
	render: () => <GateHoldScreen {...kantoGateHoldOver()} />,
};

export const Collected: Story = {
	render: () => <GateHoldScreen {...kantoGateHoldCollected()} />,
};

export const AllOpen: Story = {
	render: () => <GateHoldScreen {...kantoGateHoldOpen()} />,
};

const HoldWithPicks = () => {
	const [chosen, setChosen] = useState<readonly string[]>([]);

	const toggle = (configId: string) =>
		setChosen((held) =>
			held.includes(configId)
				? held.filter((kept) => kept !== configId)
				: [...held, configId]
		);

	return (
		<GateHoldScreen
			{...kantoGateHoldAt({
				gate: 4,
				answers: kantoGateAnswers,
				balanceBeforeKb: 102,
				configs: kantoGateHoldCoinedBuild,
				auditIds: ["cost-overrun"],
				chosen,
				onToggle: toggle,
			})}
		/>
	);
};

export const Picking: Story = {
	render: () => <HoldWithPicks />,
};
