import { NEEDED } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import {
	flatClearPayoutsOf,
	occupiedSlots,
} from "~/modules/run/build/domain/build.model";
import {
	DRAFT_COST_PER_SLOT_KB,
	describeConfig,
	sellRefund,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import type {
	GateHoldReason,
	GateLadder,
} from "~/modules/run/gate/domain/gate.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	ESCROW_COMMIT_MULTIPLIER,
	FLOOR_CORRECT,
	GATE_COUNT,
	INCIDENT_SURVIVAL_KB,
	SLICE_WINDOW,
	VICTORY_GATE,
	failPeelShareFor,
	peelQuotaSlotsFor,
	roundToOneDecimal,
	roundToTwoDecimals,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import { peelRefundIn } from "~/modules/run/run/domain/strip.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import {
	PERFECT_BONUS,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import {
	type CoverageBandId,
	type CoverageBarProps,
	coverageBandOf,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type {
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { FoldBadge } from "~/ui/kanto-theme/Fold.ui";
import type { GateChoiceProps } from "~/ui/kanto-theme/GateChoice.ui";
import type { PollScoresProps } from "~/ui/kanto-theme/PollScores.ui";
import type {
	GateOutcomeChip,
	GateOutcomeScreenProps,
	GateOutcomeTail,
} from "~/ui/kanto-theme/GateOutcomeScreen.ui";
import type { LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

const noop = () => {};

export const GATE_REVIEW_LABEL = "Review answers";
export const GATE_SHOP_LABEL = "To the shop";
export const GATE_COMMUNITY_LABEL = "Community";

const COVERAGE_TITLE = "By category";
const STORAGE_TITLE = "Payout";
const CHANGES_TITLE = "Build changes";
const ANSWERS_TITLE = "The five answers";

const BONUS_TITLE = "Perfect bonus";
const CHOICE_TITLE = "How this gate ends";
const ENDING_TITLE = "The run ends here";
const SUMMIT_TITLE = "The climb is done";
const DROP_TITLE = "Drop configs instead";
const REFUSAL_TITLE = "End the run here";
const RUN_OVER_TITLE = "Run over";

const THIS_GATE = "this gate";
const BALANCE = "balance";
const BALANCE_WORD = "balance";
const CLEARED_ROW = "gate cleared";
const BONUS_ROW = "perfect bonus";
const PLAN_ROW = "storage plan";
const CORRECT_ROW = "correct answers";
const PEEL_ROW = "peel refund";
const COMMIT_ROW = "transaction committed";
const SLA_ROW = "agreement met";
const SLA_DETAIL = "· the band you promised held";
const SURVIVED_ROW = "audits survived";
const SURVIVED_DETAIL = `· ${kbLabel(INCIDENT_SURVIVAL_KB)} per incident a rival fired`;
const ATTACK_EARNED = "attack earned";
const ROLLBACK_ROW = "transaction rolled back";

const UNLOCKED = "unlocked";
const FADED = "faded";
const NOTHING_MOVED = "nothing moved";
const NOTHING_CHANGED = "none";
const NOT_PAID = "not paid";
const ROLLED_BACK = "nothing paid";
const NOTHING_PAID = "nothing paid";
const STREAK_BROKEN = "streak broken";
const DROP_BADGE = "drop";
const DROPPING_BADGE = "dropping";

const BAR_FILLED = "the bar filled";
const PAYOUT_CUT = "the payout is cut";
const METER_SHORT = "the meter fell short";
const CAUGHT_REASON = "the meter never reached the floor — caught";
const CAUGHT_CHIP = "caught";
const RIGHT_WORD = "right";
const METER_NEVER = "the meter never reached the floor";
const NO_RETRY = "no retry, no peel";
const CLIMB_DONE = "the climb is done";
const PEEL_TO_PAY = "peel to pay";
const PEEL_SETTLED = "the peel is settled";

export const BRIBE_LABEL = "Bribe from the archive";
export const REFUSAL_LABEL = "End the run";
export const NEW_RUN_LABEL = "New run";
export const PEEL_REFUSAL =
	"The gate stays shut until the peel is paid in full.";
export const PEEL_PAID = "The peel is paid. Five fresh polls on the retry.";
export const ARCHIVE_EMPTIES = "the archive empties when the run ends";
export const REFUSAL_NOTE =
	"No peel, no retry. The swatches you earned stay on your profile.";
export const NO_REFUND_NOTE =
	"A drop settles its own sell value and refunds nothing. Whatever you overpay is simply gone.";
export const REFUND_NOTE =
	"Garbage Collection is installed, so every config you drop here also refunds its sell value.";

const GAIN_COLOR = "viridian" as const;
const LOSS_COLOR = "cinnabar" as const;
const TERM_COLOR = "saffron" as const;

export type GateClosing = "cleared" | "held" | "fatal";

const BAND_TICK = 0.1;

const within = (value: number, low: number, high: number) =>
	Math.min(high, Math.max(low, value));

/**
 * A bare build fails its gate however much it covered (`gatePassed` refuses it
 * outright), so the reading and the verdict can disagree. ADR-076 derives the
 * screen's band from the bar, so the bar is what has to be held to the verdict.
 */
export const closedBarFor = (
	closing: GateClosing,
	ladder: GateLadder,
	held: number,
	heldBy?: GateHoldReason
): CoverageBarProps => ({
	...ladder,
	held: closedHeldFor(closing, ladder, held, heldBy),
});

// A floor hold sits on whatever the meter reads, HEALTHY included; clamping it
// down would print a SHAKY bar the run never had (ADR-094). A caught hold is the
// same rule read the other way: the meter really was under the floor, and
// clamping it up would print a SHAKY bar the run never had either (ADR-096).
const closedHeldFor = (
	closing: GateClosing,
	{ floor, ok }: GateLadder,
	held: number,
	heldBy: GateHoldReason | undefined
): number => {
	if (closing === "cleared") return Math.max(ok, held);
	if (closing === "held" && heldBy === "floor") return within(held, 0, 100);
	if (closing === "held" && heldBy === "catch") return within(held, 0, 100);
	if (closing === "held") return within(held, floor, ok - BAND_TICK);

	return within(held, 0, Math.max(0, floor - BAND_TICK));
};

export type GateAnswer = {
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
};

export type GateOutcomeFrame = {
	gate: number;
	answers: readonly GateAnswer[];
	/** Gates this run played flawlessly, so the screen never infers a swatch. */
	swatchGates: readonly number[];
	balanceBeforeKb: number;
	configs: readonly Config[];
	buildSpace?: number;
	streak?: number;
	unlocked?: readonly { config: Config; detail: string }[];
	faded?: readonly { config: Config; detail: string }[];
	paid?: readonly { config: Config; detail: string; kb: number }[];
	auditIds?: readonly AuditId[];
	chosen?: readonly string[];
	onToggle?: (configId: string) => void;
	won?: boolean;
	open?: boolean;
	/** Set when the day's own count held the gate, so the bar may read HEALTHY. */
	heldBy?: GateHoldReason;
	/** The config that turned a fatal close into this one, spent doing it. */
	caughtFatalBy?: string;
	/** What SLA paid for holding to the band it promised. Inside `payoutKb`. */
	slaUpliftKb?: number;
	/** What surviving rivals' audits paid. Inside `payoutKb`. */
	incidentSurvivalKb?: number;
	/** Whether this clear armed or upgraded the run's attack. */
	attackEarned?: boolean;
	bar: CoverageBarProps;
	payouts?: PollScoresProps;
	payoutKb: number;
	/** The parts the reward was paid in. Absent, the gate's row carries the whole payout. */
	clearKb?: number;
	overflowKb?: number;
	interestKb?: number;
	extraPickKb?: number;
	bonusKb: number;
	faucetKb: number;
	/** Database's transaction: committed inside `payoutKb`, or rolled back whole. */
	escrowCommittedKb?: number;
	escrowRolledBackKb?: number;
	billKb: number;
};

export const signedPercent = (value: number) =>
	`${value < 0 ? "" : "+"}${roundToOneDecimal(value)}`;

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

const coverageRows = (
	answers: readonly GateAnswer[],
	demand: number
): readonly LedgerRow[] => {
	const total = totalCoverage(answers);

	return [
		...[...byCategory(answers)].map(([category, polls]) => {
			const gained = totalCoverage(polls);
			return {
				label: categoryName(category),
				tags: [{ label: plural(polls.length, "poll") }],
				figures: [
					{ label: signedPercent(gained), color: coverageColor(gained) },
				],
			};
		}),
		{
			label: THIS_GATE,
			total: true,
			figures: [
				{ label: `${signedPercent(total)}%`, color: coverageColor(total) },
				{ label: `of ${demand}% needed`, tone: "quiet" as const },
			],
		},
	];
};

export const PEEL_KB_PER_SLOT = DRAFT_COST_PER_SLOT_KB / 2;

const heldByFloor = (frame: GateOutcomeFrame): boolean =>
	frame.heldBy === "floor";

const heldByCatch = (frame: GateOutcomeFrame): boolean =>
	frame.heldBy === "catch";

// Both read off `heldBy` rather than the bar: each one holds a gate whose meter
// says something else, which is the whole reason they are worth naming.
const bandOf = (frame: GateOutcomeFrame): CoverageBandId =>
	heldByFloor(frame) || heldByCatch(frame)
		? SHAKY_BAND
		: coverageBandOf(frame.bar.held, frame.bar);

const dayCountOf = (frame: GateOutcomeFrame): string =>
	`${correctCount(frame.answers)} of ${SLICE_WINDOW} ${RIGHT_WORD}`;

const swatchEarnedIn = (frame: GateOutcomeFrame): boolean =>
	frame.swatchGates.includes(frame.gate);

export const CLEARING_BANDS = {
	perfect: true,
	healthy: true,
	ok: true,
	shaky: false,
	danger: false,
} satisfies Record<CoverageBandId, boolean>;

const STREAK_HOLDS = {
	perfect: true,
	healthy: true,
	ok: false,
	shaky: false,
	danger: false,
} satisfies Record<CoverageBandId, boolean>;

/**
 * The headline reports the clear and nothing else (ADR-080). The swatch is the
 * window's own prize and rides a chip, so no band may imply it was won.
 */
const OUTCOME_SUFFIX = {
	perfect: "perfect",
	healthy: "cleared",
	ok: "cleared, thin",
	shaky: "holds",
	danger: "",
} satisfies Record<CoverageBandId, string>;

const SWATCH_EARNED = "swatch earned";

const SCORES_OUT_OF = "scores out of";
const SLOTS_WORD = "slots";

const RUN_OVER_BAND: CoverageBandId = "danger";
const PERFECT_BAND: CoverageBandId = "perfect";
const SHAKY_BAND: CoverageBandId = "shaky";

const titleOf = (band: CoverageBandId, gateName: string) =>
	band === RUN_OVER_BAND
		? RUN_OVER_TITLE
		: `${gateName} ${OUTCOME_SUFFIX[band]}`;

const holdReasonOf = (frame: GateOutcomeFrame): string => {
	if (heldByCatch(frame)) return CAUGHT_REASON;
	if (heldByFloor(frame))
		return `${dayCountOf(frame)}, ${FLOOR_CORRECT} ${NEEDED}`;
	return METER_SHORT;
};

const subtitleOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId,
	nextName: string | undefined
) => {
	const place = `gate ${frame.gate} of ${VICTORY_GATE}`;
	const ahead = nextName === undefined ? CLIMB_DONE : `next up ${nextName}`;

	if (band === "perfect") return `${place} cleared · ${BAR_FILLED} · ${ahead}`;
	if (band === "healthy") return `${place} cleared · ${ahead}`;
	if (band === "ok") return `${place} cleared on the OK band · ${PAYOUT_CUT}`;
	if (band === "shaky")
		return `${place} · ${holdReasonOf(frame)} · ${plural(SLICE_WINDOW, "fresh poll")} on the retry`;

	return `${place} · ${METER_NEVER} · ${NO_RETRY}`;
};

const shortfallBadgeOf = (
	frame: GateOutcomeFrame,
	shortBy: number
): FoldBadge => ({
	label: heldByFloor(frame) ? dayCountOf(frame) : `short by ${shortBy}%`,
	color: LOSS_COLOR,
});

const payoutOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	CLEARING_BANDS[band] ? frame.payoutKb : 0;

const faucetOf = (frame: GateOutcomeFrame) => frame.faucetKb;

const billOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	CLEARING_BANDS[band] ? frame.billKb : 0;

const peelBillKbOf = (frame: GateOutcomeFrame) =>
	peelQuotaSlotsFor(
		occupiedSlots(frame.configs),
		failPeelShareFor(frame.gate),
		frame.gate
	) * PEEL_KB_PER_SLOT;

const chosenIn = (frame: GateOutcomeFrame) =>
	frame.configs.filter((config) => (frame.chosen ?? []).includes(config.id));

const peelPaidKbOf = (chosen: readonly Config[]) =>
	chosen.reduce((sum, config) => sum + sellRefund(config), 0);

const collectsOnDrop = (configs: readonly Config[]) =>
	configs.some((config) => config.refundsPeeledConfigs === true);

const peelRefundFor = (configs: readonly Config[], chosen: readonly Config[]) =>
	chosen.reduce((sum, config) => sum + peelRefundIn(configs, config), 0);

const balanceOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	frame.balanceBeforeKb +
	payoutOf(frame, band) +
	(CLEARING_BANDS[band]
		? (frame.paid ?? []).reduce((sum, row) => sum + row.kb, 0)
		: faucetOf(frame) + peelRefundFor(frame.configs, chosenIn(frame))) -
	billOf(frame, band);

const auditsOf = (frame: GateOutcomeFrame): readonly AuditProps[] =>
	(frame.auditIds ?? []).map((id) => {
		const audit = auditAt(id, frame.gate);

		return {
			code: audit.code,
			name: audit.name,
			cue: audit.answerCue ?? audit.description,
		};
	});

const streakChipOf = (
	streak: number | undefined,
	band: CoverageBandId
): readonly GateOutcomeChip[] => {
	if (streak === undefined) return [];
	if (STREAK_HOLDS[band]) return [{ label: `streak ${streak}` }];

	return [{ label: STREAK_BROKEN }];
};

const outcomeChips = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): readonly GateOutcomeChip[] => [
	{
		label: `${correctCount(frame.answers)} of ${frame.answers.length} right`,
	},
	...(swatchEarnedIn(frame)
		? [{ label: SWATCH_EARNED, color: GAIN_COLOR }]
		: []),
	...(band === RUN_OVER_BAND
		? [{ label: `${frame.gate} gates held` }]
		: streakChipOf(frame.streak, band)),
	...(frame.caughtFatalBy === undefined
		? []
		: [
				{
					label: `${frame.caughtFatalBy} ${CAUGHT_CHIP}`,
					color: TERM_COLOR,
				},
			]),
	...(frame.attackEarned === true
		? [{ label: ATTACK_EARNED, color: GAIN_COLOR }]
		: []),
	...auditsOf(frame).map((audit) => ({
		label: `${audit.code} fired`,
		color: TERM_COLOR,
	})),
];

const SURPLUS_ROW = "surplus";
const SURPLUS_DETAIL = "· units past the full bar";
const INTEREST_ROW = "interest";
const INTEREST_DETAIL = "· on the balance held";
const EXTRA_PICKS_ROW = "extra picks";
const EXTRA_PICKS_DETAIL = "· answers past the window";
const FLAT_CLEAR_DETAIL = "· on the clear";
const STREAK_WORD = "streak";

const gainRow = (
	label: string,
	detail: string,
	kb: number
): readonly LedgerRow[] =>
	kb === 0
		? []
		: [
				{
					label,
					detail,
					figures: [{ label: signedKbLabel(kb), color: GAIN_COLOR }],
				},
			];

const clearedDetailOf = (frame: GateOutcomeFrame, correct: number): string => {
	const tally = `· ${correct} of ${frame.answers.length} correct`;
	const streak = frame.streak ?? 0;

	return streak === 0
		? tally
		: `${tally} · ${STREAK_WORD} ×${roundToTwoDecimals(streakMultiplier(streak))}`;
};

/**
 * A frame that knows the parts of its reward itemises them; one that only
 * knows the total (older snapshots, fixtures) keeps it on the gate's own row.
 */
const rewardPartsOf = (frame: GateOutcomeFrame, whole: number) => {
	if (frame.clearKb === undefined) return { clear: whole, rows: [] };

	const flat = flatClearPayoutsOf(frame.configs);
	const flatKb = flat.reduce((total, payout) => total + payout.kb, 0);

	return {
		clear: frame.clearKb - flatKb,
		rows: [
			...flat.flatMap((payout) =>
				gainRow(payout.config.label, FLAT_CLEAR_DETAIL, payout.kb)
			),
			...gainRow(SURPLUS_ROW, SURPLUS_DETAIL, frame.overflowKb ?? 0),
			...gainRow(INTEREST_ROW, INTEREST_DETAIL, frame.interestKb ?? 0),
			...gainRow(EXTRA_PICKS_ROW, EXTRA_PICKS_DETAIL, frame.extraPickKb ?? 0),
		],
	};
};

const isGainRow = (row: LedgerRow): boolean =>
	(row.figures ?? []).some(
		(figure) => "color" in figure && figure.color === GAIN_COLOR
	);

const storageSummaryOf = (rows: readonly LedgerRow[], bill: number): string =>
	`${plural(rows.filter(isGainRow).length, "payout")}, ${plural(bill === 0 ? 0 : 1, "bill")}`;

const clearedStorageRows = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): readonly LedgerRow[] => {
	const correct = correctCount(frame.answers);
	const payout = payoutOf(frame, band);
	const bonus = band === PERFECT_BAND ? frame.bonusKb : 0;
	const committed = frame.escrowCommittedKb ?? 0;
	const uplift = frame.slaUpliftKb ?? 0;
	const survival = frame.incidentSurvivalKb ?? 0;
	const bill = billOf(frame, band);
	const parts = rewardPartsOf(
		frame,
		payout - bonus - committed - uplift - survival
	);

	return [
		{
			label: CLEARED_ROW,
			detail: clearedDetailOf(frame, correct),
			figures: [{ label: signedKbLabel(parts.clear), color: GAIN_COLOR }],
		},
		...parts.rows,
		...gainRow(SLA_ROW, SLA_DETAIL, uplift),
		...gainRow(SURVIVED_ROW, SURVIVED_DETAIL, survival),
		...(committed === 0
			? []
			: [
					{
						label: COMMIT_ROW,
						detail: `· ×${ESCROW_COMMIT_MULTIPLIER} on what the gate held`,
						figures: [{ label: signedKbLabel(committed), color: GAIN_COLOR }],
					},
				]),
		...(bonus === 0
			? []
			: [
					{
						label: BONUS_ROW,
						detail: `· ×${PERFECT_BONUS} on a full bar`,
						figures: [{ label: signedKbLabel(bonus), color: GAIN_COLOR }],
					},
				]),
		...(frame.paid ?? []).map((row) => ({
			label: row.config.label,
			detail: `· ${row.detail}`,
			figures: [{ label: signedKbLabel(row.kb), color: GAIN_COLOR }],
		})),
		...(bill === 0
			? []
			: [
					{
						label: PLAN_ROW,
						detail: `· ${kbLabel(bill)} a gate`,
						figures: [{ label: signedKbLabel(-bill), color: LOSS_COLOR }],
					},
				]),
		{
			label: BALANCE,
			total: true,
			figures: [
				{ label: `${frame.balanceBeforeKb} →`, tone: "quiet" as const },
				{ label: kbLabel(balanceOf(frame, band)), tone: "headline" as const },
			],
		},
	];
};

const heldStorageRows = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): readonly LedgerRow[] => {
	const faucet = faucetOf(frame);
	const refund = peelRefundFor(frame.configs, chosenIn(frame));
	const rolledBack = frame.escrowRolledBackKb ?? 0;

	return [
		{
			label: CLEARED_ROW,
			figures: [{ label: NOT_PAID, tone: "quiet" as const }],
		},
		// The balance never held this, so it carries no figure — the row exists
		// to name what the close took back rather than to move a number.
		...(rolledBack === 0
			? []
			: [
					{
						label: ROLLBACK_ROW,
						detail: `· ${kbLabel(rolledBack * ESCROW_COMMIT_MULTIPLIER)} unpaid`,
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
		{
			label: BALANCE,
			total: true,
			figures: [
				{ label: kbLabel(balanceOf(frame, band)), tone: "headline" as const },
			],
		},
	];
};

const storageRowsOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	CLEARING_BANDS[band]
		? clearedStorageRows(frame, band)
		: heldStorageRows(frame, band);

const changeChip = (
	config: Config,
	detail: string,
	label: string,
	color: typeof GAIN_COLOR | typeof TERM_COLOR
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	version: config.level ?? 1,
	detail,
	width: "full",
	badges: [{ label, color }],
});

const paidChip = (
	config: Config,
	detail: string,
	kb: number
): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	version: config.level ?? 1,
	detail,
	width: "full",
	badges: [{ label: signedKbLabel(kb), color: GAIN_COLOR }],
});

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

