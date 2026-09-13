import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asPoll,
	asShop,
	funded,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/yarn.lock",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const WaitsForTheShop: Story = {
	render: () => asPoll(runWith([CONFIGS.yarnLock], MIXED_GATE)),
};

export const HoldsAnOffer: Story = {
	render: () =>
		asShop(
			afterAnswers(
				funded(runWith([CONFIGS.yarnLock], MIXED_GATE), 512),
				ALL_RIGHT
			)
		),
};
