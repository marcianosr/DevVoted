import type { Meta, StoryObj } from "@storybook/react";

import { switchArm } from "~/modules/run/config/domain/config.model";
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
	title: "Kanto/Configs/A-B Test",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const ShipsArmA: Story = {
	render: () => asPoll(runWith([CONFIGS.abTest], MIXED_GATE)),
};

export const ArmBDripsStorage: Story = {
	render: () => asPoll(runWith([switchArm(CONFIGS.abTest)], MIXED_GATE)),
};

export const ArmBPaysAtTheGate: Story = {
	render: () =>
		asGateOutcome(
			afterAnswers(runWith([switchArm(CONFIGS.abTest)], MIXED_GATE), ALL_RIGHT)
		),
};
