import {
	COMMUNITY,
	NEW,
	NEW_BADGE,
	NOTHING_NEW,
	STORAGE_BALANCE,
	NEW_POLLS_IN,
} from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import {
	catcherFor,
	flatClearPayoutsOf,
	occupiedSlots,
} from "~/modules/run/build/domain/build.model";
import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
import { clearsUntilDeleted } from "~/modules/run/config/domain/decay.model";
import { gainsOfGate } from "~/modules/run/gate/application/gateGains.viewmodel";
import type { GateCloseView } from "~/modules/run/run/application/gateClose.viewmodel";
import { landedAccuracyTrackFor } from "~/modules/run/run/application/accuracyTrack.viewmodel";
import { runPaidFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type {
	AnsweredPoll,
	PollAuthor,
	AnswerType,
} from "~/modules/run/run/domain/runPoll.model";
import { settledFactsFor } from "~/modules/run/config/application/configChip.viewmodel";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import type {
	GateClosing,
	GateHoldReason,
} from "~/modules/run/gate/domain/gate.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	gateLabelOf,
	gateNumberLabelOf,
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	ESCROW_COMMIT_MULTIPLIER,
	INCIDENT_SURVIVAL_KB,
	PEEL_KB_PER_SLOT,
	SLICE_WINDOW,
	bankedKb,
	failPeelShareFor,
	peelQuotaSlotsFor,
	roundToOneDecimal,
	roundToTwoDecimals,
} from "~/modules/run/run/domain/rules.model";
import { peelRefundIn } from "~/modules/run/run/domain/strip.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import {
	AS_PERCENT,
	coverageGainPercentFor,
	BAND_BONUS,
	isCommittableBand,
} from "~/modules/run/build/domain/coverageRatio.model";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	type CoverageBarProps,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type { BalanceProps } from "~/ui/kanto-theme/Balance.ui";
import type {
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { FoldBadge } from "~/ui/kanto-theme/Fold.ui";
import type {
	GateChoiceProps,
	GatePeelBadge,
	GatePeelBribe,
	GatePeelMix,
	GatePeelOption,
	GatePeelRadio,
	GatePeelSource,
} from "~/ui/kanto-theme/GateChoice.ui";
import type { PollScoresProps } from "~/ui/kanto-theme/PollScores.ui";
import type {
	GateOutcomeRow,
	GateOutcomeRowsPanel,
	GateOutcomeScreenProps,
	GateOutcomeTail,
} from "~/ui/kanto-theme/GateOutcomeScreen.ui";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { revealKindOf } from "~/modules/run/gate/domain/outcomeReveal.model";
import type {
	OutcomeRevealCatcher,
	OutcomeRevealData,
	OutcomeRevealNext,
} from "~/ui/kanto-theme/OutcomeReveal.ui";
import type { LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

export { PEEL_KB_PER_SLOT };

const noop = () => {};

export const GATE_REVIEW_LABEL = "Review answers";
export const GATE_SHOP_LABEL = "To the shop";
export const GATE_COMMUNITY_LABEL = COMMUNITY;

const COVERAGE_TITLE = "By category";
const STORAGE_TITLE = "Payout";
const CHANGES_TITLE = "Build changes";
const ANSWERS_TITLE = "The five answers";

const BONUS_TITLE = "Band bonus";
const ENDING_TITLE = "The run ends here";
const SUMMIT_TITLE = "The climb is done";
const DROP_TITLE = "Or drop configs";
const BRIBE_TITLE = "Pay from storage";
const BRIBE_SPENT = "Nothing left for storage to cover";
const BRIBE_NOTHING = "the drops already settle the peel";
const CATCH_FIRST = "drop first";
const CATCH_TITLE = "Drop the catch first";
const CATCH_NOTE = "it saved the run · pays its weight · refunds nothing";
const CATCH_OPENS = "the other moves open once it is dropped";
const FROM_STORAGE = "from storage";
const FROM_DROPS = "from dropped configs";
const OVERPAID = "overpaid · lost";
const NOTHING_COVERED = "nothing covered yet";
const STORAGE_OPTION = "Storage";
const PEEL_OPTIONS = "Ways to pay the peel";
const PICK_A_CONFIG = "Pick a config";
const NOTHING_COVERS = "Nothing covers the peel";
const RUN_OVER_TITLE = "Run over";

const BALANCE = STORAGE_BALANCE;
const BALANCE_WORD = STORAGE_BALANCE;
const CLEARED_ROW = "Gate cleared";
const BONUS_ROW = "Band bonus";
const PLAN_ROW = "Storage plan";
const CORRECT_ROW = "Correct answers";
const PEEL_ROW = "Peel refund";
const COMMIT_ROW = "Transaction committed";
const SLA_ROW = "Agreement met";
const SLA_NOTE = "the band you promised held";
const SURVIVED_ROW = "Audits survived";
const SURVIVED_NOTE = `${kbLabel(INCIDENT_SURVIVAL_KB)} per incident a rival fired`;
const ROLLBACK_ROW = "Transaction rolled back";

const EARNED_TITLE = "Earned";
const EARNED_HINT = "Dex and Appearance update right away.";
const UNLOCKED_VERB = "unlocked";
const NEW_CONFIG = "new config";
const NEW_TITLE = "new title";
const TITLE_GLYPH = "✦";
const SWATCH_EARNED_NAME = "swatch earned";
const SWATCH_MISSED_NAME = "swatch missed";
const SWATCH_NEEDS = "needs 100% coverage";
const SWATCH_WORD = "swatch";

const DEPRECATED_VERB = "deprecated";
const REMOVED_VERB = "removed";
const EXPIRING_WORD = "expiring";
const UPGRADED_WORD = "upgraded";
const GATE_LEFT = "1 gate left";
const REPLACE_IN_SHOP = "replace it in the shop";
const NOTHING_MOVED = "nothing moved";
const NOT_PAID = "not paid";
const ROLLED_BACK = "nothing paid";
const NOTHING_PAID = "nothing paid";

const NO_BAND_BONUS = "no band bonus";
const METER_SHORT = "the meter fell short";
const WINDOW_SHORT = "the window came up short";
const CAUGHT_REASON = "the meter never reached the floor — caught";
const CAUGHT_CHIP = "caught";
const METER_NEVER = "the meter never reached the floor";
const NO_RETRY = "no retry, no peel";
const CLIMB_DONE = "the climb is done";
const PEEL_SETTLED = "the peel is settled";

export const BRIBE_LABEL = "Pay the peel from storage";
export const REFUSAL_LABEL = "End the run";
export const NEW_RUN_LABEL = "New run";
export const ONLY_BANKED_CARRIES = "only what banked carries into your archive";
export const REFUSAL_TAIL = "Swatches you earned stay on your profile.";
export const NO_REFUND_NOTE =
	"A drop settles its own sell value and refunds nothing. Whatever you overpay is simply gone.";
export const REFUND_NOTE =
	"Garbage Collection is installed, so every config you drop here also refunds its sell value.";

const GAIN_COLOR = "viridian" as const;
const NEW_COLOR = NEW_BADGE.color;
const BALANCE_ICON = "floppy" as const;
const LOSS_COLOR = "cinnabar" as const;
const TERM_COLOR = "saffron" as const;

const STORAGE_COLOR = "saffron" as const;
const DROP_COLOR = "cerulean" as const;
const OVER_COLOR = "vermillion" as const;

export type GateAnswer = {
	pollId?: string;
	category: CategoryCode;
	question: string;
	outcome: VerdictOutcome;
	share?: number;
	coverage: number;
	units: number;
	answerType: AnswerType;
	options: readonly string[];
	picked: readonly string[];
	correct: readonly string[];
	explanation?: string;
	codeBlock?: string;
	note?: string;
	author?: PollAuthor;
};

export type GateOutcomeFrame = {
	gate: number;
	nextPollsIn?: string;
	closing: GateClosing;
	answers: readonly GateAnswer[];
	swatchGates: readonly number[];
	balanceBeforeKb: number;
	configs: readonly Config[];
	buildSpace?: number;
	unlocked?: readonly { config: Config; detail: string }[];
	titles?: readonly { name: string; detail: string }[];
	paid?: readonly { config: Config; detail: string; kb: number }[];
	upgraded?: readonly { config: Config; detail: string }[];
	removed?: readonly { config: Config; detail: string }[];
	auditIds?: readonly AuditId[];
	chosen?: readonly string[];
	onToggle?: (configId: string) => void;
	fromStorage?: boolean;
	onToggleStorage?: () => void;
	onPick?: (chosen: readonly string[], fromStorage: boolean) => void;
	won?: boolean;
	open?: boolean;
	heldBy?: GateHoldReason;
	peelSlotsRemaining?: number;
	caughtFatalBy?: string;
	slaUpliftKb?: number;
	incidentSurvivalKb?: number;
	bar: CoverageBarProps;
	payouts?: PollScoresProps;
	accuracyMultiplier?: number;
	payoutKb: number;
	clearKb?: number;
	overflowKb?: number;
	interestKb?: number;
	extraPickKb?: number;
	bonusKb: number;
	faucetKb: number;
	escrowCommittedKb?: number;
	escrowRolledBackKb?: number;
	billKb: number;
};

export const signedPercent = (value: number) =>
	`${value < 0 ? "" : "+"}${roundToOneDecimal(value)}%`;

const signedUnits = (units: number) =>
	`${units < 0 ? "" : "+"}${roundToTwoDecimals(units)}`;

export const categoryName = (code: CategoryCode) =>
	CATEGORY_METADATA[code].name;

export const totalCoverage = (answers: readonly GateAnswer[]) =>
	roundToOneDecimal(answers.reduce((sum, answer) => sum + answer.coverage, 0));

const countOf = (answers: readonly GateAnswer[], outcome: VerdictOutcome) =>
	answers.filter((answer) => answer.outcome === outcome).length;

const correctCount = (answers: readonly GateAnswer[]) =>
	countOf(answers, "correct");

export const answerTallyOf = (
	answers: readonly GateAnswer[]
): readonly FoldBadge[] => [
	{ label: `${countOf(answers, "correct")} passed`, color: GAIN_COLOR },
	...(countOf(answers, "partial") === 0
		? []
		: [
				{
					label: `${countOf(answers, "partial")} part`,
					color: TERM_COLOR,
				},
			]),
	...(countOf(answers, "wrong") === 0
		? []
		: [
				{
					label: `${countOf(answers, "wrong")} failed`,
					color: LOSS_COLOR,
				},
			]),
];

export const coverageColor = (value: number) =>
	value < 0 ? LOSS_COLOR : GAIN_COLOR;

const byCategory = (answers: readonly GateAnswer[]) =>
	answers.reduce((groups, answer) => {
		const held = groups.get(answer.category) ?? [];
		return groups.set(answer.category, [...held, answer]);
	}, new Map<CategoryCode, readonly GateAnswer[]>());

const coverageRows = (answers: readonly GateAnswer[]): readonly LedgerRow[] =>
	[...byCategory(answers)].map(([category, polls]) => {
		const gained = totalCoverage(polls);
		return {
			label: categoryName(category),
			tags: [{ label: plural(polls.length, "poll") }],
			figures: [{ label: signedPercent(gained), color: coverageColor(gained) }],
		};
	});

const heldByUnscored = (frame: GateOutcomeFrame): boolean =>
	frame.heldBy === "unscored";

const heldByCatch = (frame: GateOutcomeFrame): boolean =>
	frame.heldBy === "catch";

const isCleared = (frame: GateOutcomeFrame): boolean =>
	frame.closing === "cleared";

const bandOf = (frame: GateOutcomeFrame): CoverageBandId => {
	if (frame.closing === "fatal") return RUN_OVER_BAND;
	if (frame.closing === "held") return SHAKY_BAND;
	return frame.bar.band;
};

const swatchEarnedIn = (frame: GateOutcomeFrame): boolean =>
	frame.swatchGates.includes(frame.gate);

const SWATCH_BANDS = {
	perfect: true,
	healthy: true,
	ok: false,
	shaky: false,
	danger: false,
} satisfies Record<CoverageBandId, boolean>;

const OUTCOME_SUFFIX = {
	perfect: "perfect",
	healthy: "cleared",
	ok: "cleared, thin",
	shaky: "holds",
	danger: "",
} satisfies Record<CoverageBandId, string>;

const RUN_OVER_BAND: CoverageBandId = "danger";
const SHAKY_BAND: CoverageBandId = "shaky";

const titleOf = (band: CoverageBandId, gateName: string) =>
	band === RUN_OVER_BAND
		? RUN_OVER_TITLE
		: `${gateName} ${OUTCOME_SUFFIX[band]}`;

const holdReasonOf = (frame: GateOutcomeFrame): string => {
	if (heldByCatch(frame)) return CAUGHT_REASON;
	if (heldByUnscored(frame)) return WINDOW_SHORT;
	return METER_SHORT;
};

const noteOf = (frame: GateOutcomeFrame, band: CoverageBandId) => {
	if (SWATCH_BANDS[band]) return undefined;
	if (band === "ok") return `cleared on the OK band · ${NO_BAND_BONUS}`;
	if (band === "shaky")
		return frame.nextPollsIn === undefined
			? `${holdReasonOf(frame)} · ${FRESH_POLLS} on the retry`
			: `${holdReasonOf(frame)} · ${pollsNoteOf(frame)}`;

	return `${METER_NEVER} · ${NO_RETRY}`;
};

const shortfallBadgeOf = (shortBy: number): FoldBadge => ({
	label: `short by ${shortBy}%`,
	color: LOSS_COLOR,
});

const payoutOf = (frame: GateOutcomeFrame) =>
	isCleared(frame) ? frame.payoutKb : 0;

const faucetOf = (frame: GateOutcomeFrame) => frame.faucetKb;

const billOf = (frame: GateOutcomeFrame) =>
	isCleared(frame) ? frame.billKb : 0;

const peelBillSlotsOf = (frame: GateOutcomeFrame) =>
	frame.peelSlotsRemaining ??
	peelQuotaSlotsFor(
		occupiedSlots(frame.configs),
		failPeelShareFor(frame.gate),
		frame.gate
	);

const chosenIn = (frame: GateOutcomeFrame) =>
	frame.configs.filter((config) => (frame.chosen ?? []).includes(config.id));

const caughtCatcherOf = (frame: GateOutcomeFrame): Config | undefined =>
	frame.caughtFatalBy === undefined ? undefined : catcherFor(frame.configs);

const unpickedCatcherOf = (frame: GateOutcomeFrame): Config | undefined => {
	const catcher = caughtCatcherOf(frame);
	return catcher !== undefined && !(frame.chosen ?? []).includes(catcher.id)
		? catcher
		: undefined;
};

const refundableIn = (frame: GateOutcomeFrame): readonly Config[] =>
	chosenIn(frame).filter((config) => config !== caughtCatcherOf(frame));

export const peelSlotsOf = (configs: readonly Config[]) =>
	configs.reduce((sum, config) => sum + slotsOf(config), 0);

const peelValueKbOf = (config: Config) => slotsOf(config) * PEEL_KB_PER_SLOT;

const collectsOnDrop = (configs: readonly Config[]) =>
	configs.some((config) => config.refundsPeeledConfigs === true);

const peelRefundFor = (configs: readonly Config[], chosen: readonly Config[]) =>
	chosen.reduce((sum, config) => sum + peelRefundIn(configs, config), 0);

const balanceChangeOf = (frame: GateOutcomeFrame) =>
	balanceOf(frame) - frame.balanceBeforeKb;

const balanceOf = (frame: GateOutcomeFrame) =>
	frame.balanceBeforeKb +
	payoutOf(frame) +
	(isCleared(frame)
		? (frame.paid ?? []).reduce((sum, row) => sum + row.kb, 0)
		: peelRefundFor(frame.configs, refundableIn(frame))) -
	billOf(frame);

const auditsOf = (frame: GateOutcomeFrame): readonly AuditProps[] =>
	(frame.auditIds ?? []).map((id) => {
		const audit = auditAt(id, frame.gate);

		return {
			code: audit.code,
			name: audit.name,
			cue: audit.answerCue ?? audit.description,
		};
	});

const outcomeChips = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): readonly FoldBadge[] => [
	{
		label: `${correctCount(frame.answers)} of ${frame.answers.length} right`,
	},
	...(band === RUN_OVER_BAND ? [{ label: `${frame.gate} gates held` }] : []),
	...(frame.caughtFatalBy === undefined
		? []
		: [
				{
					label: `${frame.caughtFatalBy} ${CAUGHT_CHIP}`,
					color: TERM_COLOR,
				},
			]),
	...auditsOf(frame).map((audit) => ({
		label: `${audit.code} fired`,
		color: TERM_COLOR,
	})),
];

const SURPLUS_ROW = "Surplus";
const SURPLUS_NOTE = "past the full bar";
const BONUS_DETAIL = "See an overview of your results.";
const WON_BANKING = "All of the unspent storage banks into your archive.";
const CLIMB_BANKING =
	"how much of the unspent storage banks into your archive is set by how far you climbed.";
const INTEREST_ROW = "Interest";
const INTEREST_NOTE = "on the balance held";
const EXTRA_PICKS_ROW = "Extra picks";
const EXTRA_PICKS_NOTE = "answers past the window";
const FLAT_CLEAR_NOTE = "on the clear";

type GainIdentity = Pick<LedgerRow, "label" | "config">;

const surplusNoteOf = (frame: GateOutcomeFrame): string => {
	const past = roundToOneDecimal(frame.bar.held - AS_PERCENT);
	return past > 0 ? `${past}% ${SURPLUS_NOTE}` : SURPLUS_NOTE;
};

const gainRow = (
	identity: GainIdentity,
	note: string,
	kb: number
): readonly LedgerRow[] =>
	kb === 0
		? []
		: [
				{
					...identity,
					notes: [note],
					figures: [{ label: signedKbLabel(kb), color: GAIN_COLOR }],
				},
			];

const configIdentityOf = (config: Config): GainIdentity => ({
	config: {
		name: config.label,
		slots: slotsOf(config),
		version: config.level ?? 1,
		badges: [],
	},
});

const rewardPartsOf = (frame: GateOutcomeFrame, whole: number) => {
	if (frame.clearKb === undefined) return { clear: whole, rows: [] };

	const flat = flatClearPayoutsOf(frame.configs);
	const flatKb = flat.reduce((total, payout) => total + payout.kb, 0);

	return {
		clear: frame.clearKb - flatKb,
		rows: [
			...flat.flatMap((payout) =>
				gainRow(configIdentityOf(payout.config), FLAT_CLEAR_NOTE, payout.kb)
			),
			...gainRow(
				{ label: SURPLUS_ROW },
				surplusNoteOf(frame),
				frame.overflowKb ?? 0
			),
			...gainRow({ label: INTEREST_ROW }, INTEREST_NOTE, frame.interestKb ?? 0),
			...gainRow(
				{ label: EXTRA_PICKS_ROW },
				EXTRA_PICKS_NOTE,
				frame.extraPickKb ?? 0
			),
		],
	};
};

const isGainRow = (row: LedgerRow): boolean =>
	row.total !== true &&
	(row.figures ?? []).some(
		(figure) => "color" in figure && figure.color === GAIN_COLOR
	);

const storageSummaryOf = (rows: readonly LedgerRow[], bill: number): string =>
	[
		plural(rows.filter(isGainRow).length, "payout"),
		...(bill === 0 ? [] : [plural(1, "bill")]),
	].join(", ");

const balanceRow = (frame: GateOutcomeFrame): LedgerRow => {
	const after = balanceOf(frame);

	return {
		label: BALANCE,
		total: true,
		figures: [
			{ label: `${frame.balanceBeforeKb} →`, tone: "quiet" as const },
			{ label: kbLabel(after), color: GAIN_COLOR, icon: BALANCE_ICON },
		],
	};
};

const bonusNoteOf = (band: CoverageBandId): string =>
	isCommittableBand(band)
		? `×${BAND_BONUS[band]} on a ${COVERAGE_BAND_WORD[band]} close`
		: "";

const clearedStorageRows = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): readonly LedgerRow[] => {
	const payout = payoutOf(frame);
	const bonus = frame.bonusKb;
	const committed = frame.escrowCommittedKb ?? 0;
	const uplift = frame.slaUpliftKb ?? 0;
	const survival = frame.incidentSurvivalKb ?? 0;
	const bill = billOf(frame);
	const parts = rewardPartsOf(
		frame,
		payout - bonus - committed - uplift - survival
	);

	return [
		{
			label: CLEARED_ROW,
			figures: [{ label: signedKbLabel(parts.clear), color: GAIN_COLOR }],
		},
		...parts.rows,
		...gainRow({ label: SLA_ROW }, SLA_NOTE, uplift),
		...gainRow({ label: SURVIVED_ROW }, SURVIVED_NOTE, survival),
		...(committed === 0
			? []
			: [
					{
						label: COMMIT_ROW,
						notes: [`×${ESCROW_COMMIT_MULTIPLIER} on what the gate held`],
						figures: [{ label: signedKbLabel(committed), color: GAIN_COLOR }],
					},
				]),
		...(bonus === 0
			? []
			: [
					{
						label: BONUS_ROW,
						notes: [bonusNoteOf(band)],
						figures: [{ label: signedKbLabel(bonus), color: GAIN_COLOR }],
					},
				]),
		...(frame.paid ?? []).map((row) => ({
			label: row.config.label,
			notes: [row.detail],
			figures: [{ label: signedKbLabel(row.kb), color: GAIN_COLOR }],
		})),
		...(bill === 0
			? []
			: [
					{
						label: PLAN_ROW,
						figures: [{ label: signedKbLabel(-bill), color: LOSS_COLOR }],
					},
				]),
		balanceRow(frame),
	];
};

