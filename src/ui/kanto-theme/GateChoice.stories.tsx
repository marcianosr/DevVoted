import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateShaky,
	kantoGateShakyCollected,
	kantoGateShakyFunded,
	kantoGateShakyPaid,
	kantoGateShakyPicking,
} from "~/test/kantoGate.factory";

import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";
import { Screen } from "./Screen.ui";

const choiceIn = (props: { tail?: { choice?: GateChoiceProps } }) =>
	props.tail!.choice!;

const meta: Meta<typeof GateChoice> = {
	component: GateChoice,
	title: "Kanto/GateChoice",
	parameters: { controls: { disable: true } },
	args: choiceIn(kantoGateShaky()),
	render: (args) => (
		<Screen gate="lavender">
			<GateChoice {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof GateChoice>;

export const Owed: Story = {};

export const PartlyPaid: Story = { args: choiceIn(kantoGateShakyPicking()) };

export const Settled: Story = { args: choiceIn(kantoGateShakyPaid()) };

export const BribeAffordable: Story = {
	args: choiceIn(kantoGateShakyFunded()),
};

export const DropsRefund: Story = { args: choiceIn(kantoGateShakyCollected()) };
