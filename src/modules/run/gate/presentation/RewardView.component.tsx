import { kbLabel, signedKbLabel } from "~/shared/lib/storage";
import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	describeConfig,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { gateStorageBreakdown } from "~/modules/run/gate/domain/gateReward.model";
import {
	ALL_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import {
	GateClearScreen,
	type ChangedRow,
	type CoverageRow,
} from "~/ui/terminal-theme/screens/GateClearScreen.ui";
import type { AuditNote } from "~/ui/terminal-theme/Audits.ui";
import type { LedgerRow } from "~/ui/terminal-theme/Ledger.ui";
import type { TrackSwatch } from "~/ui/terminal-theme/SwatchTrack.ui";
import { storageGaugeFor } from "~/modules/run/run/presentation/PollView.component";
import { plural } from "~/ui/terminal-theme/format";

const round = (value: number) => Math.round(value * 10) / 10;

const signed = (value: number) => (value < 0 ? `${value}` : `+${value}`);

const byCategory = (
	answered: readonly AnsweredPoll[]
): ReadonlyMap<CategoryCode, readonly AnsweredPoll[]> =>
	answered.reduce((groups, poll) => {
		const held = groups.get(poll.category) ?? [];
		return groups.set(poll.category, [...held, poll]);
	}, new Map<CategoryCode, readonly AnsweredPoll[]>());

const coverageFor = (answered: readonly AnsweredPoll[], demand: number) => {
	const rows: readonly CoverageRow[] = [...byCategory(answered)].map(
		([category, polls]) => ({
			category: getCategoryMetadata(category).name,
			polls: plural(polls.length, "poll"),
			gain: signed(
				round(polls.reduce((sum, poll) => sum + (poll.coverageEarned ?? 0), 0))
			),
		})
	);

	const total = round(
		answered.reduce((sum, poll) => sum + (poll.coverageEarned ?? 0), 0)
	);

	return { rows, total: `${signed(total)}%`, held: total, demand };
};

const rewardsFor = (view: RunView): readonly LedgerRow[] => {
	const { gatePayout } = view;
	const { baseKb, rows } = gateStorageBreakdown({
		configs: view.configs,
		answered: view.answeredThisGate,
		gateReward: gatePayout.gateRewardPaidKb,
		faucetThisGateKb: gatePayout.faucetThisGateKb,
		interestThisGateKb: gatePayout.interestThisGateKb,
		extraPickThisGateKb: gatePayout.extraPickThisGateKb,
	});
	const bills = [
		{ name: "subscriptions", charged: gatePayout.subscriptionBillKb },
		{
			name: gatePayout.planDowngraded
				? "slot rent · unpaid, slots returned"
				: "slot rent",
			charged: gatePayout.planBilledKb,
		},
	].filter((bill) => bill.charged !== 0);

	return [
		{ name: "gate cleared", figure: signedKbLabel(baseKb) },
		...rows.map((row) => ({
			name: row.config.label,
			figure: signedKbLabel(row.kb),
		})),
		...bills.map((bill) => ({
			name: bill.name,
			figure: signedKbLabel(-bill.charged),
			muted: true,
		})),
		{
			name: "balance",
			value: kbLabel(view.storage),
			from:
				gatePayout.storageBeforeClearKb === null
					? undefined
					: kbLabel(gatePayout.storageBeforeClearKb),
			gauge: storageGaugeFor(view),
		},
	];
};

const changedRow = (
	config: Config,
	label: string,
	tone: "saffron" | "cinnabar" | "viridian"
): ChangedRow => ({
	family: config.family,
	name: config.label,
	detail: describeConfig(config),
	slots: slotsOf(config),
	badge: { label, tone },
});

const changedFor = (view: RunView): readonly ChangedRow[] => {
	const { autoUpgradedConfig, lapsedConfigs, deletedConfigs } = view.gatePayout;

	return [
		...(autoUpgradedConfig === null
			? []
			: [changedRow(autoUpgradedConfig, "upgraded", "viridian")]),
		...lapsedConfigs.map((config) => changedRow(config, "faded", "saffron")),
		...deletedConfigs.map((config) => changedRow(config, "gone", "cinnabar")),
	];
};

const trackFor = (view: RunView): readonly TrackSwatch[] =>
	ALL_SWATCHES.map((swatch) =>
		swatch.gate < view.gatesCleared
			? { theme: swatch.theme, state: "earned" as const }
			: { state: "locked" as const }
	);

const auditNote = (audit: AuditView): AuditNote => ({
	code: `${audit.code}`,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
	suppressed: audit.suppressed,
});

export type RewardViewProps = {
	view: RunView;
	onReviewAnswers: () => void;
	onContinue: () => void;
};

export const RewardView = ({
	view,
	onReviewAnswers,
	onContinue,
}: RewardViewProps) => {
	const cleared = view.gatePayout.clearedGateNumber;
	const swatch = swatchForGate(cleared);
	const next = swatchForGate(view.gatesCleared);
	const coverage = coverageFor(
		view.answeredThisGate,
		view.gatePayout.clearedGateDemand
	);
	const correct = view.answeredThisGate.filter(
		(poll) => poll.outcome === "correct"
	).length;
	const changed = changedFor(view);

	return (
		<GateClearScreen
			theme={swatch?.theme}
			title={`${swatch?.gateName ?? "The gate"} cleared`}
			subtitle={`gate ${cleared} of ${view.victoryGate}`}
			nextUp={
				next === undefined ? "the climb is done" : `next up · ${next.gateName}`
			}
			chips={[
				{
					label: `${coverage.total.replace("+", "")} of ${view.gatePayout.clearedGateDemand}% needed`,
					tone: "viridian",
				},
				{ label: `${correct} of ${view.answeredThisGate.length} right` },
			]}
			swatches={trackFor(view)}
			rewards={rewardsFor(view)}
			coverage={coverage}
			changed={{ meta: plural(changed.length, "config"), rows: changed }}
			audits={view.audits.map(auditNote)}
			reviewLabel="Review answers"
			onReview={onReviewAnswers}
			shopLabel="To the shop →"
			onShop={onContinue}
		/>
	);
};
