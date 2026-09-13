import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	afterAnswers,
	ALL_RIGHT,
	asGateOutcome,
	asShop,
	funded,
	MIXED_GATE,
	runWith,
} from "~/test/configRun.harness";

const meta: Meta = {
	title: "Kanto/Configs/Freemium",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const cleared = (gate: number, storage = 512) =>
	afterAnswers(
		funded(runWith([CONFIGS.freemium], MIXED_GATE, gate), storage),
		ALL_RIGHT
	);

export const BillsTheFirstClear: Story = {
	render: () => asGateOutcome(cleared(0)),
};

export const TheBillDoublesByGateFive: Story = {
	render: () => asGateOutcome(cleared(5)),
};

export const HalvesTheShelf: Story = {
	render: () => asShop(cleared(0)),
};
