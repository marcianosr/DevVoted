import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import type { TrackClimber, TrackGate } from "../ClimbTrack.ui";
import {
	CommunityScreen,
	type CommunityPollDetail,
	type PollChip,
	type StandoutEntry,
} from "./CommunityScreen.ui";

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

const standouts: StandoutEntry[] = [
	{
		title: "deepest",
		avatar: { name: "Owen Vink", you: false },
		detail: "gate 10 · poll 2",
		swatch: { theme: "earth", finish: "flat" },
	},
	{
		title: "against the room",
		avatar: { name: "Lisa Boekesteijn", you: false },
		detail: "right on poll 2 · 22% were",
	},
	{
		title: "clean sweep",
		avatar: {
			name: "Marc Steen",
			photoUrl: "https://github.com/matthijsgroen.png",
			borderUrl: "/borders/border-react-celadon.svg",
			you: false,
		},
		detail: "5 of 5 at Soul",
		swatch: { theme: "soul", finish: "flat" },
	},
	{
		title: "widest build",
		avatar: { name: "Sam Peeters", you: false },
		detail: "11 slots held",
	},
	{
		title: "travelling light",
		avatar: { name: "Pete Vries", you: false },
		detail: "gate 8 on 3 configs",
	},
	{
		title: "comeback",
		avatar: {
			name: "jdoornbos",
			borderUrl: "/borders/border-js-saffron.svg",
			you: true,
		},
		detail: "cleared after losing 4 configs",
	},
];

const pollChips: PollChip[] = [
	{ id: "10", label: "1", disabled: false },
	{ id: "11", label: "2", disabled: false },
	{ id: "12", label: "3", disabled: true },
	{ id: "ahead-3", label: "4", disabled: true },
	{ id: "ahead-4", label: "5", disabled: true },
];

const pollsById = new Map<string, CommunityPollDetail>([
	[
		"10",
		{
			category: "JavaScript",
			rightShare: "61% got it",
			question: "What does [] + [] evaluate to?",
			multiple: false,
			rows: [
				{ letter: "A", label: '""', percent: 61, right: true, yours: true },
				{ letter: "B", label: "[]", percent: 24, right: false, yours: false },
				{
					letter: "C",
					label: "TypeError",
					percent: 15,
					right: false,
					yours: false,
				},
			],
		},
	],
	[
		"11",
		{
			category: "TypeScript",
			rightShare: "22% got it",
			question: "Which TypeScript type does this produce?",
			multiple: false,
			rows: [
				{
					letter: "A",
					label: "string",
					percent: 22,
					right: true,
					yours: false,
				},
				{
					letter: "B",
					label: "number",
					percent: 68,
					right: false,
					yours: true,
				},
				{
					letter: "C",
					label: "unknown",
					percent: 7,
					right: false,
					yours: false,
				},
				{ letter: "D", label: "never", percent: 3, right: false, yours: false },
			],
		},
	],
]);

const climbGates = gates(
	new Map([
		[1, { climbers: [climber("Sam Peeters")] }],
		[2, { climbers: [climber("Owen Vink"), climber("Lisa Boekesteijn")] }],
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
		[4, { fallen: [{ ...climber("Pete Vries"), runKey: "run-31" }] }],
		[6, { current: true, climbers: [climber("you", { you: true })] }],
		[8, { best: true }],
		[9, { uncharted: true }],
		[10, { uncharted: true }],
		[11, { uncharted: true }],
		[12, { uncharted: true }],
	])
);

const meta: Meta<typeof CommunityScreen> = {
	component: CommunityScreen,
	title: "Terminal/Screens/Community",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof CommunityScreen>;

const Browsing = () => {
	const [selected, setSelected] = useState("11");

	return (
		<CommunityScreen
			theme="soul"
			standouts={standouts}
			pollChips={pollChips}
			selectedChipId={selected}
			onSelectPoll={setSelected}
			poll={pollsById.get(selected)}
			pollNote={
				pollsById.has(selected)
					? undefined
					: "Sealed — this poll may come back in a later seed."
			}
			totalPlayers={9}
			climb={{ gates: climbGates }}
			topPercent={18}
			back={{ label: "Today's climb →" }}
		/>
	);
};

export const Board: Story = { render: () => <Browsing /> };

export const NothingAnsweredYet: Story = {
	args: {
		theme: "pallet",
		standouts: standouts.slice(0, 2),
		pollChips: [],
		pollNote: "Nothing to see yet — answer some of today's polls first.",
		climb: { gates: climbGates },
		back: { label: "Today's climb →" },
	},
};

export const SealedPoll: Story = {
	args: {
		theme: "soul",
		standouts,
		pollChips,
		selectedChipId: "12",
		pollNote: "Sealed — this poll may come back in a later seed.",
		totalPlayers: 9,
		climb: { gates: climbGates },
		topPercent: 18,
		back: { label: "Today's climb →" },
	},
};

export const LockedForTomorrow: Story = {
	args: {
		theme: "soul",
		standouts,
		pollChips,
		selectedChipId: "11",
		poll: pollsById.get("11"),
		totalPlayers: 9,
		climb: { gates: climbGates },
		topPercent: 18,
		countdown: "New polls in 6h 12m",
		back: {
			label: "Back to your run",
			disabled: true,
			hint: "The day is played out — back to the climb at midnight.",
		},
	},
};

export const FirstClimb: Story = {
	args: {
		theme: "pallet",
		standouts: [],
		pollChips: pollChips.slice(0, 1),
		selectedChipId: "10",
		poll: pollsById.get("10"),
		totalPlayers: 1,
		climb: {
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
		back: { label: "Today's climb →" },
	},
};

export const Mobile: Story = {
	render: () => <Browsing />,
	decorators: [
		(Story) => (
			<div className="mx-auto max-w-[390px]">
				<Story />
			</div>
		),
	],
};
