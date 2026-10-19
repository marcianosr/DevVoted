import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asGateOutcome,
	asPrep,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/SLA",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const prepping = (): RunState => ({
	...runWith([CONFIGS.sla], MIXED_GATE),
	status: "rewarding",
	slaBand: undefined,
});

const promising = (band: string): RunState =>
	runReducer(prepping(), { type: "commit-band", band });

const closed = (band: string): RunState =>
	runReducer(
		afterAnswers({ ...promising(band), status: "answering" }, ALL_RIGHT),
		{ type: "close-gate" }
	);

export const ThreeBandsToPromise: Story = {
	render: () => asPrep(prepping()),
};

export const PromisedHealthy: Story = {
	render: () => asPrep(promising("healthy")),
};

export const PaidForHoldingToIt: Story = {
	render: () => asGateOutcome(closed("healthy")),
};
