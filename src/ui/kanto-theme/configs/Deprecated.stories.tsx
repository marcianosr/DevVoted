import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { asPoll, MIXED_GATE, runWith } from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Deprecated",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const TripleCoverageOnAFreshRun: Story = {
	render: () => asPoll(runWith([CONFIGS.deprecated], MIXED_GATE)),
};

export const FadedByGateFour: Story = {
	render: () => asPoll(runWith([CONFIGS.deprecated], MIXED_GATE, 4)),
};
