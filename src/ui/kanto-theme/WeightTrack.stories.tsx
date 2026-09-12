import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	KANTO_UPKEEP_RUNGS,
	KANTO_WEIGHT_AXIS_MAX,
	kantoShopBuild,
	kantoWeightFills,
} from "~/test/kantoPoll.factory";

import { Build } from "./Build.ui";
import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { WeightTrack, type WeightTrackFill } from "./WeightTrack.ui";

const COLUMN = "flex w-full flex-col gap-3";

const UNDER_THE_FIRST_RUNG: readonly WeightTrackFill[] = [
	{ name: ".ts", slots: 1 },
	{ name: "Code Coverage", slots: 2 },
];

const HEAVY: readonly WeightTrackFill[] = [
	...kantoWeightFills,
	{ name: "IndexedDB", slots: 8 },
	{ name: "Prefetch", slots: 4 },
	{ name: "Intellisense", slots: 8 },
	{ name: "Planning Poker", slots: 8 },
];

const WITH_A_MINIFIED: readonly WeightTrackFill[] = [
	...kantoWeightFills,
	{ name: "Dependabot", slots: 0 },
];

const WeighedBuild = () => {
	const [highlight, setHighlight] = useState<string | undefined>();

	return (
		<Build
			configs={kantoShopBuild}
			layout="column"
			weight={{ rungs: KANTO_UPKEEP_RUNGS, max: KANTO_WEIGHT_AXIS_MAX }}
			highlight={highlight}
			onHighlight={setHighlight}
		/>
	);
};

const meta: Meta<typeof WeightTrack> = {
	component: WeightTrack,
	title: "Kanto/WeightTrack",
	args: {
		fills: kantoWeightFills,
		rungs: KANTO_UPKEEP_RUNGS,
		max: KANTO_WEIGHT_AXIS_MAX,
	},
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<WeightTrack {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof WeightTrack>;

export const Paying: Story = {};

export const UnderTheFirstRung: Story = {
	args: { fills: UNDER_THE_FIRST_RUNG },
};

export const OnARung: Story = {
	args: { fills: [...kantoWeightFills, { name: "Prefetch", slots: 1 }] },
};

export const Hovered: Story = {
	args: { highlight: "Telemetry" },
};

export const HoveredOnAConfigThatClearsTheBill: Story = {
	args: { highlight: "Code Coverage" },
};

export const HeavierThanTheLadder: Story = {
	args: { fills: HEAVY },
};

export const CrowdedRungs: Story = {
	args: { max: 32 },
};

export const WithAMinifiedConfig: Story = {
	args: { fills: WITH_A_MINIFIED, highlight: "Dependabot" },
};

export const BarAlone: Story = {
	args: { caption: false },
};

export const UnderTheBuildItDraws: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<WeighedBuild />
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={COLUMN}>
						<WeightTrack
							fills={kantoWeightFills}
							rungs={KANTO_UPKEEP_RUNGS}
							max={KANTO_WEIGHT_AXIS_MAX}
							highlight="Telemetry"
						/>
					</div>
				</Screen>
			))}
		</div>
	),
};
