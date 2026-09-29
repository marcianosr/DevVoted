import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	kantoPollPaysAt,
	kantoPollPaysChampion,
} from "~/test/kantoPoll.factory";

import { PollPays } from "./PollPays.ui";
import { Screen } from "./Screen.ui";

const CASCADE_GATE = 2;
const LAVENDER_GATE = 4;

const meta: Meta<typeof PollPays> = {
	component: PollPays,
	title: "Kanto/PollPays",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<PollPays {...args} />
		</Screen>
	),
	args: kantoPollPaysAt({
		gate: CASCADE_GATE,
		configs: [CONFIGS.ts, CONFIGS.codeCoverage],
		coverageHeld: 53.3,
	}),
};
export default meta;

type Story = StoryObj<typeof PollPays>;

export const CascadeThin: Story = {};

export const PalletFresh: Story = {
	args: kantoPollPaysAt({ gate: 0, configs: [CONFIGS.js], coverageHeld: 0 }),
};

export const ChampionWithThreeFocusConfigs: Story = {
	args: kantoPollPaysChampion(),
};

export const FullBar: Story = {
	args: kantoPollPaysAt({
		gate: LAVENDER_GATE,
		configs: [CONFIGS.js],
		coverageHeld: 100,
	}),
};