const heldStorageRows = (frame: GateOutcomeFrame): readonly LedgerRow[] => {
	const faucet = faucetOf(frame);
	const refund = peelRefundFor(frame.configs, refundableIn(frame));
	const rolledBack = frame.escrowRolledBackKb ?? 0;

	return [
		{
			label: CLEARED_ROW,
			figures: [{ label: NOT_PAID, tone: "quiet" as const }],
		},
		...(rolledBack === 0
			? []
			: [
					{
						label: ROLLBACK_ROW,
						notes: [`${kbLabel(rolledBack * ESCROW_COMMIT_MULTIPLIER)} unpaid`],
						figures: [{ label: ROLLED_BACK, tone: "quiet" as const }],
					},
				]),
		...(faucet === 0
			? []
			: [
					{
						label: CORRECT_ROW,
						figures: [{ label: signedKbLabel(faucet), color: GAIN_COLOR }],
					},
				]),
		...(refund === 0
			? []
			: [
					{
						label: PEEL_ROW,
						figures: [{ label: signedKbLabel(refund), color: GAIN_COLOR }],
					},
				]),
		balanceRow(frame),
	];
};

const storageRowsOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	isCleared(frame) ? clearedStorageRows(frame, band) : heldStorageRows(frame);

const answerRows = (answers: readonly GateAnswer[]): readonly LedgerRow[] =>
	answers.map((answer) => ({
		verdict: answer.outcome,
		share: answer.share,
		tags: [{ label: categoryName(answer.category) }],
		detail: answer.question,
		figures: [
			{
				label: signedUnits(answer.units),
				color: coverageColor(answer.units),
			},
		],
	}));

