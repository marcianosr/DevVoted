import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	asPoll,
	CSS_GATE,
	dispatching,
	funded,
	JS_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Stylelint",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const styling = (categories: typeof CSS_GATE | typeof JS_GATE) =>
	funded(runWith([CONFIGS.stylelint], categories), 256);

export const CrossesOutOnCss: Story = {
	render: () => asPoll(styling(CSS_GATE)),
};

export const AWrongAnswerIsGone: Story = {
	render: () => asPoll(dispatching(styling(CSS_GATE), { type: "lint-poll" })),
};

export const WaitsForCss: Story = {
	render: () => asPoll(styling(JS_GATE)),
};
