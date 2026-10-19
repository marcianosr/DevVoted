import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	asPoll,
	asPrep,
	MIXED_GATE,
	runWith,
	underAudit,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/npm audit",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const AUDITED_GATE = 4;

const auditing = () =>
	runWith(
		[CONFIGS.npmAudit, CONFIGS.js, CONFIGS.cache],
		MIXED_GATE,
		AUDITED_GATE
	);

export const NamesTheOutageTargetInPrep: Story = {
	render: () => asPrep(underAudit(auditing(), "dependency-outage")),
};

export const NamesEveryPollsTargetForAFlakyBuild: Story = {
	render: () => asPrep(underAudit(auditing(), "flaky-build")),
};

export const NamesTheWholeBuildUnderTooEarly: Story = {
	render: () => asPrep(underAudit(auditing(), "too-early")),
};

export const SitsThePollOut: Story = {
	render: () => asPoll(runWith([CONFIGS.npmAudit, CONFIGS.js], MIXED_GATE)),
};