type DropChipFrame = {
	config: Config;
	configs: readonly Config[];
	chosen: boolean;
	locked: boolean;
	first: boolean;
	caught: boolean;
	onToggle: () => void;
};

const dropChip = ({
	config,
	configs,
	chosen,
	locked,
	first,
	caught,
	onToggle,
}: DropChipFrame): ConfigChipProps => {
	const refund = caught ? 0 : peelRefundIn(configs, config);

	const badges: ConfigChipBadge[] = [
		...(first ? [{ label: CATCH_FIRST, color: LOSS_COLOR }] : []),
		{ label: kbLabel(peelValueKbOf(config)), color: TERM_COLOR },
		...(refund === 0
			? []
			: [{ label: signedKbLabel(refund), color: GAIN_COLOR }]),
	];

	return {
		name: config.label,
		slots: slotsOf(config),
		version: config.level ?? 1,
		lost: chosen,
		badges,
		pick: {
			label: `${chosen ? "Keep" : "Drop"} ${config.label}`,
			checked: chosen,
			disabled: locked,
			onToggle,
		},
		info: settledFactsFor(config),
	};
};

export const peelTallyOf = (billKb: number, paidKb: number): string => {
	const over = paidKb - billKb;

	if (paidKb === 0) return NOTHING_COVERED;
	if (over > 0) return `${PEEL_SETTLED} · ${kbLabel(over)} over`;
	if (over === 0) return PEEL_SETTLED;

	return `${kbLabel(paidKb)} of ${kbLabel(billKb)} covered`;
};

