import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asPoll,
	JS_GATE,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Dependabot",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const streaking = (outcomes: readonly boolean[]) =>
	afterAnswers(
		runWith(
			[CONFIGS.dependabot, CONFIGS.intellisense],
			[...JS_GATE, ...MIXED_GATE]
		),
		outcomes
	);

export const CountingUp: Story = {
	render: () => asPoll(streaking([true, true])),
};

export const OneAnswerFromAnUpgrade: Story = {
	render: () => asPoll(streaking([true, true, true, true])),
};

export const AWrongAnswerStartsOver: Story = {
	render: () => asPoll(streaking([true, true, true, false])),
};
