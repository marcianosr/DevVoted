import type { Meta, StoryObj } from "@storybook/react";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asPoll,
	CSS_GATE,
	dispatching,
	funded,
	JS_GATE,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Linter",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const LINTER_V2: Config = { ...CONFIGS.linter, level: 2 };
const LINTER_V3: Config = { ...CONFIGS.linter, level: 3 };

const linting = (storage: number, linter: Config = CONFIGS.linter) =>
	funded(runWith([linter, CONFIGS.js], JS_GATE), storage);

const lintedThenCleared = (linter: Config) =>
	dispatching(
		afterAnswers(
			dispatching(funded(runWith([linter], [...JS_GATE, ...JS_GATE]), 512), {
				type: "lint-poll",
			}),
			ALL_RIGHT
		),
		{ type: "close-gate" },
		{ type: "finish-reward" }
	);

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

export const LintsAnyCategory: Story = {
	render: () => asPoll(funded(runWith([CONFIGS.linter], CSS_GATE), 256)),
};

export const FeeDoublesEachUse: Story = {
	render: () =>
		asPoll(
			dispatching(
				funded(runWith([CONFIGS.linter], MIXED_GATE), 512),
				{ type: "lint-poll" },
				{ type: "answer", optionIds: [] }
			)
		),
};

export const FeeCarriesAcrossTheClearAtV1: Story = {
	render: () => asPoll(lintedThenCleared(CONFIGS.linter)),
};

export const ResetsEachGateAtV2: Story = {
	render: () => asPoll(lintedThenCleared(LINTER_V2)),
};

export const HalfPriceAtV3: Story = {
	render: () => asPoll(linting(256, LINTER_V3)),
};

export const CannotAffordTheFee: Story = {
	render: () => asPoll(linting(0)),
};
