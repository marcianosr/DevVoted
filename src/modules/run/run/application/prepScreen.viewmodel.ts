import type { Config } from "~/modules/run/config/domain/config.model";
import { prefetcherFor } from "~/modules/run/build/domain/build.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import type { Audit } from "~/modules/run/gate/domain/audit.model";
import { auditsForGate } from "~/modules/run/gate/domain/audit.model";
import { DEFAULT_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/auditSchedule.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { bandOutcomesPropsFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import {
	gateSwatchAt,
	swatchTrackTo,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
	planBillKb,
	storageCapFor,
} from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { HeaderFunds } from "~/ui/kanto-theme/Header.ui";
import type { LedgerFigure, LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type {
	PollScoreRow,
	PollScoresProps,
} from "~/ui/kanto-theme/PollScores.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";

const RUN_GATE_COUNT = VICTORY_GATE + 1;
export const BALANCE_WORD = "balance";

const noop = () => {};

export const fundsOf = (kb: number, label: string): HeaderFunds => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit, label };
};

const AUDITS_TITLE = "Audits";

const SUMMIT_LINE = "the summit — nothing after this";
const SEALED: LedgerFigure = { locked: true };

export const PREP_COMMUNITY_LABEL = "Community";
const START_LEAD = "Start";

export const PREP_POLLS_TITLE = "The five polls";
const BILL_LEAD = "bills";
const BILL_TRAIL = "on a clear";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "this gate";
const RUNG_MARKS = "rungs";
const CORRECT_OUTCOME = "correct";

/**
 * Every gate asks exactly SLICE_WINDOW polls, so the append-only record needs no
 * gate of its own: position divides into one.
 */
const rightAnswersIn = (answered: readonly AnsweredPoll[]): number =>
	answered.filter((poll) => poll.outcome === CORRECT_OUTCOME).length;

const rightAnswersPerGate = (
	answered: readonly AnsweredPoll[],
	gate: number
): number[] =>
	Array.from({ length: gate + 1 }, (_, index) =>
		answered
			.slice(index * SLICE_WINDOW, (index + 1) * SLICE_WINDOW)
			.filter((poll) => poll.outcome === CORRECT_OUTCOME)
	).map((polls) => polls.length);

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

const auditPropsFor = (audit: Audit): AuditProps => ({
	code: audit.code,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
});

const auditsMetaOf = (count: number) =>
	count === 0 ? NO_AUDITS : `${count} ${AUDIT_COUNT_TRAIL}`;

const auditBillFor = (
	configs: readonly Config[],
	gate: number,
	storageKb: number,
	planTier: number
): { bill?: string; note?: string } => {
	const ledger = billLedger({
		configs,
		gate,
		storageKb,
		planCapKb: storageCapFor(planTier),
		planBillKb: planBillKb(planTier),
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
	balanceKb: number;
	planTier: number;
	window: PrepWindow;
	bar: CoverageBarProps;
	/** Where the run stood when this window opened. Defaults to the live reading. */
	openingHeld?: number;
	coverageGainPercent: number;
	peelKb: number;
	payout: (correct: number) => number;
};

export const prepPropsFor = ({
	gate,
	answeredPolls,
	answeredThisGate = [],
	configs,
	balanceKb,
	planTier,
	window,
	bar,
	openingHeld = bar.held,
	coverageGainPercent,
	peelKb,
	payout,
}: PrepFrame): PrepScreenProps => {
	const answered = answeredThisGate.length;
	const swatch = gateSwatchAt(gate);
	const audits = auditsForGate(gate, DEFAULT_AUDIT_SCHEDULE);
	const prefetcher = prefetcherFor(configs);

	return {
		header: {
			swatch,
			gateCount: RUN_GATE_COUNT,
			swatches: swatchTrackTo(gate),
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
				payout,
			},
			{ ...bar, marks: RUNG_MARKS }
		),
		scores: pollScoresFor(gate, answeredPolls),
		polls: {
			title: PREP_POLLS_TITLE,
			badge: prefetcher?.label,
			rows: pollRowsFor(gate, window, prefetcher !== undefined),
		},
		audits: {
			title: AUDITS_TITLE,
			meta: auditsMetaOf(audits.length),
			...auditBillFor(configs, gate, balanceKb, planTier),
			alerts: audits.map(auditPropsFor),
		},
		footer: {
			asides: [
				{ label: PREP_COMMUNITY_LABEL, icon: "community", onPress: noop },
			],
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				icon: "chevron",
				onPress: noop,
			},
		},
	};
};
