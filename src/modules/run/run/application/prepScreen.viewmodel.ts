import { AUDITS } from "~/shared/lib/copy";
import {
	type Config,
	escrowKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import {
	catcherFor,
	prefetcherFor,
} from "~/modules/run/build/domain/build.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { bandOutcomesPropsFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	roundToOneDecimal,
	SLICE_WINDOW,
	spaceRungFor,
} from "~/modules/run/run/domain/rules.model";
import {
	type CommittableBand,
	coverageGainPercentFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	rebaserFor,
	type PollSlot,
} from "~/modules/run/run/domain/rebase.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type {
	EstimateControl,
	SlaControl,
} from "~/modules/run/run/application/runView.viewmodel";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import {
	answersPerGate,
	type AnsweredPoll,
} from "~/modules/run/run/domain/runPoll.model";

import type { AttackPanelProps } from "~/ui/kanto-theme/AttackPanel.ui";
import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { HeaderFunds } from "~/ui/kanto-theme/Header.ui";
import type { LedgerFigure, LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type {
	PollScoreRow,
	PollScoresProps,
} from "~/ui/kanto-theme/PollScores.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { EstimatePickerProps } from "~/ui/kanto-theme/EstimatePicker.ui";
import type { SlaPickerProps } from "~/ui/kanto-theme/SlaPicker.ui";
import type { RebaseListProps } from "~/ui/kanto-theme/RebaseList.ui";

export const BALANCE_WORD = "balance";

const noop = () => {};

export const fundsOf = (kb: number, label: string): HeaderFunds => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit, label };
};

const SUMMIT_LINE = "the summit — nothing after this";
const SEALED: LedgerFigure = { locked: true };

export const PREP_COMMUNITY_LABEL = "Community";
export const PREP_INCIDENTS_LABEL = "Incidents";
const START_LEAD = "Start";

export const PREP_POLLS_TITLE = "The five polls";
const BILL_LEAD = "bills";
const BILL_TRAIL = "on a clear";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "this gate";
const RUNG_MARKS = "rungs";
const CORRECT_OUTCOME = "correct";

const ESTIMATE_HINT =
	"Call how many of the five you will get right. Meet the number and it pays; fall short and it pays nothing.";
const SLA_HINT =
	"Promise a band before you answer. Close there or better and the gate pays more; miss your own promise and it pays nothing extra.";
const REBASE_HINT =
	"Put the categories you are surest of first — a streak pays, and the opener counts twice for some builds.";
const MULTIPLE_LABEL = "two answers";
const SINGLE_LABEL = "one answer";

const slaPickerFor = (
	sla: SlaControl | null,
	committed: CommittableBand | null
): SlaPickerProps | undefined => {
	if (sla === null) return undefined;

	return {
		label: sla.configLabel,
		hint: SLA_HINT,
		committed,
		cards: sla.choices.map((choice) => ({
			band: choice.band,
			label: choice.label,
			terms: `close at ${choice.label} or better`,
			uplift: `+${Math.round(choice.uplift * 100)}%`,
		})),
	};
};

const estimatePickerFor = (
	gate: number,
	estimate: EstimateControl | null,
	committed: number | null
): EstimatePickerProps | undefined => {
	if (estimate === null) return undefined;

	return {
		label: estimate.configLabel,
		hint: ESTIMATE_HINT,
		committed,
		cards: estimate.choices.map((choice) => ({
			count: choice.count,
			floor: `at least ${choice.count} of ${SLICE_WINDOW}`,
			payout: `+${roundToOneDecimal(coverageGainPercentFor(choice.units, gate))}%`,
		})),
	};
};

const answerTypeLabel = (
	answerType: string | undefined
): string | undefined => {
	if (answerType === undefined) return undefined;
	return answerType === "multiple" ? MULTIPLE_LABEL : SINGLE_LABEL;
};

