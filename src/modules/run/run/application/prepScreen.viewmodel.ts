import { VENDOR_REMEDY } from "~/modules/run/build/application/vendorChip.viewmodel";
import { stakeBarFor } from "~/modules/run/run/application/gateStake.viewmodel";
import type { FooterAction } from "~/ui/kanto-theme/ScreenFooter.ui";
import {
	AUDITS,
	NEW_BADGE,
	POLLS_SPENT,
	STORAGE_BALANCE,
} from "~/shared/lib/copy";
import {
	type Config,
	escrowKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import {
	crowdSubmitterFor,
	catcherFor,
	gateClearPayout,
	bandBonusOnClear,
	prefetcherFor,
} from "~/modules/run/build/domain/build.model";
import {
	billLedger,
	type BillLedger,
} from "~/modules/run/config/domain/subscription.model";
import {
	gatesClearedBy,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { bandOutcomesPropsFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import { scoringFor } from "./scoring.viewmodel";
import {
	AUDITS_FROM_GATE,
	isAuditFacedIn,
} from "~/modules/run/gate/domain/auditSchedule.model";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	PEEL_KB_PER_SLOT,
	roundToOneDecimal,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import {
	type CommittableBand,
	type CoverageBandId,
	bandOf,
	coverageGainPercentFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	rebaserFor,
	type PollSlot,
} from "~/modules/run/run/domain/rebase.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type {
	EstimateControl,
	OutageTargetView,
	RunView,
	SlaControl,
} from "~/modules/run/run/application/runView.viewmodel";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import type {
	AuditsPanelProps,
	AuditsRow,
} from "~/ui/kanto-theme/AuditsPanel.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { BalanceProps } from "~/ui/kanto-theme/Balance.ui";
import type { LedgerProps } from "~/ui/kanto-theme/Ledger.ui";
import type { LedgerFigure } from "~/ui/kanto-theme/LedgerRows.ui";
import type { PollTile, PollTilesProps } from "~/ui/kanto-theme/PollTiles.ui";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import type { PrepScreenProps } from "~/ui/kanto-theme/PrepScreen.ui";
import type { EstimatePickerProps } from "~/ui/kanto-theme/EstimatePicker.ui";
import type { SlaPickerProps } from "~/ui/kanto-theme/SlaPicker.ui";
import type { ApprovalListProps } from "~/ui/kanto-theme/ApprovalList.ui";
import {
	APPROVALS_NEEDED,
	type ApprovalBoard,
} from "~/modules/run/run/domain/approval.model";
import { accuracyTrackFor } from "~/modules/run/run/application/accuracyTrack.viewmodel";
import type { RebaseListProps } from "~/ui/kanto-theme/RebaseList.ui";

export const BALANCE_WORD = STORAGE_BALANCE;

const noop = () => {};

export const fundsOf = (kb: number, label: string): BalanceProps => ({
	kb,
	label,
});

const SUMMIT_LINE = "the summit — nothing after this";

const PREP_SUBTITLE = "Look at what's at stake!";
const START_LEAD = "Start";
const READING_JOIN = " · ";

export const PREP_POLLS_TITLE = "The five polls";
const SEALED_STATE = "sealed";
const REVEALED_BY = "revealed by";
const NEXT_GATE_LABEL = "next gate";
const OPTIONS_WORD = "options";
const TARGET_LEAD = "takes";
const TARGET_TRAIL = "offline";
const TARGET_PER_POLL_TRAIL = "offline, one a poll";
const WHOLE_BUILD = "the whole build";
const ON_FIRST_POLL = "on poll 1";
const TARGET_JOIN = " · ";
const BILL_SHORT = "short — what you cannot pay lapses.";
const BILL_TRAIL = "on a clear";
const BILL_TOTAL = "Every gate";
const BILL_COLOR: KantoColor = "cinnabar";
const SUBSCRIPTIONS_TITLE = "Subscriptions";
const NO_AUDITS = "none this gate";
const AUDIT_COUNT_TRAIL = "firing this gate";

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

const NO_BET_REMEDY = "has no bet — press a number above";
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

const TIMES = "×";

const categoryFigureLabel = (code: CategoryCode, count: number): string => {
	const { name } = CATEGORY_METADATA[code];

	return count > 1 ? `${name} ${TIMES}${count}` : name;
};

const categoryTally = (codes: readonly CategoryCode[]): LedgerFigure[] => {
	const counts = codes.reduce<Map<CategoryCode, number>>(
		(tally, code) => tally.set(code, (tally.get(code) ?? 0) + 1),
		new Map()
	);

	return [...counts.entries()]
		.sort(([, one], [, other]) => other - one)
		.map(([code, count]) => ({ label: categoryFigureLabel(code, count) }));
};

export type PrepWindow = {
	answerTypes: readonly AnswerType[];
	optionCounts: readonly number[];
	categories: readonly CategoryCode[];
	nextCategories: readonly CategoryCode[];
};

const nextGateFigures = (gate: number, window: PrepWindow): LedgerFigure[] =>
	swatchForGate(gate + 1) === undefined
		? [{ label: SUMMIT_LINE, tone: "quiet" }]
		: categoryTally(window.nextCategories);

const shapeOf = (window: PrepWindow, index: number): string | undefined => {
	const answerType = window.answerTypes[index];
	const options = window.optionCounts[index];
	if (answerType === undefined || options === undefined) return undefined;

	return `${answerType}${READING_JOIN}${options} ${OPTIONS_WORD}`;
};

const revealedTilesFor = (window: PrepWindow): PollTile[] =>
	window.categories.map((code, index) => {
		const shape = shapeOf(window, index);

		return {
			category: CATEGORY_METADATA[code].name,
			...(shape === undefined ? {} : { shape }),
		};
	});

const SEALED_TILES: readonly PollTile[] = Array.from(
	{ length: SLICE_WINDOW },
	() => ({ locked: true })
);

export const pollTilesFor = (
	gate: number,
	window: PrepWindow,
	revealer: Config | undefined
): PollTilesProps => {
	if (revealer === undefined)
		return {
			title: PREP_POLLS_TITLE,
			state: SEALED_STATE,
			tiles: SEALED_TILES,
		};

	return {
		title: PREP_POLLS_TITLE,
		state: `${REVEALED_BY} ${revealer.label}`,
		tiles: revealedTilesFor(window),
		after: [{ label: NEXT_GATE_LABEL, figures: nextGateFigures(gate, window) }],
	};
};

type OutageTargets = readonly (readonly string[])[];

const namesOf = (names: readonly string[]): string => names.join(TARGET_JOIN);

const hitsNothing = (targets: OutageTargets): boolean =>
	targets.every((names) => names.length === 0);

const hitsTheSameEveryPoll = (targets: OutageTargets): boolean =>
	targets.every((names) => namesOf(names) === namesOf(targets[0]));

const hitsTheWholeBuildOnce = (
	targets: OutageTargets,
	buildSize: number
): boolean =>
	targets[0].length === buildSize &&
	targets.slice(1).every((names) => names.length === 0);

export const outageTargetLineFor = (
	targets: OutageTargets,
	buildSize: number
): string | undefined => {
	if (targets.length === 0 || hitsNothing(targets)) return undefined;
	if (hitsTheWholeBuildOnce(targets, buildSize))
		return `${TARGET_LEAD} ${WHOLE_BUILD} ${TARGET_TRAIL} ${ON_FIRST_POLL}`;
	if (hitsTheSameEveryPoll(targets))
		return `${TARGET_LEAD} ${namesOf(targets[0])} ${TARGET_TRAIL}`;
	return `${TARGET_LEAD} ${targets.map(namesOf).join(TARGET_JOIN)} ${TARGET_PER_POLL_TRAIL}`;
};

export type TargetLines = Readonly<Record<string, string>>;

export const targetLinesFor = (
	outageTargets: readonly OutageTargetView[],
	buildSize: number
): TargetLines =>
	Object.fromEntries(
		outageTargets.flatMap((entry) => {
			const line = outageTargetLineFor(entry.targets, buildSize);
			return line === undefined ? [] : [[entry.auditId, line]];
		})
	);

const auditRowFor = (
	audit: AuditView,
	target: string | undefined,
	clearedGates: readonly number[]
): AuditsRow => ({
	code: audit.code,
	name: audit.name,
	cue: audit.answerCue ?? audit.description,
	isNew: !isAuditFacedIn(audit.id, clearedGates),
	...(target === undefined ? {} : { target }),
	...(audit.sentBy === undefined
		? {}
		: { sender: { name: audit.sentBy.name } }),
});

const auditsMetaOf = (count: number) =>
	count === 0 ? NO_AUDITS : `${count} ${AUDIT_COUNT_TRAIL}`;

export type AuditsPanelExtras = {
	bill?: string;
	note?: string;
	targetLines?: TargetLines;
	clearedGates?: readonly number[];
};

export const auditsPanelFor = (
	audits: readonly AuditView[],
	{ targetLines = {}, clearedGates = [], ...bill }: AuditsPanelExtras = {}
): AuditsPanelProps => {
	const rows = audits.map((audit) =>
		auditRowFor(audit, targetLines[audit.id], clearedGates)
	);
	return {
		title: AUDITS,
		meta: auditsMetaOf(audits.length),
		rows,
		...(rows.some((row) => row.isNew === true) ? { badge: NEW_BADGE } : {}),
		...bill,
	};
};

const isAuditedGate = (gate: number): boolean => gate >= AUDITS_FROM_GATE;

export const subscriptionsLedgerFor = (
	ledger: BillLedger
): LedgerProps | undefined => {
	if (ledger.lines.length === 0) return undefined;

	return {
		title: SUBSCRIPTIONS_TITLE,
		meta: [
			{ figure: `${ledger.lines.length}` },
			` ${ledger.lines.length === 1 ? "line" : "lines"} ${BILL_TRAIL}`,
		],
		rows: [
			...ledger.lines.map((line) => ({
				lead: line.weight === undefined ? undefined : `${line.weight}`,
				label: line.label,
				figures: [{ label: signedKbLabel(-line.kb), color: BILL_COLOR }],
			})),
			{
				label: BILL_TOTAL,
				total: true,
				figures: [{ label: signedKbLabel(-ledger.totalKb), color: BILL_COLOR }],
			},
		],
		...(ledger.shortfallKb === 0
			? {}
			: { note: `${kbLabel(ledger.shortfallKb)} ${BILL_SHORT}` }),
	};
};

export type PrepFrame = {
	gate: number;
	configs: readonly Config[];
	audits?: readonly AuditView[];
	balanceKb: number;
	buildSpace: number;
	spaceBillKb: number;
	window: PrepWindow;
	bar: CoverageBarProps;
	coverageGainPercent: number;
	accuracyBonus?: number;
	peelKb: number;
	payout: (correct: number, band: CoverageBandId) => number;
	estimate?: EstimateControl | null;
	estimatedCorrect?: number | null;
	sla?: SlaControl | null;
	slaBand?: CommittableBand | null;
	rebaseSlots?: readonly PollSlot[];
	approval?: ApprovalBoard | null;
	approvedPollId?: string | null;
	swatchGates?: readonly number[];
	outageTargets?: readonly OutageTargetView[] | null;
	clearedGates?: readonly number[];
};

export const prepPropsFor = ({
	gate,
	configs,
	audits = [],
	balanceKb,
	buildSpace,
	spaceBillKb,
	window,
	bar,
	coverageGainPercent,
	accuracyBonus = 0,
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
	outageTargets = null,
	clearedGates = [],
}: PrepFrame): PrepScreenProps => {
	const swatch = gateSwatchAt(gate);
	const prefetcher = prefetcherFor(configs);
	const bills = billLedger({
		configs,
		gate,
		storageKb: balanceKb,
		spaceWeight: buildSpace,
		spaceBillKb,
	});
	const subscriptions = subscriptionsLedgerFor(bills);

	return {
		header: {
			swatch,
			swatches: swatchTrackFor(swatchGates, gate),
			funds: fundsOf(balanceKb, BALANCE_WORD),
			subtitle: PREP_SUBTITLE,
			badges:
				audits.length === 0
					? []
					: [
							{
								label: `${audits.length} ${audits.length === 1 ? "audit" : "audits"}`,
							},
						],
		},
		outcomes: bandOutcomesPropsFor({
			swatch,
			gate,
			held: bar.held,
			ladder: bar,
			coverageGainPercent,
			accuracyBonus,
			peelKb,
			escrows: escrowKbPerCorrect(configs) > 0,
			catchesFatal: catcherFor(configs) !== undefined,
			payout,
		}),
		scoring: scoringFor(gate, accuracyBonus, configs),
		estimate: estimatePickerFor(gate, estimate, estimatedCorrect),
		sla: slaPickerFor(sla, slaBand),
		rebase: rebaseListFor(configs, rebaseSlots),
		approval: approvalListFor(configs, approval, approvedPollId),
		polls: pollTilesFor(gate, window, prefetcher),
		...(isAuditedGate(gate)
			? {
					audits: auditsPanelFor(audits, {
						targetLines: targetLinesFor(outageTargets ?? [], configs.length),
						clearedGates,
					}),
				}
			: {}),
		...(subscriptions === undefined ? {} : { subscriptions }),
		footer: {
			action: {
				label: `${START_LEAD} ${swatch.gateName}`,
				swatch: { state: "current", swatch, count: SLICE_WINDOW },
				shine: true,
				onPress: noop,
			},
		},
	};
};

const BACK_TO_SHOP = "Back to the shop";

export type PrepScreenHandlers = {
	onStart: () => void;
	onBackToShop?: () => void;
	onEstimate?: (count: number) => void;
	onCommitBand?: (band: string) => void;
	onRebase?: (from: number, to: number) => void;
	onApprove?: (pollId: string) => void;
};

export type PrepScreenFrame = {
	view: RunView;
	backLabel?: string;
	startRefusal?: string;
	approval?: ApprovalBoard | null;
	on: PrepScreenHandlers;
};

const windowOf = (view: RunView): PrepWindow => ({
	answerTypes: view.answerTypesThisGate ?? [],
	optionCounts: view.optionCountsThisGate ?? [],
	categories: view.upcomingCategories ?? [],
	nextCategories: view.nextGateCategories ?? [],
});

const asidesFor = (frame: PrepScreenFrame): readonly FooterAction[] =>
	frame.on.onBackToShop === undefined
		? []
		: [
				{
					label: frame.backLabel ?? BACK_TO_SHOP,
					icon: "back",
					iconAt: "lead",
					onPress: frame.on.onBackToShop,
				},
			];

const startRefusalFor = (
	view: RunView,
	stated: string | undefined
): string | undefined => {
	if (stated !== undefined) return stated;
	if (view.pollsExhausted) return POLLS_SPENT;
	if (view.vendorLock.offered) return VENDOR_REMEDY;
	return commitmentRemedy(view);
};

export const prepPayoutFor =
	(configs: readonly Config[], gate: number) =>
	(correct: number, band: CoverageBandId): number => {
		const clearKb = gateClearPayout(configs, correct, gate);
		return clearKb + bandBonusOnClear(configs, bandOf(band), clearKb);
	};

export const prepScreenPropsFor = (frame: PrepScreenFrame): PrepScreenProps => {
	const { view, on } = frame;
	const { gateStake } = view;
	const refusal = startRefusalFor(view, frame.startRefusal);
	const screen = prepPropsFor({
		gate: gateStake.gateNumber,
		configs: view.configs,
		audits: gateStake.audits,
		balanceKb: view.storage,
		buildSpace: view.buildSpace.space,
		spaceBillKb: view.buildSpace.perGateKb,
		window: windowOf(view),
		bar: stakeBarFor(gateStake),
		coverageGainPercent: coverageGainPercentFor(
			gateStake.perAnswer.coveragePerCorrect,
			gateStake.gateNumber
		),
		accuracyBonus: gateStake.accuracy.carried,
		peelKb: gateStake.peelSlotsOnFailure * PEEL_KB_PER_SLOT,
		payout: prepPayoutFor(view.configs, gateStake.gateNumber),
		estimate: view.estimate,
		estimatedCorrect: view.estimatedCorrect,
		sla: view.sla,
		slaBand: view.slaBand,
		rebaseSlots: view.rebaseSlots,
		approval: frame.approval ?? null,
		approvedPollId: view.approvedPollId,
		swatchGates: view.swatchGates,
		outageTargets: view.outageTargets,
		clearedGates: gatesClearedBy(view.ownedSwatchIds),
	});

	return {
		...screen,
		scoring: { ...screen.scoring, track: accuracyTrackFor(view) },
		sla:
			screen.sla === undefined
				? undefined
				: { ...screen.sla, onPick: on.onCommitBand },
		estimate:
			screen.estimate === undefined
				? undefined
				: { ...screen.estimate, onPick: on.onEstimate },
		rebase:
			screen.rebase === undefined
				? undefined
				: { ...screen.rebase, onMove: on.onRebase },
		approval:
			screen.approval === undefined
				? undefined
				: {
						...screen.approval,
						...(screen.approval.refusal === undefined
							? { onApprove: on.onApprove }
							: {}),
					},
		footer: {
			...screen.footer,
			action: {
				...screen.footer.action,
				onPress: refusal === undefined ? on.onStart : undefined,
			},
			asides: asidesFor(frame),
			...(refusal === undefined ? {} : { refusal }),
		},
	};
};