const dropChip = (
	config: Config,
	configs: readonly Config[],
	chosen: boolean,
	onPress: () => void
): ConfigChipProps => {
	const refund = peelRefundIn(configs, config);

	const badges: ConfigChipBadge[] = [
		{ label: kbLabel(sellRefund(config)), color: TERM_COLOR },
		...(refund === 0
			? []
			: [{ label: signedKbLabel(refund), color: GAIN_COLOR }]),
		{
			label: chosen ? DROPPING_BADGE : DROP_BADGE,
			onPress,
			armed: chosen,
			hint: `${chosen ? "Keep" : "Drop"} ${config.label}`,
		},
	];

	return {
		name: config.label,
		slots: slotsOf(config),
		version: config.level ?? 1,
		width: "full",
		detail: describeConfig(config),
		lost: chosen,
		badges,
	};
};

export const peelTallyOf = (billKb: number, paidKb: number): string => {
	const over = paidKb - billKb;

	if (paidKb === 0) return `${kbLabel(billKb)} still owed`;
	if (over > 0) return `${PEEL_SETTLED} · ${kbLabel(over)} over`;
	if (over === 0) return PEEL_SETTLED;

	return `${kbLabel(-over)} still owed · ${kbLabel(paidKb)} chosen`;
};

export type RetryAction = { label: string; onPress?: () => void };

