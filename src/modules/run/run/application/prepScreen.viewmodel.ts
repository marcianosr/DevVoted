import { AUDITS, STORAGE_BALANCE } from "~/shared/lib/copy";
import {
	type Config,
	escrowKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import {
	catcherFor,
	prefetcherFor,
} from "~/modules/run/build/domain/build.model";
import {
	billLedger,
	type BillLedger,
} from "~/modules/run/config/domain/subscription.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { bandOutcomesPropsFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import { AUDITS_FROM_GATE } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	gateLabelOf,
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
	okUnitsAt,
	scoringSlotsAt,
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
import { plural } from "~/shared/lib/displayValue";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import {
	answersPerGate,
	type AnsweredPoll,
} from "~/modules/run/run/domain/runPoll.model";

import type { AttackPanelProps } from "~/ui/kanto-theme/AttackPanel.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type {
	AuditsPanelProps,
	AuditsRow,
} from "~/ui/kanto-theme/AuditsPanel.ui";
import {
	COVERAGE_BAND_WORD,
	type CoverageBarProps,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type { HeaderFunds } from "~/ui/kanto-theme/Header.ui";
import type { LedgerProps } from "~/ui/kanto-theme/Ledger.ui";
import type { LedgerFigure, LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type {
	PollScoreRow,
	PollScoresProps,
} from "~/ui/kanto-theme/PollScores.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { EstimatePickerProps } from "~/ui/kanto-theme/EstimatePicker.ui";
import type { SlaPickerProps } from "~/ui/kanto-theme/SlaPicker.ui";
import type { RebaseListProps } from "~/ui/kanto-theme/RebaseList.ui";

export const BALANCE_WORD = STORAGE_BALANCE;

const noop = () => {};

export const fundsOf = (kb: number, label: string): HeaderFunds => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit, label, kb };
};

const SUMMIT_LINE = "the summit — nothing after this";
const SEALED: LedgerFigure = { locked: true };

export const PREP_COMMUNITY_LABEL = "Community";
const START_LEAD = "Start";
const POLL_WORD = "poll";
const SLOT_WORD = "slot";
const UNIT_WORD = "unit";
const READING_JOIN = " · ";
const OK_DEMAND_LEAD = "need";
const OK_DEMAND_TRAIL = `for ${COVERAGE_BAND_WORD.ok}`;

/**
 * What the start press reads under its label: the window it is about to open,
 * and what it has to earn in it.
 *
 * Polls and slots are both stated because they are different numbers off gate
 * 0 — the window is always five polls, while the slots the run is scored
 * across grow with every gate it has opened.
 *
 * The demand is dropped once it is met, rather than stated as "need 0": a run
 * already holding the line is not owed a debt of nothing.
 */
export const prepPressNoteOf = (gate: number, unitsHeld: number): string => {
	const owed = okUnitsAt(gate) - unitsHeld;
	const window = [
		plural(SLICE_WINDOW, POLL_WORD),
		plural(scoringSlotsAt(gate), SLOT_WORD),
	];

	if (owed <= 0) return window.join(READING_JOIN);

	return [
		...window,
		`${OK_DEMAND_LEAD} ${plural(owed, UNIT_WORD)} ${OK_DEMAND_TRAIL}`,
	].join(READING_JOIN);
};

export const PREP_POLLS_TITLE = "The five polls";
const BILL_LEAD = "bills";
const BILL_TRAIL = "on a clear";
const BILL_TOTAL = "Every gate";
const BILL_COLOR: KantoColor = "cinnabar";
const SUBSCRIPTIONS_TITLE = "Subscriptions";
const LOCK_COLOR: KantoColor = "pewter";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "firing this gate";
const AUDITS_SHUT = `Audits are unlocked at ${gateLabelOf(AUDITS_FROM_GATE)}`;
const RUNG_MARKS = "rungs";
const CORRECT_OUTCOME = "correct";

const ESTIMATE_HINT =
	"Call how many of the five you will get right. Meet the number and it pays; fall short and it pays nothing.";
const SLA_HINT =
	"Promise a band before you answer. Close there or better and the gate pays more; miss your own promise and it pays nothing extra.";
const REBASE_HINT =
	"Put the categories you are surest of first — a streak pays, and the opener counts twice for some builds.";

const NO_BET_REMEDY = "has no bet — call one above";
const NO_PROMISE_REMEDY = "has no promise — name a band above";

const owedClause = (
	control: { configLabel: string } | null | undefined,
	committed: number | string | null | undefined,
	remedy: string
): string | undefined => {
	if (control === null || control === undefined) return undefined;
	if (committed !== null && committed !== undefined) return undefined;
	return `${control.configLabel} ${remedy}`;
};

