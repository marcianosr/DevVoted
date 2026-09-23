import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_BUILD_SPACE, kantoWeightFills } from "~/test/kantoPoll.factory";

/** What the 8 rung bills, stated here so the story never imports the domain. */
const KANTO_BUILD_SPACE_KB = 32;

import { Build } from "./Build.ui";
import { KANTO_COLORS } from "./colors";
import type { ConfigInfoProps } from "./ConfigInfo.ui";
import { Screen } from "./Screen.ui";
import { WeightTrack, type WeightTrackFill } from "./WeightTrack.ui";

const COLUMN = "flex w-full flex-col gap-3";

const HELD = 8;

const NEARLY_EMPTY: readonly WeightTrackFill[] = [{ name: ".ts", slots: 1 }];

const OVER: readonly WeightTrackFill[] = [
	{ name: "Freemium", slots: 8 },
	{ name: ".ts", slots: 2 },
];

const WITH_A_MINIFIED: readonly WeightTrackFill[] = [
	{ name: "Deprecated", slots: 0 },
	{ name: "Cache", slots: 4 },
];

const WITH_A_SLIVER: readonly WeightTrackFill[] = [
	{ name: "Freemium", slots: 16 },
	{ name: "Code Coverage", slots: 1 },
	{ name: "Telemetry", slots: 0.5 },
];

const LONG_NAMES: readonly WeightTrackFill[] = [
	{ name: "Continuous Integration", slots: 4 },
	{ name: "Code Coverage", slots: 2 },
	{ name: "Unit Tests", slots: 2 },
];

const WRAPS_THE_RAMP: readonly WeightTrackFill[] = KANTO_COLORS.map(
	(color) => ({
		name: color,
		slots: 1,
	})
);

const infoFor = (name: string, slots: number): ConfigInfoProps => ({
	name,
	description: `${name} pulls its weight on every poll it touches.`,
	slots,
	sellPrice: `${slots * 16} KB`,
	version: 2,
	maxVersion: 5,
});

const WITH_INFO: readonly WeightTrackFill[] = kantoWeightFills.map((fill) => ({
	...fill,
	info: infoFor(fill.name, fill.slots),
}));

const HoveredBuild = () => {
	const [highlight, setHighlight] = useState<string | undefined>();

	return (
		<Build
			configs={kantoWeightFills.map((fill) => ({
				name: fill.name,
				slots: fill.slots,
				badges: [],
				info: infoFor(fill.name, fill.slots),
			}))}
			layout="column"
			weight={{ held: KANTO_BUILD_SPACE, perGateKb: KANTO_BUILD_SPACE_KB }}
			highlight={highlight}
			onHighlight={setHighlight}
		/>
	);
};

const meta: Meta<typeof WeightTrack> = {
	component: WeightTrack,
	title: "Kanto/WeightTrack",
	args: { fills: kantoWeightFills, held: HELD },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<WeightTrack {...args} />
		</Screen>
	),
};

export default meta;
type Story = StoryObj<typeof WeightTrack>;

export const RoomToSpare: Story = {};

export const NearlyEmpty: Story = { args: { fills: NEARLY_EMPTY } };

/** What the track says while an offer that crosses a rung sits armed (ADR-098). */
export const PreviewingAnInstallThatCrossesARung: Story = {
	args: {
		held: 8,
		perGateKb: 32,
		preview: { weight: 10, held: 12, perGateKb: 64 },
	},
};

export const NamesWhatTheNextRungWouldCost: Story = {
	args: { held: 8, perGateKb: 32, next: { weight: 12, kb: 64 } },
};

export const FullToTheMark: Story = {
	args: { fills: [{ name: "Freemium", slots: 8 }] },
};

export const HeavierThanTheSpaceItRents: Story = { args: { fills: OVER } };

export const WithAMinifiedConfigDrawingNothing: Story = {
	args: { fills: WITH_A_MINIFIED },
};

export const ASliverTooThinToName: Story = { args: { fills: WITH_A_SLIVER } };

export const NamesTooLongForTheirSegments: Story = {
	args: { fills: LONG_NAMES },
};

export const TwelveConfigsWrapTheRamp: Story = {
	args: { fills: WRAPS_THE_RAMP, held: WRAPS_THE_RAMP.length },
};

export const HoveredOnAConfig: Story = {
	args: { highlight: "Telemetry" },
};

export const BarAlone: Story = { args: { caption: false } };

export const HoverOpensTheConfig: Story = {
	args: { fills: WITH_INFO },
};

export const HoverOpensTheConfigOnTheRight: Story = {
	args: { fills: WITH_INFO, highlight: "Telemetry" },
};

export const HoveredInsideABuild: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<HoveredBuild />
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
							held={HELD}
							highlight="Telemetry"
						/>
					</div>
				</Screen>
			))}
		</div>
	),
};