export type PeelSettlement = {
	billSlots: number;
	droppedSlots: number;
	storageSlots: number;
	overSlots: number;
	owedKb: number;
	paidKb: number;
	storageKb: number;
	balanceKb: number;
};

export const peelSettlementOf = (frame: GateOutcomeFrame): PeelSettlement => {
	const billSlots = peelBillSlotsOf(frame);
	const balanceKb = balanceOf(frame);
	const droppedSlots = peelSlotsOf(chosenIn(frame));
	const counted = Math.min(droppedSlots, billSlots);
	const affordable = Math.floor(balanceKb / PEEL_KB_PER_SLOT);
	const offered = Math.min(billSlots - counted, Math.max(0, affordable));
	const storageSlots = frame.fromStorage === true ? offered : 0;

	return {
		billSlots,
		droppedSlots: counted,
		storageSlots,
		overSlots: droppedSlots - counted,
		owedKb: (billSlots - counted - storageSlots) * PEEL_KB_PER_SLOT,
		paidKb: (droppedSlots + storageSlots) * PEEL_KB_PER_SLOT,
		storageKb: offered * PEEL_KB_PER_SLOT,
		balanceKb,
	};
};

export type PeelMove = { kind: "storage" } | { kind: "config"; config: Config };

export type PeelPlan =
	| { kind: "settled" }
	| {
			kind: "single";
			storage: boolean;
			singles: readonly Config[];
			move?: PeelMove;
	  }
	| { kind: "mix" }
	| { kind: "stuck" };

export type PeelPicks = { chosen: readonly string[]; fromStorage: boolean };

const catchSlotsOf = (frame: GateOutcomeFrame): number => {
	const catcher = caughtCatcherOf(frame);
	return catcher === undefined ? 0 : slotsOf(catcher);
};

const owedAfterCatchKbOf = (frame: GateOutcomeFrame): number =>
	Math.max(0, peelBillSlotsOf(frame) - catchSlotsOf(frame)) * PEEL_KB_PER_SLOT;

const looseConfigsOf = (frame: GateOutcomeFrame): readonly Config[] =>
	frame.configs.filter((config) => config !== caughtCatcherOf(frame));

const storageCoversKb = (frame: GateOutcomeFrame, owedKb: number): boolean =>
	Math.floor(Math.max(0, frame.balanceBeforeKb) / PEEL_KB_PER_SLOT) *
		PEEL_KB_PER_SLOT >=
	owedKb;

const reachKbOf = (frame: GateOutcomeFrame): number => {
	const loose = looseConfigsOf(frame);

	return (
		Math.max(0, frame.balanceBeforeKb) +
		peelRefundFor(frame.configs, loose) +
		peelSlotsOf(loose) * PEEL_KB_PER_SLOT
	);
};

const pickedIn = (frame: GateOutcomeFrame, config: Config): boolean =>
	(frame.chosen ?? []).includes(config.id);

const moveOf = (
	frame: GateOutcomeFrame,
	storage: boolean,
	singles: readonly Config[]
): PeelMove | undefined => {
	const picked = singles.find((config) => pickedIn(frame, config));
	if (picked !== undefined) return { kind: "config", config: picked };

	return storage ? { kind: "storage" } : undefined;
};

export const peelPlanOf = (frame: GateOutcomeFrame): PeelPlan => {
	const owedKb = owedAfterCatchKbOf(frame);
	if (owedKb === 0) return { kind: "settled" };

	const storage = storageCoversKb(frame, owedKb);
	const singles = looseConfigsOf(frame).filter(
		(config) => peelValueKbOf(config) >= owedKb
	);

	if (storage || singles.length > 0)
		return {
			kind: "single",
			storage,
			singles,
			move: moveOf(frame, storage, singles),
		};

	return reachKbOf(frame) >= owedKb ? { kind: "mix" } : { kind: "stuck" };
};

const keptCatchIdsOf = (frame: GateOutcomeFrame): readonly string[] => {
	const catcher = caughtCatcherOf(frame);
	return catcher !== undefined && pickedIn(frame, catcher) ? [catcher.id] : [];
};

export const peelPicksOf = (frame: GateOutcomeFrame): PeelPicks => {
	if (unpickedCatcherOf(frame) !== undefined)
		return { chosen: [], fromStorage: false };

	const plan = peelPlanOf(frame);
	const kept = keptCatchIdsOf(frame);

	if (plan.kind === "settled") return { chosen: kept, fromStorage: false };
	if (plan.kind === "single")
		return {
			chosen:
				plan.move?.kind === "config" ? [...kept, plan.move.config.id] : kept,
			fromStorage: plan.move?.kind === "storage",
		};

	return {
		chosen: frame.chosen ?? [],
		fromStorage: frame.fromStorage === true,
	};
};

