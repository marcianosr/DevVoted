import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	asPoll,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/&&",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const chaining = () => runWith([CONFIGS.andAnd], MIXED_GATE);

export const OpensTheChain: Story = {
	render: () => asPoll(chaining()),
};

export const FourLinksIn: Story = {
	render: () => asPoll(afterAnswers(chaining(), [true, true, true, true])),
};

export const AfterAShortCircuit: Story = {
	render: () => asPoll(afterAnswers(chaining(), [true, true, false])),
};
