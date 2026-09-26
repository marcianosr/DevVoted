import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import {
	afterAnswers,
	asGateOutcome,
	asPrep,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/TryCatch",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const ALL_WRONG = [false, false, false, false, false];

const deep = (): RunState => ({
	...runWith([CONFIGS.tryCatch, CONFIGS.intellisense], MIXED_GATE, 6),
	bankedUnits: 0,
});

const caught = (): RunState =>
	runReducer(afterAnswers(deep(), ALL_WRONG), { type: "close-gate" });

export const TheDangerRowReadsTheCatch: Story = {
	render: () => asPrep({ ...deep(), status: "rewarding" }),
};

export const CaughtInsteadOfEndingTheRun: Story = {
	render: () => asGateOutcome(caught(), "held"),
};
