import type { Meta, StoryObj } from "@storybook/react";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	asPoll,
	dispatching,
	funded,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Telemetry",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const peeking = (storage: number, config: Config = CONFIGS.telemetry) =>
	funded(runWith([config], MIXED_GATE), storage);

export const OffersThePeek: Story = {
	render: () => asPoll(peeking(512)),
};

export const AlreadyReadOnThisPoll: Story = {
	render: () => asPoll(dispatching(peeking(512), { type: "peek-poll" })),
};

export const CannotAffordThePeek: Story = {
	render: () => asPoll(peeking(0)),
};

export const V2ReadsTheSampleSize: Story = {
	render: () => asPoll(peeking(512, { ...CONFIGS.telemetry, level: 2 })),
};
