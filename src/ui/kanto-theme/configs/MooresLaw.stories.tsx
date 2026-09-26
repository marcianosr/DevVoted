import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asGateOutcome,
	funded,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Moore's Law",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const banking = (storage: number) =>
	asGateOutcome(
		afterAnswers(
			funded(runWith([CONFIGS.mooresLaw], MIXED_GATE), storage),
			ALL_RIGHT
		)
	);

export const InterestOnASmallBalance: Story = { render: () => banking(128) };

export const InterestOnAFatBalance: Story = { render: () => banking(2048) };