export const retryActionOf = (gate: number, owedKb: number): RetryAction =>
	owedKb > 0
		? { label: `Retry gate ${gate}` }
		: { label: `Retry gate ${gate}`, onPress: noop };

const choiceOf = (frame: GateOutcomeFrame): GateChoiceProps => {
	const bill = peelBillKbOf(frame);
	const chosen = chosenIn(frame);
	const paid = peelPaidKbOf(chosen);
	const owed = Math.max(0, bill - paid);
	const balance = balanceOf(frame, SHAKY_BAND);
	const affordable = balance >= owed;

	return {
		title: CHOICE_TITLE,
		peel: {
			title: `Retry gate ${frame.gate}`,
			owed: peelTallyOf(bill, paid),
			meter: { value: paid, max: bill },
			note: `${plural(SLICE_WINDOW, "fresh poll")} on the retry · the build stays locked for the window`,
			bribe: {
				label: BRIBE_LABEL,
				balance: kbLabel(balance),
				shortfall: affordable ? undefined : `short ${kbLabel(owed - balance)}`,
				onPress: affordable ? noop : undefined,
			},
			drop: {
				title: DROP_TITLE,
				note: collectsOnDrop(frame.configs) ? REFUND_NOTE : NO_REFUND_NOTE,
				configs: frame.configs.map((config) =>
					dropChip(config, frame.configs, chosen.includes(config), () =>
						frame.onToggle?.(config.id)
					)
				),
			},
		},
		refusal: {
			title: REFUSAL_TITLE,
			price: `banks ${frame.gate} of ${GATE_COUNT} · ${kbLabel(balance)} in the archive`,
			note: REFUSAL_NOTE,
			action: { label: REFUSAL_LABEL, onPress: noop },
		},
	};
};

