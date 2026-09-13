import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { asPoll, MIXED_GATE, runWith } from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Dry Run",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const ProjectsWhereTheAnswerLands: Story = {
	render: () => asPoll(runWith([CONFIGS.dryRun], MIXED_GATE)),
};

export const LateGateRaisesTheStakes: Story = {
	render: () => asPoll(runWith([CONFIGS.dryRun], MIXED_GATE, 8)),
};
