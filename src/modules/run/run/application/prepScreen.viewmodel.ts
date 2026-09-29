import { AUDITS, COMMUNITY, STORAGE_BALANCE } from "~/shared/lib/copy";
import {
	type Config,
	escrowKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import {
	crowdSubmitterFor,
	catcherFor,
	prefetcherFor,
} from "~/modules/run/build/domain/build.model";
import {
	billLedger,
	type BillLedger,
} from "~/modules/run/config/domain/subscription.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { bandOutcomesPropsFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import { pollPaysPropsFor, strictnessFor } from "./pollPays.viewmodel";
import { AUDITS_FROM_GATE } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	gateNumberLabelOf,
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

import type { KantoColor } from "~/ui/kanto-theme/colors";
import type {
	AuditsPanelProps,
	AuditsRow,
} from "~/ui/kanto-theme/AuditsPanel.ui";
import {
	type CoverageBarProps,
	coverageBandOf,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type { BalanceProps } from "~/ui/kanto-theme/Balance.ui";
import type { LedgerProps } from "~/ui/kanto-theme/Ledger.ui";
import type { LedgerFigure, LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type {
	PollScoreRow,
	PollScoresProps,
} from "~/ui/kanto-theme/PollScores.ui";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { EstimatePickerProps } from "~/ui/kanto-theme/EstimatePicker.ui";
import type { SlaPickerProps } from "~/ui/kanto-theme/SlaPicker.ui";
import type { ApprovalListProps } from "~/ui/kanto-theme/ApprovalList.ui";
import {
	APPROVALS_NEEDED,
	type ApprovalBoard,
} from "~/modules/run/run/domain/approval.model";
import type { RebaseListProps } from "~/ui/kanto-theme/RebaseList.ui";

export const BALANCE_WORD = STORAGE_BALANCE;

const noop = () => {};

export const fundsOf = (kb: number, label: string): BalanceProps => ({
	kb,
	label,
});

const SUMMIT_LINE = "the summit — nothing after this";
const SEALED: LedgerFigure = { locked: true };

export const PREP_COMMUNITY_LABEL = COMMUNITY;
const START_LEAD = "Start";
const READING_JOIN = " · ";

export const PREP_POLLS_TITLE = "The five polls";
const BILL_LEAD = "bills";
const BILL_TRAIL = "on a clear";
const BILL_TOTAL = "Every gate";
const BILL_COLOR: KantoColor = "cinnabar";
const SUBSCRIPTIONS_TITLE = "Subscriptions";
const LOCK_COLOR: KantoColor = "pewter";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "firing this gate";
const AUDITS_SHUT = `Audits are unlocked at ${gateNumberLabelOf(AUDITS_FROM_GATE)}`;
const RUNG_MARKS = "rungs";
const CORRECT_OUTCOME = "correct";

const ESTIMATE_HINT =
	"Call how many of the five you will get right. Meet the number and it pays; fall short and it pays nothing.";
const SLA_HINT =
	"Promise a band before you answer. Close there or better and the gate pays more; miss your own promise and it pays nothing extra.";
const REBASE_HINT =
	"Put the categories you are surest of first — a streak pays, and the opener counts twice for some builds.";

const APPROVAL_HINT =
	"Approve one of the five without reading it. When it comes up it is answered with whatever the room has picked most.";
const NEEDS_APPROVALS = `needs ${APPROVALS_NEEDED} approvals`;
const MIRROR_REFUSAL =
	"The mirror inverts what a majority means, so nothing can be approved this gate.";

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

const approvalListFor = (
	configs: readonly Config[],
	board: ApprovalBoard | null,
	approvedPollId: string | null
): ApprovalListProps | undefined => {
	const approver = crowdSubmitterFor(configs);
	if (approver === undefined || board === null || board.slots.length === 0)
		return undefined;

	const refused = board.refusal !== null;

	return {
		label: approver.label,
		hint: APPROVAL_HINT,
		committed: approvedPollId,
		rows: board.slots.map((slot, index) => ({
			pollId: slot.pollId,
			slot: index + 1,
			category: CATEGORY_METADATA[slot.category].name,
			...(refused || slot.ready ? {} : { refusal: NEEDS_APPROVALS }),
		})),
		...(board.refusal === "mirrored" ? { refusal: MIRROR_REFUSAL } : {}),
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

export const auditsPanelFor = (
	gate: number,
	audits: readonly AuditView[],
	bill: { bill?: string; note?: string }
): AuditsPanelProps => {
	if (gate < AUDITS_FROM_GATE)
		return {
			title: AUDITS,
			badge: {
				label: gateNumberLabelOf(AUDITS_FROM_GATE),
				color: LOCK_COLOR,
			},
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
	space: number,
	spaceBillKb: number
): BillLedger =>
	billLedger({
		configs,
		gate,
		storageKb,
		spaceWeight: spaceRungFor(space).weight,
		spaceBillKb,
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
	configs: readonly Config[];
	audits?: readonly AuditView[];
	balanceKb: number;
	buildSpace: number;
	spaceBillKb: number;
	window: PrepWindow;
	bar: CoverageBarProps;
	unitsHeld: number;
	coverageGainPercent: number;
	peelKb: number;
	payout: (correct: number) => number;
	estimate?: EstimateControl | null;
	estimatedCorrect?: number | null;
	sla?: SlaControl | null;
	slaBand?: CommittableBand | null;
	rebaseSlots?: readonly PollSlot[];
	approval?: ApprovalBoard | null;
	approvedPollId?: string | null;
	swatchGates?: readonly number[];
};

export const prepPropsFor = ({
	gate,
	answeredPolls,
	configs,
	audits = [],
	balanceKb,
	buildSpace,
	spaceBillKb,
	window,
	bar,
	unitsHeld,
	coverageGainPercent,
	peelKb,
	payout,
	estimate = null,
	estimatedCorrect = null,
	sla = null,
	slaBand = null,
	rebaseSlots = [],
	approval = null,
	approvedPollId = null,
	swatchGates = [],
}: PrepFrame): PrepScreenProps => {
	const swatch = gateSwatchAt(gate);
	const prefetcher = prefetcherFor(configs);
	const bills = ledgerFor(configs, gate, balanceKb, buildSpace, spaceBillKb);
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
				swatch,
				gate,
				held: bar.held,
				ladder: bar,
				coverageGainPercent,
				peelKb,
				escrows: escrowKbPerCorrect(configs) > 0,
				catchesFatal: catcherFor(configs) !== undefined,
				payout,
			},
			coverageBandOf(bar.held, bar)
		),
		pays: pollPaysPropsFor(
			{ gate, unitsHeld, configs, ladder: bar, held: bar.held },
			{ ...bar, marks: RUNG_MARKS, pin: true }
		),
		strictness: strictnessFor(gate),
		estimate: estimatePickerFor(gate, estimate, estimatedCorrect),
		sla: slaPickerFor(sla, slaBand),
		rebase: rebaseListFor(configs, rebaseSlots),
		approval: approvalListFor(configs, approval, approvedPollId),
		scores: pollScoresFor(gate, answeredPolls),
		polls: {
			title: PREP_POLLS_TITLE,
			badge: prefetcher?.label,
			rows: pollRowsFor(gate, window, prefetcher !== undefined),
		},
		audits: auditsPanelFor(gate, audits, auditBillFor(bills)),
		...(subscriptions === undefined ? {} : { subscriptions }),
		footer: {
			asides: [
				{ label: PREP_COMMUNITY_LABEL, icon: "community", onPress: noop },
			],
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				swatch: { state: "current", swatch, count: SLICE_WINDOW },
				onPress: noop,
			},
		},
	};
};