const endingOf = (frame: GateOutcomeFrame, band: CoverageBandId) => ({
	title: band === RUN_OVER_BAND ? ENDING_TITLE : SUMMIT_TITLE,
	detail: `${frame.gate} gates held, ${plural(frame.configs.length, "config")} built, ${kbLabel(balanceOf(frame, band))} unspent. The swatches you earned stay on your profile; the build and the archive do not carry into the next run.`,
});

const footerOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId,
	nextName: string | undefined
): GateOutcomeScreenProps["footer"] => {
	if (band === RUN_OVER_BAND || frame.won === true)
		return {
			asides: [
				{ label: GATE_COMMUNITY_LABEL, icon: "community", onPress: noop },
			],
			note: ARCHIVE_EMPTIES,
			noteAt: "row",
			action: { label: NEW_RUN_LABEL, onPress: noop },
		};

	if (band === SHAKY_BAND) {
		const owed = Math.max(
			0,
			peelBillKbOf(frame) - peelPaidKbOf(chosenIn(frame))
		);

		return {
			asides: [{ label: GATE_REVIEW_LABEL, icon: "review", onPress: noop }],
			note: owed > 0 ? PEEL_REFUSAL : PEEL_PAID,
			noteAt: "row",
			action: retryActionOf(frame.gate, owed),
		};
	}

	return {
		asides: [{ label: GATE_COMMUNITY_LABEL, icon: "community", onPress: noop }],
		note:
			nextName === undefined
				? CLIMB_DONE
				: `the shop stays open until ${nextName} starts`,
		noteAt: "row",
		action: { label: GATE_SHOP_LABEL, icon: "shop", onPress: noop },
	};
};

