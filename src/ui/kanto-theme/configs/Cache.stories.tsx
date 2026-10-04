import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asPoll,
	JS_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Cache",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const caching = (outcomes: readonly boolean[]) =>
	afterAnswers(runWith([CONFIGS.cache], JS_GATE), outcomes);

export const ColdOnFirstSight: Story = {
	render: () => asPoll(caching([])),
};

export const WarmPaysTheRepeat: Story = {
	render: () => asPoll(caching([true, true])),
};

export const AWrongAnswerFlushesIt: Story = {
	render: () => asPoll(caching([true, true, true, false])),
};