const pickedFrameOf = (frame: GateOutcomeFrame): GateOutcomeFrame =>
	frame.closing === "held" ? { ...frame, ...peelPicksOf(frame) } : frame;

const sourcesOf = (settlement: PeelSettlement): readonly GatePeelSource[] =>
	[
		{
			label: FROM_STORAGE,
			slots: settlement.storageSlots,
			color: STORAGE_COLOR,
		},
		{ label: FROM_DROPS, slots: settlement.droppedSlots, color: DROP_COLOR },
		{ label: OVERPAID, slots: settlement.overSlots, color: OVER_COLOR },
	].filter((source) => source.slots > 0);

const bribeNoteOf = (
	catcher: Config | undefined,
	nothingToPay: boolean,
	leftKb: number
): string => {
	if (catcher !== undefined) return `drop ${catcher.label} first`;
	return nothingToPay
		? BRIBE_NOTHING
		: `storage drops to ${kbLabel(leftKb)} · your build stays intact`;
};

const bribeOf = (
	settlement: PeelSettlement,
	frame: GateOutcomeFrame
): GatePeelBribe => {
	const { storageKb, balanceKb } = settlement;
	const nothingToPay = storageKb === 0;
	const catcher = unpickedCatcherOf(frame);

	return {
		title: BRIBE_TITLE,
		balance: `you have ${kbLabel(balanceKb)}`,
		label: nothingToPay ? BRIBE_SPENT : `Pay ${kbLabel(storageKb)} of the peel`,
		note: bribeNoteOf(catcher, nothingToPay, balanceKb - storageKb),
		cost: signedKbLabel(-storageKb),
		pick: {
			label: BRIBE_LABEL,
			checked: frame.fromStorage === true,
			disabled: nothingToPay || catcher !== undefined,
			onToggle: () => frame.onToggleStorage?.(),
		},
	};
};

const dropNoteOf = (
	frame: GateOutcomeFrame,
	catcher: Config | undefined
): string => {
	if (catcher !== undefined) return `opens once ${catcher.label} is dropped`;
	return collectsOnDrop(frame.configs) ? REFUND_NOTE : NO_REFUND_NOTE;
};

const chipFor =
	(frame: GateOutcomeFrame, owedKb: number) =>
	(config: Config): ConfigChipProps => {
		const catcher = unpickedCatcherOf(frame);
		const picked = pickedIn(frame, config);
		const locked =
			catcher === undefined
				? owedKb === 0 && !picked
				: config.id !== catcher.id;

		return dropChip({
			config,
			configs: frame.configs,
			chosen: picked,
			locked,
			first: config.id === catcher?.id,
			caught: config === caughtCatcherOf(frame),
			onToggle: () => frame.onToggle?.(config.id),
		});
	};

const mixOf = (frame: GateOutcomeFrame): GatePeelMix => {
	const settlement = peelSettlementOf(frame);

	return {
		kind: "mix",
		bill: settlement.billSlots,
		sources: sourcesOf(settlement),
		bribe: bribeOf(settlement, frame),
		drop: {
			title: DROP_TITLE,
			note: dropNoteOf(frame, unpickedCatcherOf(frame)),
			configs: looseConfigsOf(frame).map(chipFor(frame, settlement.owedKb)),
		},
	};
};

const valueBadgesOf = (
	frame: GateOutcomeFrame,
	config: Config
): readonly GatePeelBadge[] => {
	const refund = peelRefundIn(frame.configs, config);

	return [
		{ label: kbLabel(peelValueKbOf(config)), color: TERM_COLOR },
		...(refund === 0
			? []
			: [{ label: signedKbLabel(refund), color: GAIN_COLOR }]),
	];
};

const lossOf = (move: PeelMove | undefined, owedKb: number) => {
	if (move?.kind !== "config") return undefined;

	const valueKb = peelValueKbOf(move.config);
	return valueKb > owedKb
		? `${kbLabel(valueKb)} for ${kbLabel(owedKb)} · ${signedKbLabel(owedKb - valueKb)} lost`
		: undefined;
};

const radioOf = (
	frame: GateOutcomeFrame,
	plan: Extract<PeelPlan, { kind: "single" }>
): GatePeelRadio => {
	const owedKb = owedAfterCatchKbOf(frame);
	const locked = unpickedCatcherOf(frame) !== undefined;
	const kept = keptCatchIdsOf(frame);
	const storageRow: GatePeelOption = {
		name: STORAGE_OPTION,
		badges: [{ label: kbLabel(owedKb), color: TERM_COLOR }],
		pick: {
			label: BRIBE_LABEL,
			checked: !locked && plan.move?.kind === "storage",
			disabled: locked,
			onToggle: () => frame.onPick?.(kept, true),
		},
	};
	const configRow = (config: Config): GatePeelOption => ({
		name: config.label,
		badges: valueBadgesOf(frame, config),
		pick: {
			label: `Drop ${config.label}`,
			checked:
				!locked && plan.move?.kind === "config" && plan.move.config === config,
			disabled: locked,
			onToggle: () => frame.onPick?.([...kept, config.id], false),
		},
	});
	const loss = lossOf(plan.move, owedKb);

	return {
		kind: "radio",
		label: PEEL_OPTIONS,
		rows: [
			...(plan.storage ? [storageRow] : []),
			...plan.singles.map(configRow),
		],
		...(loss === undefined ? {} : { loss }),
	};
};

const optionsOf = (
	frame: GateOutcomeFrame,
	plan: PeelPlan
): GatePeelRadio | GatePeelMix | undefined => {
	if (plan.kind === "single") return radioOf(frame, plan);
	if (plan.kind === "mix") return mixOf(frame);
	return undefined;
};

const FRESH_POLLS = plural(SLICE_WINDOW, "fresh poll");
const NEW_RUN_WAITS = "a new run waits for them too";

const lowerFirst = (text: string) =>
	`${text.charAt(0).toLowerCase()}${text.slice(1)}`;

const pollsNoteOf = (frame: GateOutcomeFrame): string =>
	frame.nextPollsIn === undefined
		? FRESH_POLLS
		: lowerFirst(NEW_POLLS_IN(frame.nextPollsIn));

const refusalNoteOf = (frame: GateOutcomeFrame): string => {
	const banks = `no retry, bank ${kbLabel(bankedKb(frame.balanceBeforeKb, frame.gate, false))}`;
	return frame.nextPollsIn === undefined
		? banks
		: `${banks} · ${NEW_RUN_WAITS}`;
};

const shortNoteOf = (haveKb: number, owedKb: number) =>
	`you have ${kbLabel(haveKb)} · ${kbLabel(owedKb - haveKb)} short`;

const retryLabelOf = (gate: number) => `Retry gate ${gate}`;

