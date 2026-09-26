import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asPoll,
	asPrep,
	JS_GATE,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/git rebase -i",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const WaitsForPrep: Story = {
	render: () => asPoll(runWith([CONFIGS.gitRebase], MIXED_GATE)),
};

export const TheOrderOnOffer: Story = {
	render: () =>
		asPrep(
			afterAnswers(
				runWith([CONFIGS.gitRebase], [...MIXED_GATE, ...JS_GATE]),
				ALL_RIGHT
			)
		),
};
