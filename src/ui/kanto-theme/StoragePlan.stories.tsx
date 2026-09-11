import type { Meta, StoryObj } from "@storybook/react";

import {
	KANTO_PLAN_PEAK_KB,
	KANTO_PLAN_TIER,
	kantoStorageRungs,
	storagePlanCount,
} from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { StoragePlan } from "./StoragePlan.ui";

const TOP_TIER = storagePlanCount - 1;

const meta: Meta<typeof StoragePlan> = {
	component: StoragePlan,
	title: "Kanto/StoragePlan",
	args: { rungs: kantoStorageRungs() },
	render: (args) => (
		<Screen theme="cinnabar" width="narrow">
			<StoragePlan {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof StoragePlan>;

export const MidLadder: Story = {};

export const FreshAccount: Story = {
	args: { rungs: kantoStorageRungs(0, 0, 0) },
};

export const UnaffordableNextRung: Story = {
	args: { rungs: kantoStorageRungs(KANTO_PLAN_TIER, KANTO_PLAN_PEAK_KB, 96) },
};

export const AtTheCeiling: Story = {
	args: { rungs: kantoStorageRungs(TOP_TIER, 10240, 4096) },
};

export const NothingClimbed: Story = {
	args: { rungs: kantoStorageRungs(0, 512, 512) },
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:16rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<StoragePlan rungs={kantoStorageRungs()} />
				</Screen>
			))}
		</div>
	),
};