const movePressOf = (
	frame: GateOutcomeFrame,
	move: PeelMove | undefined,
	owedKb: number
): PeelPress => {
	const balanceKb = frame.balanceBeforeKb;

	if (move === undefined)
		return { label: PICK_A_CONFIG, note: shortNoteOf(balanceKb, owedKb) };

	if (move.kind === "storage")
		return {
			label: BRIBE_TITLE,
			note: `${kbLabel(balanceKb)} → ${kbLabel(balanceKb - owedKb)} · ${pollsNoteOf(frame)}`,
			onPress: noop,
		};

	const refund = peelRefundIn(frame.configs, move.config);
	return {
		label: `Drop ${move.config.label}`,
		note:
			refund === 0
				? pollsNoteOf(frame)
				: `${pollsNoteOf(frame)} · ${signedKbLabel(refund)} back`,
		onPress: noop,
	};
};

type PeelPress = { label: string; note: string; onPress?: () => void };

const peelPressOf = (frame: GateOutcomeFrame): PeelPress => {
	const catcher = unpickedCatcherOf(frame);
	if (catcher !== undefined)
		return { label: `Drop ${catcher.label} first`, note: CATCH_OPENS };

	const plan = peelPlanOf(frame);
	const owedKb = owedAfterCatchKbOf(frame);

	if (plan.kind === "settled")
		return {
			label: retryLabelOf(frame.gate),
			note: pollsNoteOf(frame),
			onPress: noop,
		};
	if (plan.kind === "single") return movePressOf(frame, plan.move, owedKb);
	if (plan.kind === "stuck")
		return {
			label: NOTHING_COVERS,
			note: shortNoteOf(reachKbOf(frame), owedKb),
		};

	const { billSlots, paidKb, owedKb: leftKb } = peelSettlementOf(frame);
	return {
		label: retryLabelOf(frame.gate),
		note: peelTallyOf(billSlots * PEEL_KB_PER_SLOT, paidKb),
		...(leftKb === 0 ? { onPress: noop } : {}),
	};
};

const owedOf = (frame: GateOutcomeFrame): string | undefined => {
	const owedKb =
		unpickedCatcherOf(frame) === undefined
			? owedAfterCatchKbOf(frame)
			: peelBillSlotsOf(frame) * PEEL_KB_PER_SLOT;

	return owedKb === 0 ? undefined : kbLabel(owedKb);
};

const choiceOf = (frame: GateOutcomeFrame): GateChoiceProps => {
	const caught = caughtCatcherOf(frame);
	const options = optionsOf(frame, peelPlanOf(frame));
	const owed = owedOf(frame);

	return {
		meta: `Gate ${frame.gate} held · ${COVERAGE_BAND_WORD[frame.bar.band]}`,
		...(owed === undefined ? {} : { owed }),
		...(caught === undefined
			? {}
			: {
					catch: {
						title: CATCH_TITLE,
						note: CATCH_NOTE,
						config: chipFor(frame, owedAfterCatchKbOf(frame))(caught),
					},
				}),
		...(options === undefined ? {} : { options }),
		refusal: {
			note: refusalNoteOf(frame),
			action: { label: REFUSAL_LABEL, onPress: noop },
		},
	};
};

const endingOf = (frame: GateOutcomeFrame, band: CoverageBandId) => ({
	title: band === RUN_OVER_BAND ? ENDING_TITLE : SUMMIT_TITLE,
	detail: `${frame.gate} gates held, ${plural(frame.configs.length, "config")} built, ${kbLabel(balanceOf(frame))} unspent. The swatches you earned stay on your profile. The build does not carry; ${frame.won ? WON_BANKING : CLIMB_BANKING}`,
});

const footerOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId,
	nextName: string | undefined
): GateOutcomeScreenProps["footer"] => {
	if (band === RUN_OVER_BAND || frame.won === true)
		return {
			asides: [
				{ label: GATE_REVIEW_LABEL, icon: "review", onPress: noop },
				{ label: GATE_COMMUNITY_LABEL, icon: "community", onPress: noop },
			],
			note: ONLY_BANKED_CARRIES,
			action: { label: NEW_RUN_LABEL, onPress: noop },
		};

	if (band === SHAKY_BAND) {
		const { note, ...action } = peelPressOf(frame);

		return {
			asides: [{ label: GATE_REVIEW_LABEL, icon: "review", onPress: noop }],
			note,
			action,
		};
	}

	return {
		asides: [
			{ label: GATE_REVIEW_LABEL, icon: "review", onPress: noop },
			{ label: GATE_COMMUNITY_LABEL, icon: "community", onPress: noop },
		],
		note:
			nextName === undefined
				? CLIMB_DONE
				: `the shop stays open until the next gate starts`,
		action: { label: GATE_SHOP_LABEL, icon: "shop", onPress: noop },
	};
};

const bonusPanelOf = (frame: GateOutcomeFrame) => ({
	title: BONUS_TITLE,
	badges: [
		{
			label: signedKbLabel(frame.bonusKb),
			color: GAIN_COLOR,
		},
	],
	open: frame.open,
	detail: BONUS_DETAIL,
});

const unlockRowOf = ({
	config,
	detail,
}: {
	config: Config;
	detail: string;
}): GateOutcomeRow => ({
	lead: { weight: slotsOf(config), color: NEW_COLOR },
	name: config.label,
	verb: UNLOCKED_VERB,
	detail,
	badge: { label: NEW_CONFIG, color: NEW_COLOR },
});

const titleRowOf = ({
	name,
	detail,
}: {
	name: string;
	detail: string;
}): GateOutcomeRow => ({
	lead: { glyph: TITLE_GLYPH },
	name,
	detail,
	badge: { label: NEW_TITLE, color: NEW_COLOR },
});

const swatchCountOf = (frame: GateOutcomeFrame): string =>
	`${roundToOneDecimal(Math.min(AS_PERCENT, frame.bar.held))}%`;

const swatchRowOf = (
	frame: GateOutcomeFrame,
	swatch: GateSwatch
): GateOutcomeRow => {
	const count = swatchCountOf(frame);
	if (swatchEarnedIn(frame))
		return {
			lead: { swatch: { state: "discovered", swatch } },
			name: `${swatch.gateName} ${SWATCH_EARNED_NAME}`,
			detail: SWATCH_NEEDS,
			badge: { label: count, color: GAIN_COLOR },
		};

	return {
		lead: { swatch: { state: "current", swatch } },
		name: `${swatch.gateName} ${SWATCH_MISSED_NAME}`,
		detail: SWATCH_NEEDS,
		badge: { label: count },
	};
};

const earnedPanelOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId,
	swatch: GateSwatch
): GateOutcomeRowsPanel | undefined => {
	const gains = [
		...(frame.unlocked ?? []).map(unlockRowOf),
		...(frame.titles ?? []).map(titleRowOf),
	];
	const swatchRows =
		SWATCH_BANDS[band] || swatchEarnedIn(frame)
			? [swatchRowOf(frame, swatch)]
			: [];
	if (gains.length === 0 && swatchRows.length === 0) return undefined;

	const swatchSummary =
		swatchRows.length === 0 ? [] : [`${SWATCH_WORD} ${swatchCountOf(frame)}`];

	return {
		title: EARNED_TITLE,
		summary:
			gains.length === 0
				? [NOTHING_NEW, ...swatchSummary].join(" · ")
				: undefined,
		badges:
			gains.length === 0
				? []
				: [{ label: `${gains.length} ${NEW}`, color: NEW_COLOR }],
		open: frame.open ?? gains.length > 0,
		rows: [...gains, ...swatchRows],
		hint: gains.length === 0 ? undefined : EARNED_HINT,
	};
};

const isExpiring = (config: Config): boolean =>
	clearsUntilDeleted(config) === 1;

