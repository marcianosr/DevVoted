import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { ClimbTrack, type TrackClimber, type TrackGate } from "./ClimbTrack.ui";

/** Owen vendor-locked his Cache; Pete fell carrying a maxed .ts. */
const OWEN_BUILD = [
	{ name: ".ts", slots: 1, version: 2 },
	{ name: "Cache", slots: 4, locked: true },
	{ name: "Telemetry", slots: 2 },
];
const PETE_BUILD = [
	{ name: ".ts", slots: 1, version: 5 },
	{ name: "ESLint", slots: 1 },
];

const climber = (
	name: string,
	over: Partial<TrackClimber> = {}
): TrackClimber => ({
	id: name.toLowerCase(),
	name,
	you: false,
	...over,
});

const gates = (over: Map<number, Partial<TrackGate>>): TrackGate[] =>
	ALL_SWATCHES.map((swatch) => ({
		gate: swatch.gate,
		name: swatch.gateName,
		theme: swatch.theme,
		finish: swatch.finish,
		current: false,
		uncharted: false,
		best: false,
		climbers: [],
		fallen: [],
		...over.get(swatch.gate),
	}));

const meta: Meta<typeof ClimbTrack> = {
	component: ClimbTrack,
	title: "Terminal/ClimbTrack",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof ClimbTrack>;

export const TodaysClimb: Story = {
	args: {
		gates: gates(
			new Map([
				[1, { climbers: [climber("Sam Peeters")] }],
				[
					2,
					{
						climbers: [
							climber("Owen Vink", { build: OWEN_BUILD }),
							climber("Lisa Boekesteijn", { build: [] }),
						],
					},
				],
				[
					3,
					{
						climbers: [
							climber("Gary Oak"),
							climber("Misty Waterflower"),
							climber("Brock Harrison"),
							climber("Erika Celadon"),
							climber("Koga Fuchsia"),
						],
					},
				],
				[
					4,
					{
						fallen: [
							{
								...climber("Pete Vries", { build: PETE_BUILD }),
								runKey: "run-31",
							},
						],
					},
				],
				[
					6,
					{
						current: true,
						climbers: [climber("you", { you: true })],
					},
				],
				[8, { best: true }],
				[9, { uncharted: true }],
				[10, { uncharted: true }],
				[11, { uncharted: true }],
				[12, { uncharted: true }],
			])
		),
	},
};

export const FirstClimb: Story = {
	args: {
		gates: gates(
			new Map([
				[0, { current: true, climbers: [climber("you", { you: true })] }],
				...Array.from(
					{ length: 12 },
					(_, index): [number, Partial<TrackGate>] => [
						index + 1,
						{ uncharted: true },
					]
				),
			])
		),
	},
};
