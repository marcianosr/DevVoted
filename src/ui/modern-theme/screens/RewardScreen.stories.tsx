import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import type { LedgerEntry } from "../Ledger.ui";
import { Mark, type MarkVariant } from "../Mark.ui";
import { Swatch } from "../Swatch.ui";
import type { CrumbVerdict } from "../Trail.ui";
import { RewardScreen, type RewardScreenProps } from "./RewardScreen.ui";

const meta: Meta<typeof RewardScreen> = {
	component: RewardScreen,
	title: "Modern/Screens/Reward",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof RewardScreen>;

const noop = () => {};

const ANSWERED = {
	pass: "Every poll in this category was correct",
	warn: "Partly right, so this scored less than a clean answer",
	fail: "Every poll in this category was missed",
	idle: "This category has not been polled yet",
	blank: "No polls came up in this category",
} as const satisfies Record<MarkVariant, string>;

const PAID = {
	pass: "This ran and paid out in full",
	warn: "This ran, but paid out in part",
	fail: "This ran and paid out nothing",
	idle: "This has not run yet",
	blank: "This didn't run",
} as const satisfies Record<MarkVariant, string>;

const COVERAGE: readonly LedgerEntry[] = [
	{
		id: "javascript",
		name: "javascript",
		lead: <Mark variant="pass" shape="box" hint={ANSWERED.pass} />,
		notes: ["2 polls", ".js ×1.25"],
		value: 2.3,
	},
	{
		id: "git",
		name: "git",
		lead: <Mark variant="pass" shape="box" hint={ANSWERED.pass} />,
		notes: ["1 poll"],
		value: 1.2,
	},
	{
		id: "typescript",
		name: "typescript",
		lead: <Mark variant="warn" shape="box" hint={ANSWERED.warn} />,
		notes: ["1 poll", "partly right"],
		value: 1,
	},
	{
		id: "css",
		name: "css",
		lead: <Mark variant="fail" shape="box" hint={ANSWERED.fail} />,
		notes: ["missed", "streak reset"],
		value: -0.3,
	},
	{
		id: "vue",
		name: "vue",
		lead: <Mark variant="blank" shape="box" hint={ANSWERED.blank} />,
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
		lead: <Mark variant="pass" hint={PAID.pass} />,
		notes: ["4 correct"],
		value: 32,
	},
	{
		id: "UnitTests",
		name: "Unit Tests",
		lead: <Mark variant="pass" hint={PAID.pass} />,
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
			track={{ gates: ALL_SWATCHES, cleared: 1 }}
			coverage={COVERAGE}
			storage={STORAGE}
			outcomes={OUTCOMES}
			onReviewAnswers={noop}
			onContinue={noop}
			theme="pallet"
		/>
	),
};

export const ShortOfDemand: Story = {
	render: () => (
		<Clear
			outcome="cleared"
			gateName="Lavender"
			clearedGate={4}
			spendableKb={34}
			requiredCoverage={12}
			track={{ gates: ALL_SWATCHES, cleared: 5 }}
			coverage={COVERAGE}
			storage={STORAGE}
			outcomes={["correct", "wrong", "partial", "wrong", "correct"]}
			onReviewAnswers={noop}
			onContinue={noop}
			theme="lavender"
		/>
	),
};

const HELD_COVERAGE: readonly LedgerEntry[] = [
	{
		id: "css",
		name: "css",
		lead: <Mark variant="pass" shape="box" hint={ANSWERED.pass} />,
		notes: ["2 polls"],
		value: 3.1,
	},
	{
		id: "git",
		name: "git",
		lead: <Mark variant="fail" shape="box" hint={ANSWERED.fail} />,
		notes: ["2 missed"],
		value: -1.4,
	},
	{
		id: "python",
		name: "python",
		lead: <Mark variant="fail" shape="box" hint={ANSWERED.fail} />,
		notes: ["1 missed"],
		value: 0,
	},
];

const HELD_STORAGE: readonly LedgerEntry[] = [
	{
		id: "IndexedDB",
		name: "IndexedDB",
		lead: <Mark variant="pass" hint={PAID.pass} />,
		notes: ["2 correct"],
		value: 16,
	},
	{
		id: "gate",
		name: "gate clear",
		lead: (
			<Mark
				variant="blank"
				shape="box"
				hint="The gate held, so its reward didn't pay"
			/>
		),
		notes: ["not paid"],
		value: 0,
		dimmed: true,
	},
	{
		id: "UnitTests",
		name: "Unit Tests",
		lead: <Mark variant="blank" hint={PAID.blank} />,
		notes: ["needs a clear"],
		value: 0,
		dimmed: true,
	},
];

export const NotEarned: Story = {
	render: () => (
		<Clear
			outcome="held"
			gateName="Elite"
			removeCount={2}
			requiredCoverage={12}
			track={{ gates: ALL_SWATCHES, cleared: 11, atCleared: "pending" }}
			coverage={HELD_COVERAGE}
			storage={HELD_STORAGE}
			outcomes={["correct", "wrong", "correct", "wrong", "wrong"]}
			onReviewAnswers={noop}
			onChooseRemoval={noop}
			theme="elite"
		/>
	),
};
