import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asPoll,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Overclock",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const BurnsTheOpener: Story = {
	render: () => asPoll(runWith([CONFIGS.overclock], MIXED_GATE)),
};

export const RunsHotAfterwards: Story = {
	render: () =>
		asPoll(afterAnswers(runWith([CONFIGS.overclock], MIXED_GATE), [true])),
};
