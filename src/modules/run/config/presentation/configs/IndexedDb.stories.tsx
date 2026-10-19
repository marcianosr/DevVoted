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
	title: "Kanto/Configs/IndexedDB",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const DripsOnEveryCorrectAnswer: Story = {
	render: () => asPoll(runWith([CONFIGS.indexedDb], MIXED_GATE)),
};

export const FiveCorrectAnswersLater: Story = {
	render: () =>
		asGateOutcome(
			afterAnswers(runWith([CONFIGS.indexedDb], MIXED_GATE), ALL_RIGHT)
		),
};