const bonusPanelOf = (frame: GateOutcomeFrame, gateName: string) => ({
	title: BONUS_TITLE,
	summary: BAR_FILLED,
	badges: [
		{
			label: signedKbLabel(frame.bonusKb),
			color: GAIN_COLOR,
		},
	],
	open: frame.open,
	detail: `A full bar multiplies the gate's payout by ×${PERFECT_BONUS}, and the ${gateName} swatch is marked for it. Perfect does not carry: the next gate still starts at zero.`,
});

const changesPanelOf = (frame: GateOutcomeFrame) => {
	const { unlocked = [], faded = [], paid = [] } = frame;
	const changed = unlocked.length + faded.length + paid.length;

	return {
		title: CHANGES_TITLE,
		summary: changed === 0 ? NOTHING_MOVED : undefined,
		emptyLabel: NOTHING_CHANGED,
		badges: [
			...(unlocked.length === 0
				? []
				: [{ label: `${unlocked.length} ${UNLOCKED}`, color: GAIN_COLOR }]),
			...(faded.length === 0
				? []
				: [{ label: `${faded.length} ${FADED}`, color: TERM_COLOR }]),
		],
		open: frame.open,
		changes: [
			...unlocked.map((row) =>
				changeChip(row.config, row.detail, UNLOCKED, GAIN_COLOR)
			),
			...faded.map((row) =>
				changeChip(row.config, row.detail, FADED, TERM_COLOR)
			),
			...paid.map((row) => paidChip(row.config, row.detail, row.kb)),
		],
		note:
			unlocked.length === 0
				? undefined
				: `${unlocked[0].config.label} is dealt into future starting hands from now on.`,
	};
};

