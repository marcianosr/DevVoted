import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asGateOutcome,
	asPrep,
	dispatching,
	JS_GATE,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Planning Poker",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const atPrep = () =>
	afterAnswers(
		runWith([CONFIGS.planningPoker], [...MIXED_GATE, ...JS_GATE]),
		ALL_RIGHT
	);

export const TakesTheBet: Story = {
	render: () => asPrep(atPrep()),
};

export const TheBetIsPlaced: Story = {
	render: () => asPrep(dispatching(atPrep(), { type: "estimate", count: 4 })),
};

export const PaysTheExactCall: Story = {
	render: () =>
		asGateOutcome(
			afterAnswers(
				dispatching(runWith([CONFIGS.planningPoker], MIXED_GATE), {
					type: "estimate",
					count: 5,
				}),
				ALL_RIGHT
			)
		),
};
