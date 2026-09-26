import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { asPoll, JS_GATE, MIXED_GATE, runWith } from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Focus family",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const WHOLE_FAMILY = [
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.jsx,
	CONFIGS.git,
	CONFIGS.rb,
	CONFIGS.html,
	CONFIGS.java,
	CONFIGS.py,
	CONFIGS.frontend,
	CONFIGS.vue,
];

export const PaysItsOwnCategory: Story = {
	render: () =>
		asPoll(runWith([CONFIGS.js, CONFIGS.ts, CONFIGS.css], MIXED_GATE)),
};

export const TheRestWaitTheirTurn: Story = {
	render: () => asPoll(runWith(WHOLE_FAMILY, JS_GATE)),
};
