import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { asPrep, MIXED_GATE, runWith } from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/YAGNI",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const PADDING = [CONFIGS.js, CONFIGS.ts, CONFIGS.css, CONFIGS.eslint];

export const LowInAWideRung: Story = {
	render: () =>
		asPrep(runWith([CONFIGS.yagni, CONFIGS.wtfpl, ...PADDING], MIXED_GATE, 2)),
};

export const FlushWithItsRung: Story = {
	render: () =>
		asPrep(
			runWith(
				[CONFIGS.yagni, CONFIGS.wtfpl, CONFIGS.indexedDb, CONFIGS.js],
				MIXED_GATE,
				2
			)
		),
};

export const OnTheFreeRung: Story = {
	render: () => asPrep(runWith([CONFIGS.yagni, CONFIGS.js], MIXED_GATE, 2)),
};