const rebaseListFor = (
	configs: readonly Config[],
	slots: readonly PollSlot[]
): RebaseListProps | undefined => {
	const rebaser = rebaserFor(configs);
	if (rebaser === undefined || slots.length === 0) return undefined;

	return {
		label: rebaser.label,
		hint: REBASE_HINT,
		rows: slots.map((slot) => ({
			id: slot.id,
			category: CATEGORY_METADATA[slot.category].name,
			answerType: answerTypeLabel(slot.answerType),
		})),
	};
};

const rightAnswersIn = (answered: readonly AnsweredPoll[]): number =>
	answered.filter((poll) => poll.outcome === CORRECT_OUTCOME).length;

const rightAnswersPerGate = (
	answered: readonly AnsweredPoll[],
	gate: number
): number[] => answersPerGate(answered, gate).map(rightAnswersIn);

export const pollScoresFor = (
	gate: number,
	answered: readonly AnsweredPoll[]
): PollScoresProps => ({
	rows: rightAnswersPerGate(answered, gate).map(
		(correct, index): PollScoreRow => ({
			swatch: gateSwatchAt(index),
			correct,
			polls: SLICE_WINDOW,
			...(index === gate ? { current: true } : {}),
		})
	),
});

const categoryTally = (codes: readonly CategoryCode[]): LedgerFigure[] => {
	const counts = codes.reduce<Map<CategoryCode, number>>(
		(tally, code) => tally.set(code, (tally.get(code) ?? 0) + 1),
		new Map()
	);

	return [...counts.entries()]
		.sort(([, one], [, other]) => other - one)
		.map(([code, count]) => ({
			label: `${CATEGORY_METADATA[code].name.toLowerCase()} ${count}`,
		}));
};

const answerTypeFigures = (split: {
	single: number;
	multiple: number;
}): LedgerFigure[] =>
	[
		{ label: `${split.single} single`, count: split.single },
		{ label: `${split.multiple} multiple`, count: split.multiple },
	]
		.filter((figure) => figure.count > 0)
		.map(({ label }) => ({ label }));

export type PrepWindow = {
	answerTypes: { single: number; multiple: number };
	optionCounts: readonly number[];
	categories: readonly CategoryCode[];
	nextCategories: readonly CategoryCode[];
};

const pollRowsFor = (
	gate: number,
	window: PrepWindow,
	revealed: boolean
): LedgerRow[] => {
	if (!revealed) {
		return [
			{ label: "answer types", figures: [SEALED] },
			{ label: "options each", figures: [SEALED] },
			{
				label: "categories",
				figures: window.categories.map(() => SEALED),
			},
		];
	}

	const summit = swatchForGate(gate + 1) === undefined;

	return [
		{ label: "answer types", figures: answerTypeFigures(window.answerTypes) },
		{
			label: "options each",
			figures: window.optionCounts.map((count) => ({ label: `${count}` })),
		},
		{ label: "categories", figures: categoryTally(window.categories) },
		{
			label: "next gate",
			figures: summit
				? [{ label: SUMMIT_LINE, tone: "quiet" }]
				: categoryTally(window.nextCategories),
		},
	];
};

const auditPropsFor = (audit: AuditView): AuditProps => ({
	code: audit.code,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
	sender: audit.sentBy,
});

const auditsMetaOf = (count: number) =>
	count === 0 ? NO_AUDITS : `${count} ${AUDIT_COUNT_TRAIL}`;

const auditBillFor = (
	configs: readonly Config[],
	gate: number,
	storageKb: number,
	space: number
): { bill?: string; note?: string } => {
	const ledger = billLedger({
		configs,
		gate,
		storageKb,
		spaceWeight: spaceRungFor(space).weight,
		spaceBillKb: spaceRungFor(space).kb,
	});

	if (ledger.totalKb === 0) return {};

	return {
		bill: `${BILL_LEAD} ${signedKbLabel(-ledger.totalKb)} ${BILL_TRAIL}`,
		note:
			ledger.shortfallKb === 0
				? undefined
				: `${kbLabel(ledger.shortfallKb)} short — what you cannot pay lapses.`,
	};
};

