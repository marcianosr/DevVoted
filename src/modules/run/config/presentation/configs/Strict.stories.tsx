import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { GateEntry } from "~/test/configRun.harness";
import {
	answerNext,
	asAnswered,
	asPoll,
	dispatching,
	JS_GATE,
	runWith,
	SELECT_ALL_GATE,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/strict: true",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const holding = (gate: readonly GateEntry[]) => runWith([CONFIGS.strict], gate);

const armed = (gate: readonly GateEntry[]) =>
	dispatching(holding(gate), { type: "arm-strict" });

export const TheWagerRests: Story = {
	render: () => asPoll(holding(JS_GATE)),
};

export const TheWagerIsArmed: Story = {
	render: () => asPoll(armed(JS_GATE)),
};

export const PaysAnExactAnswer: Story = {
	render: () => asAnswered(answerNext(armed(JS_GATE), true)),
};

export const BillsAMiss: Story = {
	render: () => asAnswered(answerNext(armed(JS_GATE), false)),
};

export const BillsAPartialToo: Story = {
	render: () => asAnswered(answerNext(armed(SELECT_ALL_GATE), 1)),
};

export const RestsAgainOnTheNextPoll: Story = {
	render: () => asPoll(answerNext(armed(JS_GATE), true)),
};