/**
 * What prep is still waiting on before it will open the gate. One clause per
 * config, each true on its own, because two configs waiting is two separate
 * things to go and do rather than one compound sentence.
 *
 * The name comes off the control rather than the roster, so a config that is
 * renamed renames its own refusal. A control is only ever present while its
 * pick is legal, which is what keeps this in step with the engine's own hold.
 */
export const commitmentRemedy = (
	frame: Pick<PrepFrame, "estimate" | "estimatedCorrect" | "sla" | "slaBand">
): string | undefined => {
	const clauses = [
		owedClause(frame.estimate, frame.estimatedCorrect, NO_BET_REMEDY),
		owedClause(frame.sla, frame.slaBand, NO_PROMISE_REMEDY),
	].filter((clause): clause is string => clause !== undefined);

	return clauses.length === 0 ? undefined : clauses.join(READING_JOIN);
};
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

const auditRowFor = (audit: AuditView): AuditsRow => ({
	code: audit.code,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
	...(audit.sentBy === undefined
		? {}
		: { sender: { name: audit.sentBy.name } }),
});

const auditsMetaOf = (count: number) =>
	count === 0 ? NO_AUDITS : `${count} ${AUDIT_COUNT_TRAIL}`;

/**
 * Drawn shut rather than empty: "none this gate" on a gate that could never
 * carry one teaches the player the mechanic does not exist.
 */
export const auditsPanelFor = (
	gate: number,
	audits: readonly AuditView[],
	bill: { bill?: string; note?: string }
): AuditsPanelProps => {
	if (gate < AUDITS_FROM_GATE)
		return {
			title: AUDITS,
			badge: { label: gateLabelOf(AUDITS_FROM_GATE), color: LOCK_COLOR },
			meta: AUDITS_SHUT,
			rows: [],
			...bill,
		};

	return {
		title: AUDITS,
		meta: auditsMetaOf(audits.length),
		rows: audits.map(auditRowFor),
		...bill,
	};
};

const ledgerFor = (
	configs: readonly Config[],
	gate: number,
	storageKb: number,
	space: number
): BillLedger =>
	billLedger({
		configs,
		gate,
		storageKb,
		spaceWeight: spaceRungFor(space).weight,
		spaceBillKb: spaceRungFor(space).kb,
	});

const auditBillFor = (ledger: BillLedger): { bill?: string; note?: string } => {
	if (ledger.totalKb === 0) return {};

	return {
		bill: `${BILL_LEAD} ${signedKbLabel(-ledger.totalKb)} ${BILL_TRAIL}`,
		note:
			ledger.shortfallKb === 0
				? undefined
				: `${kbLabel(ledger.shortfallKb)} short — what you cannot pay lapses.`,
	};
};

/**
 * The standing bill, line by line. The shortfall warning is not restated here:
 * the Audits header already owns that sentence (ADR-102).
 *
 * The Audits header states the total because
 * that is what a player checks before starting a gate; this says what makes it
 * up, which is the only way to know which config to drop when it stops being
 * affordable. Nothing here is new — `billLedger` already had the lines, and no
 * surface had ever read them.
 */
export const subscriptionsLedgerFor = (
	ledger: BillLedger
): LedgerProps | undefined => {
	if (ledger.lines.length === 0) return undefined;

	return {
		title: SUBSCRIPTIONS_TITLE,
		badge: `${ledger.lines.length} ${ledger.lines.length === 1 ? "line" : "lines"} ${BILL_TRAIL}`,
		rows: [
			...ledger.lines.map((line) => ({
				label: line.label,
				figures: [{ label: signedKbLabel(-line.kb), color: BILL_COLOR }],
			})),
			{
				label: BILL_TOTAL,
				total: true,
				figures: [{ label: signedKbLabel(-ledger.totalKb), color: BILL_COLOR }],
			},
		],
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
	const swatch = gateSwatchAt(gate);
	const prefetcher = prefetcherFor(configs);
	const bills = ledgerFor(configs, gate, balanceKb, buildSpace);
	const subscriptions = subscriptionsLedgerFor(bills);

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
		},
		outcomes: bandOutcomesPropsFor(
			{
				gateName: swatch.gateName,
				gate,
				correctThisGate: rightAnswersIn(answeredThisGate),
				held: bar.held,
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
		audits: auditsPanelFor(gate, audits, auditBillFor(bills)),
		...(subscriptions === undefined ? {} : { subscriptions }),
		attack,
		footer: {
			asides: [
				{ label: PREP_COMMUNITY_LABEL, icon: "community", onPress: noop },
			],
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				swatch: { state: "current", swatch },
				onPress: noop,
			},
			note: prepPressNoteOf(gate, bar.units?.held ?? 0),
		},
	};
};
