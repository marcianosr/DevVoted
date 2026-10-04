import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	asPoll,
	MIXED_GATE,
	runWith,
	underAudit,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Volkswagen CI",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const GreensTheFirstAudit: Story = {
	render: () =>
		asPoll(
			underAudit(
				runWith([CONFIGS.volkswagenCi], MIXED_GATE, 3),
				"cost-overrun",
				"flaky-build"
			)
		),
};

export const NoAuditToSuppress: Story = {
	render: () => asPoll(runWith([CONFIGS.volkswagenCi], MIXED_GATE)),
};
