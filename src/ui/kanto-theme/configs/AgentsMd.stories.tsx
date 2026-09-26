import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asGateOutcome,
	asPoll,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/AGENTS.md",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const EightSlotsForDoubleCoverage: Story = {
	render: () => asPoll(runWith([CONFIGS.agentsMd], MIXED_GATE)),
};

export const PaysOffAtTheGate: Story = {
	render: () =>
		asGateOutcome(
			afterAnswers(runWith([CONFIGS.agentsMd], MIXED_GATE), ALL_RIGHT)
		),
};
