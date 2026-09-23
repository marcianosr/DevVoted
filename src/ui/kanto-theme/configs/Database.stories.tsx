import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asGateOutcome,
	asPoll,
	asPrep,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Database",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const holding = (): RunState =>
	afterAnswers(runWith([CONFIGS.database], MIXED_GATE), [true, true, true]);

const closed = (): RunState =>
	runReducer(afterAnswers(runWith([CONFIGS.database], MIXED_GATE), ALL_RIGHT), {
		type: "close-gate",
	});

export const TheTermsBeforeTheWindow: Story = {
	render: () => asPrep(runWith([CONFIGS.database], MIXED_GATE)),
};

export const HoldingWhatThreeExactAnswersEarned: Story = {
	render: () => asPoll(holding()),
};

export const CommittedOnTheClear: Story = {
	render: () => asGateOutcome(closed()),
};

export const RolledBackOnAHeldGate: Story = {
	render: () =>
		asGateOutcome(
			{ ...holding(), pendingKb: 0, escrowRolledBackKb: 24 },
			"held"
		),
};