export type PrepFrame = {
	gate: number;
	answeredPolls: readonly AnsweredPoll[];
	/**
	 * This window's answers, in order. Not a slice of `answeredPolls`: that record
	 * is append-only across attempts, so a retried gate leaves it holding ten
	 * entries where the position arithmetic expects five.
	 */
	answeredThisGate?: readonly AnsweredPoll[];
	configs: readonly Config[];
	/** What rivals locked onto this gate, as the stake receipt states it. */
	audits?: readonly AuditView[];
	/** The attack this run holds and who it may be aimed at. Absent on fixtures that predate it. */
	attack?: AttackPanelProps;
	balanceKb: number;
	buildSpace: number;
	window: PrepWindow;
	bar: CoverageBarProps;
	/** Where the run stood when this window opened. Defaults to the live reading. */
	openingHeld?: number;
	coverageGainPercent: number;
	peelKb: number;
	payout: (correct: number) => number;
	/** Planning Poker's control. Null whenever the bet cannot be placed. */
	estimate?: EstimateControl | null;
	estimatedCorrect?: number | null;
	/** SLA's control. Null whenever no band can be promised. */
	sla?: SlaControl | null;
	slaBand?: CommittableBand | null;
	/** git rebase -i's rows. Empty whenever the order cannot be changed. */
	rebaseSlots?: readonly PollSlot[];
	/** Gates this run played flawlessly. Only these fill on the track. */
	swatchGates?: readonly number[];
};

export const prepPropsFor = ({
	gate,
	answeredPolls,
	answeredThisGate = [],
	configs,
	audits = [],
	attack,
	balanceKb,
	buildSpace,
	window,
	bar,
	openingHeld = bar.held,
	coverageGainPercent,
	peelKb,
	payout,
	estimate = null,
	estimatedCorrect = null,
	sla = null,
	slaBand = null,
	rebaseSlots = [],
	swatchGates = [],
}: PrepFrame): PrepScreenProps => {
	const answered = answeredThisGate.length;
	const swatch = gateSwatchAt(gate);
	const prefetcher = prefetcherFor(configs);

	return {
		header: {
			swatch,
			swatches: swatchTrackFor(swatchGates, gate),
			funds: fundsOf(balanceKb, BALANCE_WORD),
			swatchState: "current",
			badge:
				audits.length === 0
					? undefined
					: `${audits.length} ${audits.length === 1 ? "audit" : "audits"}`,
			note:
				answered === 0
					? `today's ${SLICE_WINDOW} polls are ready`
					: `${answered} of ${SLICE_WINDOW} answered`,
			noteAt: "track",
		},
		outcomes: bandOutcomesPropsFor(
			{
				gateName: swatch.gateName,
				gate,
				correctThisGate: rightAnswersIn(answeredThisGate),
				held: bar.held,
				openingHeld,
				ladder: bar,
				coverageGainPercent,
				peelKb,
				escrows: escrowKbPerCorrect(configs) > 0,
				catchesFatal: catcherFor(configs) !== undefined,
				payout,
			},
			{ ...bar, marks: RUNG_MARKS }
		),
		estimate: estimatePickerFor(gate, estimate, estimatedCorrect),
		sla: slaPickerFor(sla, slaBand),
		rebase: rebaseListFor(configs, rebaseSlots),
		scores: pollScoresFor(gate, answeredPolls),
		polls: {
			title: PREP_POLLS_TITLE,
			badge: prefetcher?.label,
			rows: pollRowsFor(gate, window, prefetcher !== undefined),
		},
		audits: {
			title: AUDITS,
			meta: auditsMetaOf(audits.length),
			...auditBillFor(configs, gate, balanceKb, buildSpace),
			alerts: audits.map(auditPropsFor),
		},
		attack,
		footer: {
			asides: [
				{ label: PREP_COMMUNITY_LABEL, icon: "community", onPress: noop },
				{ label: PREP_INCIDENTS_LABEL, icon: "gate", onPress: noop },
			],
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				icon: "chevron",
				onPress: noop,
			},
		},
	};
};
