import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asPoll,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Cold Start",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const DoublesTheOpener: Story = {
	render: () => asPoll(runWith([CONFIGS.coldStart], MIXED_GATE)),
};

export const QuietAfterTheOpener: Story = {
	render: () =>
		asPoll(afterAnswers(runWith([CONFIGS.coldStart], MIXED_GATE), [true])),
};