const expiringRowOf = (
	config: Config,
	nextGateName: string | undefined
): GateOutcomeRow => ({
	lead: { weight: slotsOf(config) },
	name: config.label,
	versions: { to: config.level ?? 1 },
	verb: DEPRECATED_VERB,
	detail: [
		nextGateName === undefined
			? undefined
			: `deleted when ${nextGateName} clears`,
		REPLACE_IN_SHOP,
	]
		.filter((part) => part !== undefined)
		.join(" · "),
	badge: { label: GATE_LEFT, color: TERM_COLOR },
	edge: TERM_COLOR,
});

const upgradedRowOf = ({
	config,
	detail,
}: {
	config: Config;
	detail: string;
}): GateOutcomeRow => {
	const level = config.level ?? 1;
	return {
		lead: { weight: slotsOf(config) },
		name: config.label,
		versions: { from: Math.max(1, level - 1), to: level },
		detail,
		badge: { label: UPGRADED_WORD, color: GAIN_COLOR },
	};
};

const removedRowOf = ({
	config,
	detail,
}: {
	config: Config;
	detail: string;
}): GateOutcomeRow => ({
	lead: { weight: slotsOf(config) },
	name: config.label,
	verb: REMOVED_VERB,
	detail,
	badge: { label: `-${slotsOf(config)} weight`, color: LOSS_COLOR },
	edge: LOSS_COLOR,
});

const changesPanelOf = (
	frame: GateOutcomeFrame,
	nextGateName: string | undefined
): GateOutcomeRowsPanel => {
	const expiring = frame.configs.filter(isExpiring);
	const rows = [
		...expiring.map((config) => expiringRowOf(config, nextGateName)),
		...(frame.upgraded ?? []).map(upgradedRowOf),
		...(frame.removed ?? []).map(removedRowOf),
	];

	return {
		title: CHANGES_TITLE,
		summary: rows.length === 0 ? NOTHING_MOVED : undefined,
		badges:
			expiring.length === 0
				? []
				: [{ label: `${expiring.length} ${EXPIRING_WORD}`, color: TERM_COLOR }],
		open: frame.open ?? rows.length > 0,
		rows,
	};
};

const headerBalanceOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): BalanceProps => ({
	kb: balanceOf(frame),
	label: BALANCE_WORD,
	color: COVERAGE_BAND_COLOR[band],
});

const tailOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): GateOutcomeTail | undefined => {
	if (band === SHAKY_BAND) return { choice: choiceOf(frame) };
	if (band === RUN_OVER_BAND || frame.won === true)
		return { ending: endingOf(frame, band) };

	return undefined;
};

export const gateOutcomePropsFor = (
	unpicked: GateOutcomeFrame
): GateOutcomeScreenProps => {
	const frame = pickedFrameOf(unpicked);
	const { gate, answers } = frame;
	const band = bandOf(frame);
	const swatch = gateSwatchAt(gate);
	const next = gateSwatchAt(gate + 1);
	const demand = roundToOneDecimal(frame.bar.healthy);
	const held = roundToOneDecimal(frame.bar.held);
	const shortBy = roundToOneDecimal(Math.max(0, demand - held));
	const cleared = isCleared(frame);
	const earned = earnedPanelOf(frame, band, swatch);
	const gainBadge = {
		label: signedPercent(totalCoverage(answers)),
		color: GAIN_COLOR,
	};

	return {
		header: {
			swatch,
			swatches: swatchTrackFor(frame.swatchGates, cleared ? gate + 1 : gate),
			title: titleOf(band, swatch.gateName),
			subtitle: noteOf(frame, band),
			funds: headerBalanceOf(frame, band),
			badges: outcomeChips(frame, band),
		},
		bar: frame.bar,
		outcome: band,
		...(heldByUnscored(frame) ? { coverageHold: WINDOW_SHORT } : {}),
		...(frame.payouts === undefined ? {} : { payouts: frame.payouts }),
		...(frame.accuracyMultiplier === undefined
			? {}
			: { accuracy: landedAccuracyTrackFor(frame.accuracyMultiplier) }),
		audits: auditsOf(frame),
		...(frame.bonusKb > 0 ? { bonus: bonusPanelOf(frame) } : {}),
		...(earned === undefined ? {} : { earned }),
		coverage: {
			title: COVERAGE_TITLE,
			summary: plural(byCategory(answers).size, "category").replace(
				"categorys",
				"categories"
			),
			badges:
				cleared || heldByUnscored(frame)
					? [gainBadge]
					: [gainBadge, shortfallBadgeOf(shortBy)],
			open: frame.open,
			rows: coverageRows(answers),
		},
		storage: {
			title: STORAGE_TITLE,
			summary: storageSummaryOf(storageRowsOf(frame, band), billOf(frame)),
			badges: cleared
				? [{ label: signedKbLabel(balanceChangeOf(frame)), color: GAIN_COLOR }]
				: [{ label: NOTHING_PAID, color: TERM_COLOR }],
			open: frame.open,
			rows: storageRowsOf(frame, band),
		},
		...(band === RUN_OVER_BAND
			? {}
			: { changes: changesPanelOf(frame, next?.gateName) }),
		answers: {
			title: ANSWERS_TITLE,
			badges: answerTallyOf(answers),
			open: frame.open,
			rows: answerRows(answers),
		},
		tail: tailOf(frame, band),
		footer: footerOf(frame, band, next?.gateName),
	};
};

const coverageOf = (answer: AnsweredPoll): number =>
	answer.coverageEarned ?? -(answer.coverageLost ?? 0);

export const gateAnswersOf = (
	answered: readonly AnsweredPoll[],
	gate: number
): readonly GateAnswer[] =>
	answered.map((answer) => ({
		pollId: answer.id,
		category: answer.category,
		question: answer.question,
		outcome: answer.outcome,
		share: answer.coverageFactors?.correct,
		coverage: coverageGainPercentFor(coverageOf(answer), gate),
		units: coverageOf(answer),
		answerType: answer.answerType ?? "single",
		options: answer.options ?? [...answer.picked, ...(answer.correct ?? [])],
		picked: answer.picked,
		correct: answer.correct ?? [],
		explanation: answer.explanation,
		codeBlock: answer.codeBlock,
		...(answer.author === undefined ? {} : { author: answer.author }),
	}));

const DELETED_DETAIL = "its deprecation ran out";
const LAPSED_DETAIL = "its subscription went unpaid";

const upgradedByOf = (view: RunView): string =>
	`upgraded by ${view.gatePayout.autoUpgradedByConfig?.label ?? "the build"}`;

const upgradedRowsFor = (view: RunView) =>
	view.gatePayout.autoUpgradedConfig === null
		? []
		: [
				{
					config: view.gatePayout.autoUpgradedConfig,
					detail: upgradedByOf(view),
				},
			];

const removedRowsFor = (view: RunView) => [
	...view.gatePayout.deletedConfigs.map((config) => ({
		config,
		detail: DELETED_DETAIL,
	})),
	...view.gatePayout.lapsedConfigs.map((config) => ({
		config,
		detail: LAPSED_DETAIL,
	})),
];

const paidRowsFor = (view: RunView) =>
	view.gatePayout.autoUpgradedConfig === null
		? []
		: [
				{
					config: view.gatePayout.autoUpgradedConfig,
					detail: upgradedByOf(view),
					kb: 0,
				},
			];