const figureOf = (frame: GateOutcomeFrame, band: CoverageBandId) => {
	const balance = balanceOf(frame, band);

	if (band === RUN_OVER_BAND)
		return {
			amount: `${roundToOneDecimal(frame.bar.held)}%`,
			note: `${frame.gate} gates held · ${kbLabel(balance)} left in the archive`,
		};

	if (band === SHAKY_BAND) {
		const owed = Math.max(
			0,
			peelBillKbOf(frame) - peelPaidKbOf(chosenIn(frame))
		);

		return {
			amount: kbLabel(owed),
			note: `${PEEL_TO_PAY} · ${BALANCE_WORD} ${kbLabel(balance)}`,
		};
	}

	return {
		amount: signedKbLabel(payoutOf(frame, band) - billOf(frame, band)),
		note: `${BALANCE_WORD} ${kbLabel(balance)}`,
	};
};

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
	frame: GateOutcomeFrame
): GateOutcomeScreenProps => {
	const { gate, answers } = frame;
	const band = bandOf(frame);
	const swatch = gateSwatchAt(gate);
	const next = gateSwatchAt(gate + 1);
	const demand = roundToOneDecimal(frame.bar.healthy);
	const held = roundToOneDecimal(frame.bar.held);
	const shortBy = roundToOneDecimal(Math.max(0, demand - held));
	const cleared = CLEARING_BANDS[band];
	const bar =
		cleared && !frame.won && next !== undefined
			? {
					...frame.bar,
					note: `${next.gateName} ${SCORES_OUT_OF} ${scoringSlotsAt(next.gate)} ${SLOTS_WORD}.`,
				}
			: frame.bar;

	return {
		header: {
			swatch,
			earned: swatchEarnedIn(frame),
			swatches: swatchTrackFor(frame.swatchGates, cleared ? gate + 1 : gate),
			title: titleOf(band, swatch.gateName),
			subtitle: subtitleOf(frame, band, next?.gateName),
			figure: figureOf(frame, band),
			chips: outcomeChips(frame, band),
		},
		bar,
		...(frame.payouts === undefined ? {} : { payouts: frame.payouts }),
		audits: auditsOf(frame),
		...(band === PERFECT_BAND && frame.bonusKb > 0
			? { bonus: bonusPanelOf(frame, swatch.gateName) }
			: {}),
		coverage: {
			title: COVERAGE_TITLE,
			summary: plural(byCategory(answers).size, "category").replace(
				"categorys",
				"categories"
			),
			badges: cleared
				? [
						{
							label: `${signedPercent(totalCoverage(answers))}%`,
							color: GAIN_COLOR,
						},
					]
				: [shortfallBadgeOf(frame, shortBy)],
			open: frame.open,
			rows: coverageRows(answers, demand),
		},
		storage: {
			title: STORAGE_TITLE,
			summary: storageSummaryOf(
				storageRowsOf(frame, band),
				billOf(frame, band)
			),
			badges: cleared
				? [{ label: signedKbLabel(payoutOf(frame, band)), color: GAIN_COLOR }]
				: [{ label: NOTHING_PAID, color: TERM_COLOR }],
			open: frame.open,
			rows: storageRowsOf(frame, band),
		},
		...(band === RUN_OVER_BAND ? {} : { changes: changesPanelOf(frame) }),
		answers: {
			title: ANSWERS_TITLE,
			badges: answerTallyOf(answers),
			open: frame.open,
			rows: answerRows(answers),
			...(band === SHAKY_BAND
				? {}
				: {
						review: {
							label: GATE_REVIEW_LABEL,
							icon: "review" as const,
							onPress: noop,
						},
					}),
		},
		tail: tailOf(frame, band),
		footer: footerOf(frame, band, next?.gateName),
	};
};
