import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asAnswered,
	asGateOutcome,
	asPoll,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/.reduce()",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const climbing = (correct: number) =>
	afterAnswers(
		runWith([CONFIGS.reduce], MIXED_GATE),
		ALL_RIGHT.slice(0, correct)
	);

export const ColdOnTheOpeningAnswer: Story = {
	render: () => asPoll(runWith([CONFIGS.reduce], MIXED_GATE)),
};

export const ThreeInARow: Story = {
	render: () => asPoll(climbing(3)),
};

export const TheReceiptAfterTheClimb: Story = {
	render: () => asAnswered(afterAnswers(climbing(3), [true])),
};

export const AFlawlessWindow: Story = {
	render: () => asGateOutcome(climbing(5)),
};

export const AMissRestartsTheClimb: Story = {
	render: () =>
		asPoll(afterAnswers(runWith([CONFIGS.reduce], MIXED_GATE), [true, false])),
};