export type GatePeelPicks = {
	chosen: readonly string[];
	onToggle: (configId: string) => void;
	fromStorage: boolean;
	onToggleStorage: () => void;
	onPick: (chosen: readonly string[], fromStorage: boolean) => void;
};

export const gateOutcomeFrameOf = (
	view: RunView,
	close: GateCloseView,
	picks: GatePeelPicks
): GateOutcomeFrame => {
	const cleared = close.closing === "cleared";
	const { gate } = close;

	return {
		gate,
		closing: close.closing,
		answers: gateAnswersOf(view.answeredThisGate, gate),
		peelSlotsRemaining: view.peelSlotsRemaining,
		swatchGates: view.swatchGates,
		balanceBeforeKb: view.gatePayout.storageBeforeClearKb ?? view.storage,
		configs: view.configs,
		buildSpace: view.buildSpace.space,
		...gainsOfGate(view, gate),
		upgraded: upgradedRowsFor(view),
		removed: removedRowsFor(view),
		paid: paidRowsFor(view),
		payouts: runPaidFor(view),
		accuracyMultiplier: view.closes.filter((past) => past.gate === gate).at(-1)
			?.multiplier,
		auditIds: close.auditIds,
		chosen: picks.chosen,
		onToggle: picks.onToggle,
		fromStorage: picks.fromStorage,
		onToggleStorage: picks.onToggleStorage,
		onPick: picks.onPick,
		won: view.status === "won",
		heldBy: close.heldBy ?? undefined,
		caughtFatalBy: view.gatePayout.caughtFatalBy ?? undefined,
		slaUpliftKb: cleared ? view.gatePayout.slaUpliftKb : 0,
		incidentSurvivalKb: cleared ? view.gatePayout.incidentSurvivalKb : 0,
		bar: { ...close.ladder, held: close.reached, band: close.band },
		payoutKb: cleared ? view.gatePayout.gateRewardPaidKb : 0,
		clearKb: cleared ? view.gatePayout.clearThisGateKb : 0,
		overflowKb: cleared ? view.gatePayout.overflowThisGateKb : 0,
		interestKb: cleared ? view.gatePayout.interestThisGateKb : 0,
		extraPickKb: cleared ? view.gatePayout.extraPickThisGateKb : 0,
		bonusKb: cleared ? view.gatePayout.bandBonusThisGateKb : 0,
		faucetKb: view.gatePayout.faucetThisGateKb,
		escrowCommittedKb: cleared ? view.gatePayout.escrowCommittedKb : 0,
		escrowRolledBackKb: cleared ? 0 : view.gatePayout.escrowRolledBackKb,
		billKb: view.gatePayout.subscriptionBillKb + view.gatePayout.upkeepBilledKb,
	};
};

export type GateOutcomeScreenHandlers = {
	onReview: () => void;
	onNext: () => void;
	onCommunity?: () => void;
	onRemove?: (configIds: readonly string[], fromStorage: boolean) => void;
	onRefuse?: () => void;
};

export type GateOutcomeScreenFrame = {
	view: RunView;
	close: GateCloseView;
	picks: GatePeelPicks;
	on: GateOutcomeScreenHandlers;
	nextPollsIn?: string;
};

const refusing = (
	tail: GateOutcomeTail | undefined,
	onRefuse: (() => void) | undefined
): GateOutcomeTail | undefined => {
	if (tail?.choice === undefined || onRefuse === undefined) return tail;

	return {
		choice: {
			...tail.choice,
			refusal: {
				...tail.choice.refusal,
				action: { ...tail.choice.refusal.action, onPress: onRefuse },
			},
		},
	};
};

export const gateOutcomeScreenPropsFor = ({
	view,
	close,
	picks,
	on,
	nextPollsIn,
}: GateOutcomeScreenFrame): GateOutcomeScreenProps => {
	const frame = {
		...gateOutcomeFrameOf(view, close, picks),
		...(nextPollsIn === undefined ? {} : { nextPollsIn }),
	};
	const props = gateOutcomePropsFor(frame);
	const paying = peelPicksOf(frame);
	const settles = close.closing === "held" && on.onRemove !== undefined;
	const commits = props.footer.action.onPress !== undefined;
	const onRemove = on.onRemove;

	return {
		...props,
		tail: refusing(props.tail, on.onRefuse),
		footer: {
			...props.footer,
			action: {
				...props.footer.action,
				...(settles && onRemove !== undefined
					? {
							onPress: commits
								? () => onRemove(paying.chosen, paying.fromStorage)
								: undefined,
						}
					: { onPress: on.onNext }),
			},
			asides: (props.footer.asides ?? []).map((aside) => ({
				...aside,
				onPress: aside.icon === "review" ? on.onReview : on.onCommunity,
			})),
		},
	};
};

const NEXT_WORD = "Next:";
const CATCHER_DETAIL = "caught a run-ending gate";
const UNSPENT_WORD = "unspent";
const LOCAL_RUN = "local";

const revealNextOf = (
	frame: GateOutcomeFrame
): { next?: OutcomeRevealNext } => {
	const next = gateSwatchAt(frame.gate + 1);
	if (!isCleared(frame) || frame.won === true || next === undefined) return {};

	return {
		next: {
			swatch: next,
			label: `${NEXT_WORD} ${next.gateName}`,
			detail: gateNumberLabelOf(next.gate),
		},
	};
};

const revealCatcherOf = (
	frame: GateOutcomeFrame
): { catcher?: OutcomeRevealCatcher } =>
	frame.caughtFatalBy === undefined
		? {}
		: { catcher: { name: frame.caughtFatalBy, detail: CATCHER_DETAIL } };

const archiveOf = (frame: GateOutcomeFrame): readonly string[] => [
	RUN_OVER_TITLE,
	gateLabelOf(frame.gate),
	`${kbLabel(balanceOf(frame))} ${UNSPENT_WORD}`,
	REFUSAL_TAIL,
];

export const outcomeRevealOf = (frame: GateOutcomeFrame): OutcomeRevealData => {
	const band = bandOf(frame);
	const swatch = gateSwatchAt(frame.gate);
	const kind = revealKindOf({
		closing: frame.closing,
		band: frame.bar.band,
		heldBy: frame.heldBy,
	});
	const note = noteOf(frame, band);

	return {
		kind,
		swatch,
		title: titleOf(band, swatch.gateName),
		stamp: kind === "caught" ? frame.bar.band : band,
		bar: frame.bar,
		balance: {
			label: BALANCE_WORD,
			fromKb: frame.balanceBeforeKb,
			toKb: balanceOf(frame),
		},
		...(note === undefined ? {} : { note }),
		...revealNextOf(frame),
		...revealCatcherOf(frame),
		...(kind === "ended" ? { archive: archiveOf(frame) } : {}),
	};
};

const NO_PICKS: GatePeelPicks = {
	chosen: [],
	onToggle: noop,
	fromStorage: false,
	onToggleStorage: noop,
	onPick: noop,
};

export type OutcomeRevealFrame = {
	view: RunView;
	close: GateCloseView;
	runNumber?: number | null;
};

export const outcomeRevealFor = ({
	view,
	close,
}: OutcomeRevealFrame): OutcomeRevealData =>
	outcomeRevealOf(gateOutcomeFrameOf(view, close, NO_PICKS));

export const outcomeRevealKeyOf = ({
	view,
	close,
	runNumber = null,
}: OutcomeRevealFrame): string =>
	`${runNumber ?? LOCAL_RUN}:${view.closes.length}:${close.gate}`;
