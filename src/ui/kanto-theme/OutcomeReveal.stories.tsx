import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateCaught,
	kantoGateDanger,
	kantoGateHealthy,
	kantoGatePerfect,
	kantoGateShaky,
	kantoRevealCaught,
	kantoRevealCleared,
	kantoRevealEnded,
	kantoRevealPerfect,
	kantoRevealShaky,
} from "~/test/kantoGate.factory";

import { Button } from "./Button.ui";
import {
	GateOutcomeScreen,
	type GateOutcomeScreenProps,
} from "./GateOutcomeScreen.ui";
import { OutcomeReveal, type OutcomeRevealData } from "./OutcomeReveal.ui";

type RevealStoryProps = {
	reveal: OutcomeRevealData;
	screen: GateOutcomeScreenProps;
};

const REPLAY = "Replay the reveal";

const RevealOverScreen = ({ reveal, screen }: RevealStoryProps) => {
	const [take, setTake] = useState(0);
	const [playing, setPlaying] = useState(true);

	return (
		<>
			<Button
				label={REPLAY}
				tone="ambient"
				size="sm"
				onPress={() => {
					setTake((count) => count + 1);
					setPlaying(true);
				}}
			/>
			<GateOutcomeScreen {...screen} />
			{playing ? (
				<OutcomeReveal
					key={take}
					{...reveal}
					onDone={() => setPlaying(false)}
				/>
			) : null}
		</>
	);
};

const meta: Meta<typeof RevealOverScreen> = {
	component: RevealOverScreen,
	title: "Kanto/Screens/OutcomeReveal",
	parameters: { controls: { disable: true } },
	args: { reveal: kantoRevealCleared(), screen: kantoGateHealthy() },
};
export default meta;

type Story = StoryObj<typeof RevealOverScreen>;

export const Cleared: Story = {};

export const Perfect: Story = {
	args: { reveal: kantoRevealPerfect(), screen: kantoGatePerfect() },
};

export const Shaky: Story = {
	args: { reveal: kantoRevealShaky(), screen: kantoGateShaky() },
};

export const Caught: Story = {
	args: { reveal: kantoRevealCaught(), screen: kantoGateCaught() },
};

export const Ended: Story = {
	args: { reveal: kantoRevealEnded(), screen: kantoGateDanger() },
};
