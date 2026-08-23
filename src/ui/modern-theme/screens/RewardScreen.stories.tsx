import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import type { LedgerEntry } from "../Ledger.ui";
import { Mark } from "../Mark.ui";
import { Swatch } from "../Swatch.ui";
import type { SwatchTrackItem } from "../SwatchTrack.ui";
import type { CrumbVerdict } from "../Trail.ui";
import { RewardScreen, type RewardScreenProps } from "./RewardScreen.ui";

// Game-design reason: the clear is the run's only pure payoff, and the swatch is
// the one thing a run leaves behind on the account when it ends.
const meta: Meta<typeof RewardScreen> = {
	component: RewardScreen,
	title: "Modern/Screens/Reward",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof RewardScreen>;

const noop = () => {};

// Tracks GATE_SWATCHES in swatch.model.ts: gates count from 0, so Pallet is
// gate 0 and Champion is gate 12.
const LADDER = [
	"pallet",
	"boulder",
	"cascade",
	"thunder",
	"lavender",
	"rainbow",
	"soul",
	"marsh",
	"seafoam",
	"volcano",
	"earth",
	"elite",
	"champion",
] as const;

// No square is current: the gate is cleared and the next one has not opened, so
// the track counts the collection rather than pointing at a rung.
const collected = (cleared: number): SwatchTrackItem[] =>
	LADDER.map((theme, gate) =>
		gate < cleared
			? { gate, state: "earned", theme }
			: { gate, state: "locked" }
	);

const COVERAGE: readonly LedgerEntry[] = [
	{
		id: "javascript",
		name: "javascript",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["2 polls", ".js ×1.25"],
		value: 2.3,
	},
	{
		id: "git",
		name: "git",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["1 poll"],
		value: 1.2,
	},
	{
		id: "typescript",
		name: "typescript",
		lead: <Mark variant="warn" shape="box" />,
		notes: ["1 poll", "partly right"],
		value: 1,
	},
	{
		id: "css",
		name: "css",
		lead: <Mark variant="fail" shape="box" />,
		notes: ["missed", "streak reset"],
		value: -0.3,
	},
	{
		id: "vue",
		name: "vue",
		lead: <Mark variant="blank" shape="box" />,
		notes: ["no polls"],
		value: 0,
	},
];

const STORAGE: readonly LedgerEntry[] = [
	{
		id: "gate",
		name: "gate clear",
		lead: <Swatch size="pip" />,
		notes: ["4 of 5", "32 × g1"],
		value: 26,
	},
	{
		id: "IndexedDB",
		name: "IndexedDB",
		lead: <Mark variant="pass" />,
		notes: ["4 correct"],
		value: 32,
	},
	{
		id: "UnitTests",
		name: "Unit Tests",
		lead: <Mark variant="pass" />,
		notes: ["on clear"],
		value: 32,
	},
];

const OUTCOMES: readonly CrumbVerdict[] = [
	"correct",
	"wrong",
	"correct",
	"correct",
	"correct",
];

// The disclosure is the screen's one piece of state, so a story owns it — a
// .ui.tsx takes plain data and hands the decision back out.
// Distributive: a plain Omit over a union collapses both branches into one
// object and loses the discriminant, so `outcome: "held"` would then accept
// `spendableKb`.
type Verdict<T> = T extends unknown
	? Omit<T, "detailShown" | "onToggleDetail">
	: never;

const Clear = (props: Verdict<RewardScreenProps>) => {
	const [detailShown, setDetailShown] = useState(true);

	return (
		<RewardScreen
			{...props}
			detailShown={detailShown}
			onToggleDetail={() => setDetailShown((shown) => !shown)}
		/>
	);
};

export const FirstClear: Story = {
	render: () => (
		<Clear
			outcome="cleared"
			gateName="Pallet"
			clearedGate={0}
			spendableKb={102}
			requiredCoverage={3}
			track={collected(1)}
			coverage={COVERAGE}
			storage={STORAGE}
			outcomes={OUTCOMES}
			onReviewAnswers={noop}
			onContinue={noop}
			theme="pallet"
		/>
	),
};

/** Cleared on the gate's own terms but short of the coverage the next rung
 * wants: the headline figure turns red while the swatch is still awarded. */
export const ShortOfDemand: Story = {
	render: () => (
		<Clear
			outcome="cleared"
			gateName="Lavender"
			clearedGate={4}
			spendableKb={34}
			requiredCoverage={12}
			track={collected(5)}
			coverage={COVERAGE}
			storage={STORAGE}
			outcomes={["correct", "wrong", "partial", "wrong", "correct"]}
			onReviewAnswers={noop}
			onContinue={noop}
			theme="lavender"
		/>
	),
};

// The gate held: nothing fired that needed a clear, so those lines report why
// rather than what they paid, and the swatch square stays hollow on the track.
const HELD_COVERAGE: readonly LedgerEntry[] = [
	{
		id: "css",
		name: "css",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["2 polls"],
		value: 3.1,
	},
	{
		id: "git",
		name: "git",
		lead: <Mark variant="fail" shape="box" />,
		notes: ["2 missed"],
		value: -1.4,
	},
	{
		id: "python",
		name: "python",
		lead: <Mark variant="fail" shape="box" />,
		notes: ["1 missed"],
		value: 0,
	},
];

const HELD_STORAGE: readonly LedgerEntry[] = [
	{
		id: "IndexedDB",
		name: "IndexedDB",
		lead: <Mark variant="pass" />,
		notes: ["2 correct"],
		value: 16,
	},
	{
		id: "gate",
		name: "gate clear",
		lead: <Mark variant="blank" shape="box" />,
		notes: ["not paid"],
		value: 0,
		dimmed: true,
	},
	{
		id: "UnitTests",
		name: "Unit Tests",
		lead: <Mark variant="blank" />,
		notes: ["needs a clear"],
		value: 0,
		dimmed: true,
	},
];

const HELD_TRACK: SwatchTrackItem[] = LADDER.map((theme, gate) => {
	if (gate < 4) return { gate, state: "earned", theme };
	return gate === 4 ? { gate, state: "pending" } : { gate, state: "locked" };
});

/** The gate holds. The swatch is drawn as the outline of the one you were going
 * for, the storage that never paid still shows why, and the way out costs
 * configs rather than KB. */
export const NotEarned: Story = {
	render: () => (
		<Clear
			outcome="held"
			gateName="Lavender"
			peelCount={2}
			requiredCoverage={12}
			track={HELD_TRACK}
			coverage={HELD_COVERAGE}
			storage={HELD_STORAGE}
			outcomes={["correct", "wrong", "correct", "wrong", "wrong"]}
			onReviewAnswers={noop}
			onChoosePeel={noop}
			theme="lavender"
		/>
	),
};
