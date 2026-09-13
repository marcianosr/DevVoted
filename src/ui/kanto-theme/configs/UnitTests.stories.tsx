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
	title: "Kanto/Configs/Unit Tests",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const WaitsForTheGateClear: Story = {
	render: () => asPoll(runWith([CONFIGS.unitTests], MIXED_GATE)),
};

export const PaysOnTheClear: Story = {
	render: () =>
		asGateOutcome(
			afterAnswers(runWith([CONFIGS.unitTests], MIXED_GATE), ALL_RIGHT)
		),
};
