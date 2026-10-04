import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asAnswered,
	asPoll,
	JS_GATE,
	runWith,
	SELECT_ALL_GATE,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/.prettierrc",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const catching = (rights: number) =>
	afterAnswers(runWith([CONFIGS.prettierrc], SELECT_ALL_GATE), [rights]);

export const AQuarterCaughtPaysAWholeUnit: Story = {
	render: () => asAnswered(catching(1)),
};

export const AHalfCatchIsAlreadyWhole: Story = {
	render: () => asAnswered(catching(2)),
};

export const ThreeQuartersPaysTwo: Story = {
	render: () => asAnswered(catching(3)),
};

export const AFullSetPaysWhatItAlwaysPaid: Story = {
	render: () => asAnswered(catching(4)),
};

export const WaitsForASelectAll: Story = {
	render: () => asPoll(runWith([CONFIGS.prettierrc], JS_GATE)),
};
