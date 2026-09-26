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
	title: "Kanto/Configs/ESLint",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const linting = (storage: number) =>
	funded(runWith([CONFIGS.eslint, CONFIGS.js], JS_GATE), storage);

export const CrossesOutAWrongAnswer: Story = {
	render: () => asPoll(linting(256)),
};

export const AWrongAnswerIsGone: Story = {
	render: () => asPoll(dispatching(linting(256), { type: "lint-poll" })),
};

export const RefusesWhenOneWrongIsLeft: Story = {
	render: () =>
		asPoll(
			dispatching(linting(256), { type: "lint-poll" }, { type: "lint-poll" })
		),
};

export const WaitsForJavaScriptOrTypeScript: Story = {
	render: () => asPoll(funded(runWith([CONFIGS.eslint], CSS_GATE), 256)),
};

export const FeeDoublesEachUse: Story = {
	render: () => {
		const state = dispatching(
			funded(runWith([CONFIGS.eslint], ["js", "ts", "js", "ts", "js"]), 512),
			{ type: "lint-poll" },
			{ type: "answer", optionIds: [] }
		);
		return asPoll(state);
	},
};

export const CannotAffordTheFee: Story = {
	render: () => asPoll(linting(0)),
};
