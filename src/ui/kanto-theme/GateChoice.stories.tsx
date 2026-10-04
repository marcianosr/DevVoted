import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateCaught,
	kantoGateCaughtDropped,
	kantoGateCaughtOwing,
	kantoGateShaky,
	kantoGateShakyCollected,
	kantoGateShakyFunded,
	kantoGateShakyFundedDropping,
	kantoGateShakyMix,
	kantoGateShakyMixSettled,
	kantoGateShakyPaid,
	kantoGateShakyStorageOnly,
	kantoGateShakyStuck,
} from "~/test/kantoGate.factory";

import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";
import type { GateOutcomeScreenProps } from "./GateOutcomeScreen.ui";
import { Screen } from "./Screen.ui";

const choiceOf = (props: GateOutcomeScreenProps): GateChoiceProps => ({
	...props.tail!.choice!,
	press: { ...props.footer.action, note: props.footer.note },
});

const meta: Meta<typeof GateChoice> = {
	component: GateChoice,
	title: "Kanto/GateChoice",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen gate="gate-lavender">
			<GateChoice {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof GateChoice>;

export const StorageOrConfig: Story = {
	args: choiceOf(kantoGateShakyFunded()),
};

export const ConfigPicked: Story = {
	args: choiceOf(kantoGateShakyFundedDropping()),
};

export const StorageOnly: Story = {
	args: choiceOf(kantoGateShakyStorageOnly()),
};

export const ConfigsOnly: Story = { args: choiceOf(kantoGateShaky()) };

export const ConfigsOnlyPicked: Story = {
	args: choiceOf(kantoGateShakyPaid()),
};

export const DropsRefund: Story = { args: choiceOf(kantoGateShakyCollected()) };

export const Mix: Story = { args: choiceOf(kantoGateShakyMix()) };

export const MixSettled: Story = {
	args: choiceOf(kantoGateShakyMixSettled()),
};

export const NothingCovers: Story = { args: choiceOf(kantoGateShakyStuck()) };

export const CatchFirst: Story = { args: choiceOf(kantoGateCaught()) };

export const CatchDropped: Story = {
	args: choiceOf(kantoGateCaughtDropped()),
};

export const CatchDroppedStillOwing: Story = {
	args: choiceOf(kantoGateCaughtOwing()),
};
