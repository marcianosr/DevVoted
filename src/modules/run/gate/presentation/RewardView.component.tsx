import { useState } from "react";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { gateStorageBreakdown } from "~/modules/run/gate/domain/gateReward.model";
import {
	ALL_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { RewardScreen } from "~/ui/modern-theme/screens/RewardScreen.ui";
import type { LedgerEntry } from "~/ui/modern-theme/Ledger.ui";
import { Mark, type MarkVariant } from "~/ui/modern-theme/Mark.ui";
import { Swatch } from "~/ui/modern-theme/Swatch.ui";
import { plural } from "~/ui/modern-theme/format";

const ANSWERED_HINT = {
	pass: "Every poll in this category was correct",
	warn: "Partly right, so this scored less than a clean answer",
	fail: "Every poll in this category was missed",
	idle: "This category has not been polled yet",
	blank: "No polls came up in this category",
} as const satisfies Record<MarkVariant, string>;

const markFor = (polls: readonly AnsweredPoll[]): MarkVariant => {
	if (polls.some((poll) => poll.outcome === "wrong")) return "fail";
	return polls.some((poll) => poll.outcome === "partial") ? "warn" : "pass";
};

const round = (value: number) => Math.round(value * 10) / 10;

const byCategory = (
	answered: readonly AnsweredPoll[]
): ReadonlyMap<CategoryCode, readonly AnsweredPoll[]> =>
	answered.reduce((groups, poll) => {
		const held = groups.get(poll.category) ?? [];
		return groups.set(poll.category, [...held, poll]);
	}, new Map<CategoryCode, readonly AnsweredPoll[]>());

const coverageLedger = (
	answered: readonly AnsweredPoll[]
): readonly LedgerEntry[] =>
	[...byCategory(answered)].map(([category, polls]) => {
		const mark = markFor(polls);

		return {
			id: category,
			name: getCategoryMetadata(category).name,
			lead: <Mark variant={mark} shape="box" hint={ANSWERED_HINT[mark]} />,
			notes: [plural(polls.length, "poll")],
			value: round(
				polls.reduce((sum, poll) => sum + (poll.coverageEarned ?? 0), 0)
			),
		};
	});

const PAID_HINT = "This ran and paid out";

const storageLedger = (view: RunView): readonly LedgerEntry[] => {
	const { baseKb, rows } = gateStorageBreakdown({
		configs: view.configs,
		answered: view.answeredThisGate,
		gateReward: view.gatePayout.gateRewardPaidKb,
		faucetThisGateKb: view.gatePayout.faucetThisGateKb,
		interestThisGateKb: view.gatePayout.interestThisGateKb,
		extraPickThisGateKb: view.gatePayout.extraPickThisGateKb,
	});

	const bills: readonly LedgerEntry[] = [
		{
			id: "storage-plan",
			name: "storage plan",
			notes: view.gatePayout.planDowngraded
				? ["unpaid · downgraded"]
				: ["pass or fail"],
			value: -view.gatePayout.gateBillPaidKb,
			dimmed: true,
		},
		{
			id: "subscriptions",
			name: "subscriptions",
			notes: ["this gate"],
			value: -view.gatePayout.subscriptionBillKb,
			dimmed: true,
		},
	];

	return [
		{
			id: "gate-clear",
			name: "gate clear",
			lead: <Swatch size="pip" />,
			notes: [`${view.pollsPerGate} polls`],
			value: baseKb,
		},
		...rows.map((row) => ({
			id: row.config.id,
			name: row.config.label,
			lead: <Mark variant="pass" hint={PAID_HINT} />,
			value: row.kb,
		})),
		...bills.filter((bill) => bill.value !== 0),
	];
};

export type RewardViewProps = {
	view: RunView;
	onReviewAnswers: () => void;
} & (
	| { outcome: "cleared"; onContinue: () => void; onChooseRemoval?: never }
	| { outcome: "held"; onChooseRemoval: () => void; onContinue?: never }
);

export const RewardView = (props: RewardViewProps) => {
	const { view, onReviewAnswers } = props;
	const [detailShown, setDetailShown] = useState(true);

	const cleared = props.outcome === "cleared";
	const gate = cleared
		? view.gatePayout.clearedGateNumber
		: view.gateStake.gateNumber;
	const swatch = swatchForGate(gate);

	// `view.gateTheme` and `gateStake` describe the gate ahead; this screen
	// reports on the one just played.
	const shared = {
		theme: swatch?.theme,
		gateName: swatch?.gateName ?? "",
		requiredCoverage: cleared
			? view.gatePayout.clearedGateDemand
			: view.gateStake.coverageDemand,
		track: {
			gates: ALL_SWATCHES,
			cleared: view.gatesCleared,
			...(cleared ? {} : { atCleared: "pending" as const }),
		},
		coverage: coverageLedger(view.answeredThisGate),
		storage: storageLedger(view),
		outcomes: view.answeredThisGate.map((poll) => poll.outcome),
		detailShown,
		onToggleDetail: () => setDetailShown((shown) => !shown),
		onReviewAnswers,
	};

	if (props.outcome === "held")
		return (
			<RewardScreen
				{...shared}
				outcome="held"
				removeCount={view.stripsRemaining}
				onChooseRemoval={props.onChooseRemoval}
			/>
		);

	return (
		<RewardScreen
			{...shared}
			outcome="cleared"
			clearedGate={gate}
			spendableKb={view.storage}
			onContinue={props.onContinue}
		/>
	);
};
