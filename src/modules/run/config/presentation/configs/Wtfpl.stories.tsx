import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asShop,
	funded,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/WTFPL",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const shopping = (configs: Parameters<typeof runWith>[0]) =>
	asShop(afterAnswers(funded(runWith(configs, MIXED_GATE), 1024), ALL_RIGHT));

export const OpensEveryShelf: Story = {
	render: () => shopping([CONFIGS.wtfpl]),
};

export const VoidsTheWarranty: Story = {
	render: () => shopping([CONFIGS.wtfpl, CONFIGS.intellisense]),
};
