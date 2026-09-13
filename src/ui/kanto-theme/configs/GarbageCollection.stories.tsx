import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asGateOutcome,
	asPoll,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Garbage Collection",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const ALL_WRONG = [false, false, false, false, false];

export const WaitsForAPeel: Story = {
	render: () =>
		asPoll(
			runWith([CONFIGS.garbageCollection, CONFIGS.intellisense], MIXED_GATE)
		),
};

export const RefundsWhatThePeelDrops: Story = {
	render: () =>
		asGateOutcome(
			afterAnswers(
				runWith([CONFIGS.garbageCollection, CONFIGS.intellisense], MIXED_GATE),
				ALL_WRONG
			),
			"held"
		),
};
