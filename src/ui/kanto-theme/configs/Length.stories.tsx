import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	asPoll,
	MIXED_GATE,
	runWith,
	underAudit,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/.length",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const CountsTheGate: Story = {
	render: () => asPoll(runWith([CONFIGS.length], MIXED_GATE)),
};

export const NothingCountsWithoutIt: Story = {
	render: () => asPoll(runWith([CONFIGS.intellisense], MIXED_GATE)),
};

export const OfflineUnderAnAudit: Story = {
	render: () =>
		asPoll(
			underAudit(runWith([CONFIGS.length], MIXED_GATE, 4), "dependency-outage")
		),
};
