import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import {
	PERFECT_BONUS,
	bandFor,
	type CoverageBandId,
	floorAt,
	gatePayoutKb,
	healthyAt,
	okAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	DRAFT_COST_PER_SLOT_KB,
	describeConfig,
	faucetKbPerCorrect,
	maxLevelOf,
	sellRefund,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	GATE_COUNT,
	SLICE_WINDOW,
	VICTORY_GATE,
	failPeelShareFor,
	peelQuotaSlotsFor,
	planBillKb,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import { peelRefundIn } from "~/modules/run/run/domain/strip.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type {
	ConfigChipBadge,
	ConfigChipProps,
} from "~/ui/kanto-theme/ConfigChip.ui";
import type { FoldBadge } from "~/ui/kanto-theme/Fold.ui";
import type { GateChoiceProps } from "~/ui/kanto-theme/GateChoice.ui";
import type {
	GateOutcomeChip,
	GateOutcomeScreenProps,
	GateOutcomeTail,
} from "~/ui/kanto-theme/GateOutcomeScreen.ui";
import type {
	AnswerDiffProps,
	DiffOption,
} from "~/ui/kanto-theme/AnswerDiff.ui";
import type { LedgerRow } from "~/ui/kanto-theme/LedgerRows.ui";
import type {
	ReviewRow,
	ReviewScreenProps,
} from "~/ui/kanto-theme/ReviewScreen.ui";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

import { gateSwatchAt, trackTo } from "./swatchTrack.factory";

const noop = () => {};

export const GATE_REVIEW_LABEL = "Review answers";
export const GATE_SHOP_LABEL = "To the shop";
export const GATE_COMMUNITY_LABEL = "Community";

const COVERAGE_TITLE = "Coverage by category";
const STORAGE_TITLE = "Storage bonus";
const CHANGES_TITLE = "Build changes";
const ANSWERS_TITLE = "The five answers";

const BONUS_TITLE = "Perfect bonus";
const CHOICE_TITLE = "How this gate ends";
const ENDING_TITLE = "The run ends here";
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

const UNLOCKED = "unlocked";
const FADED = "faded";
const NOTHING_MOVED = "nothing moved";
const NOT_PAID = "not paid";
const NOTHING_PAID = "nothing paid";
const STREAK_BROKEN = "streak broken";
const DROP_BADGE = "drop";
const DROPPING_BADGE = "dropping";

const BAR_FILLED = "the bar filled";
const PAYOUT_CUT = "the payout is cut";
const METER_SHORT = "the meter fell short";
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

export type GateAnswer = {
	category: CategoryCode;
	question: string;
	outcome: VerdictOutcome;
	coverage: number;
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
	balanceBeforeKb: number;
	configs: readonly Config[];
	planTier?: number;
	streak?: number;
	unlocked?: readonly { config: Config; detail: string }[];
	faded?: readonly { config: Config; detail: string }[];
	paid?: readonly { config: Config; detail: string; kb: number }[];
	auditIds?: readonly AuditId[];
	chosen?: readonly string[];
	onToggle?: (configId: string) => void;
	open?: boolean;
};

const LAVENDER_ANSWERS: readonly GateAnswer[] = [
	{
		category: "js",
		question: "Which method returns the last element of an array?",
		outcome: "correct",
		coverage: 12.3,
		answerType: "single",
		options: ["at(-1)", "pop()", "slice(-1)", "last()"],
		picked: ["at(-1)"],
		correct: ["at(-1)"],
		explanation:
			"at(-1) reads the last element without touching the array. pop() would remove it.",
	},
	{
		category: "git",
		question: "What does a rebase rewrite?",
		outcome: "correct",
		coverage: 19.2,
		answerType: "single",
		options: ["the commits", "the working tree", "the remote", "the index"],
		picked: ["the commits"],
		correct: ["the commits"],
		explanation:
			"A rebase replays your commits onto a new base, so every replayed commit gets a new hash.",
	},
	{
		category: "css",
		question: "Which property centres a flex child along the main axis?",
		outcome: "wrong",
		coverage: -4.4,
		answerType: "single",
		options: ["justify-content", "align-items", "text-align", "place-items"],
		picked: ["align-items"],
		correct: ["justify-content"],
		codeBlock:
			".row {\n  display: flex;\n  /* centre the child horizontally */\n}",
		explanation:
			"justify-content works along the main axis, which is horizontal in the default row direction. align-items is the cross axis, so it would have centred vertically instead.",
		note: "ESLint crossed out text-align on this poll · 16 KB",
	},
	{
		category: "ts",
		question: "Which of these are built-in utility types?",
		outcome: "partial",
		coverage: 11.2,
		answerType: "multiple",
		options: [
			"Partial<T>",
			"Maybe<T>",
			"Readonly<T>",
			"Record<K,V>",
			"Nullable<T>",
		],
		picked: ["Partial<T>", "Readonly<T>"],
		correct: ["Partial<T>", "Readonly<T>", "Record<K,V>"],
		explanation:
			"Partial, Readonly and Record ship with TypeScript. Maybe and Nullable are common hand-rolled helpers, not built in.",
	},
	{
		category: "js",
		question: "What does Promise.all reject with?",
		outcome: "correct",
		coverage: 12.3,
		answerType: "single",
		options: [
			"the first rejection",
			"every rejection",
			"an AggregateError",
			"undefined",
		],
		picked: ["the first rejection"],
		correct: ["the first rejection"],
		explanation:
			"Promise.all rejects as soon as one input rejects, with that reason. Promise.any is the one that collects an AggregateError.",
	},
];

const signedPercent = (value: number) =>
	`${value < 0 ? "" : "+"}${roundToOneDecimal(value)}`;

const categoryName = (code: CategoryCode) => CATEGORY_METADATA[code].name;

const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

const totalCoverage = (answers: readonly GateAnswer[]) =>
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

const coverageColor = (value: number) => (value < 0 ? LOSS_COLOR : GAIN_COLOR);

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

const PEEL_KB_PER_SLOT = DRAFT_COST_PER_SLOT_KB / 2;

const ratioOf = (answers: readonly GateAnswer[]) =>
	Math.min(1, Math.max(0, totalCoverage(answers) / 100));

const heldOf = (answers: readonly GateAnswer[]) =>
	roundToOneDecimal(Math.min(100, Math.max(0, totalCoverage(answers))));

const asPercent = (ratio: number) => roundToOneDecimal(ratio * 100);

const ladderAt = (gate: number) => ({
	floor: asPercent(floorAt(gate)),
	ok: asPercent(okAt(gate)),
	healthy: asPercent(healthyAt(gate)),
});

const bandOf = (frame: GateOutcomeFrame): CoverageBandId =>
	bandFor(ratioOf(frame.answers), frame.gate).id;

const CLEARING_BANDS = {
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

const OUTCOME_SUFFIX = {
	perfect: "perfect",
	healthy: "earned",
	ok: "earned, thin",
	shaky: "holds",
	danger: "",
} satisfies Record<CoverageBandId, string>;

const RUN_OVER_BAND: CoverageBandId = "danger";
const PERFECT_BAND: CoverageBandId = "perfect";
const SHAKY_BAND: CoverageBandId = "shaky";

const titleOf = (band: CoverageBandId, gateName: string) =>
	band === RUN_OVER_BAND
		? RUN_OVER_TITLE
		: `${gateName} ${OUTCOME_SUFFIX[band]}`;

const subtitleOf = (
	band: CoverageBandId,
	gate: number,
	nextName: string | undefined
) => {
	const place = `gate ${gate} of ${VICTORY_GATE}`;
	const ahead = nextName === undefined ? CLIMB_DONE : `next up ${nextName}`;

	if (band === "perfect") return `${place} cleared · ${BAR_FILLED} · ${ahead}`;
	if (band === "healthy") return `${place} cleared · ${ahead}`;
	if (band === "ok") return `${place} cleared on the OK band · ${PAYOUT_CUT}`;
	if (band === "shaky")
		return `${place} · ${METER_SHORT} · ${plural(SLICE_WINDOW, "fresh poll")} on the retry`;

	return `${place} · ${METER_NEVER} · ${NO_RETRY}`;
};

const payoutOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	CLEARING_BANDS[band]
		? gatePayoutKb(
				ratioOf(frame.answers),
				frame.gate,
				occupiedSlots(frame.configs),
				frame.streak ?? 0
			)
		: 0;

const perfectBonusKbOf = (payout: number) =>
	payout - Math.round(payout / PERFECT_BONUS);

const faucetOf = (frame: GateOutcomeFrame) =>
	faucetKbPerCorrect(frame.configs) * correctCount(frame.answers);

const billOf = (frame: GateOutcomeFrame, band: CoverageBandId) =>
	CLEARING_BANDS[band] ? planBillKb(frame.planTier ?? 0) : 0;

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
	...(band === RUN_OVER_BAND
		? [{ label: `${frame.gate} gates held` }]
		: streakChipOf(frame.streak, band)),
	...auditsOf(frame).map((audit) => ({
		label: `${audit.code} fired`,
		color: TERM_COLOR,
	})),
];

const clearedStorageRows = (
	frame: GateOutcomeFrame,
	band: CoverageBandId
): readonly LedgerRow[] => {
	const correct = correctCount(frame.answers);
	const payout = payoutOf(frame, band);
	const bonus = band === PERFECT_BAND ? perfectBonusKbOf(payout) : 0;
	const bill = billOf(frame, band);

	return [
		{
			label: CLEARED_ROW,
			detail: `· ${correct} of ${frame.answers.length} correct`,
			figures: [{ label: signedKbLabel(payout - bonus), color: GAIN_COLOR }],
		},
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

	return [
		{
			label: CLEARED_ROW,
			figures: [{ label: NOT_PAID, tone: "quiet" as const }],
		},
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
		tags: [{ label: categoryName(answer.category) }],
		detail: answer.question,
		figures: [
			{
				label: signedPercent(answer.coverage),
				color: coverageColor(answer.coverage),
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

const endingOf = (frame: GateOutcomeFrame) => ({
	title: ENDING_TITLE,
	detail: `${frame.gate} gates held, ${plural(frame.configs.length, "config")} built, ${kbLabel(balanceOf(frame, RUN_OVER_BAND))} unspent. The swatches you earned stay on your profile; the build and the archive do not carry into the next run.`,
});

const footerOf = (
	frame: GateOutcomeFrame,
	band: CoverageBandId,
	nextName: string | undefined
): GateOutcomeScreenProps["footer"] => {
	if (band === RUN_OVER_BAND)
		return {
			aside: {
				label: GATE_COMMUNITY_LABEL,
				icon: "community",
				onPress: noop,
			},
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
			aside: { label: GATE_REVIEW_LABEL, icon: "review", onPress: noop },
			note: owed > 0 ? PEEL_REFUSAL : PEEL_PAID,
			noteAt: "row",
			action: retryActionOf(frame.gate, owed),
		};
	}

	return {
		aside: { label: GATE_COMMUNITY_LABEL, icon: "community", onPress: noop },
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
			label: signedKbLabel(perfectBonusKbOf(payoutOf(frame, PERFECT_BAND))),
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
			amount: `${heldOf(frame.answers)}%`,
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
	if (band === RUN_OVER_BAND) return { ending: endingOf(frame) };

	return undefined;
};

export const kantoGateOutcomeAt = (
	frame: GateOutcomeFrame
): GateOutcomeScreenProps => {
	const { gate, answers } = frame;
	const band = bandOf(frame);
	const swatch = gateSwatchAt(gate);
	const next = gateSwatchAt(gate + 1);
	const demand = asPercent(healthyAt(gate));
	const held = heldOf(answers);
	const shortBy = roundToOneDecimal(Math.max(0, demand - held));
	const cleared = CLEARING_BANDS[band];

	return {
		header: {
			swatch,
			swatches: trackTo(cleared ? gate + 1 : gate),
			title: titleOf(band, swatch.gateName),
			subtitle: subtitleOf(band, gate, next?.gateName),
			figure: figureOf(frame, band),
			chips: outcomeChips(frame, band),
		},
		bar: { ...ladderAt(gate), held },
		audits: auditsOf(frame),
		...(band === PERFECT_BAND
			? { bonus: bonusPanelOf(frame, swatch.gateName) }
			: {}),
		coverage: {
			title: COVERAGE_TITLE,
			summary: plural(byCategory(answers).size, "category").replace(
				"categorys",
				"categories"
			),
			badges: cleared
				? [{ label: `${signedPercent(held)}%`, color: GAIN_COLOR }]
				: [{ label: `short by ${shortBy}%`, color: LOSS_COLOR }],
			open: frame.open,
			rows: coverageRows(answers, demand),
		},
		storage: {
			title: STORAGE_TITLE,
			summary: `${plural((frame.paid ?? []).length + 1, "payout")}, ${plural(billOf(frame, band) === 0 ? 0 : 1, "bill")}`,
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

const LAVENDER_BUILD: readonly Config[] = [
	CONFIGS.cache,
	CONFIGS.deprecated,
	CONFIGS.indexedDb,
	{ ...CONFIGS.telemetry, level: 2 },
];

const COINED_BUILD: readonly Config[] = [
	CONFIGS.cache,
	CONFIGS.indexedDb,
	{ ...CONFIGS.telemetry, level: 2 },
	CONFIGS.js,
	CONFIGS.ts,
];

const COLLECTED_BUILD: readonly Config[] = [
	CONFIGS.garbageCollection,
	CONFIGS.cache,
	CONFIGS.indexedDb,
	{ ...CONFIGS.telemetry, level: 2 },
];

const OUTCOME_GATE = 4;

const outcomesAt = (
	outcomes: readonly VerdictOutcome[],
	total: number
): readonly GateAnswer[] => {
	const shaped = LAVENDER_ANSWERS.map((answer, index) => ({
		...answer,
		outcome: outcomes[index] ?? answer.outcome,
	}));
	const base = totalCoverage(shaped);
	const scaled = shaped.map((answer) => ({
		...answer,
		coverage: roundToOneDecimal(
			base === 0 ? 0 : (answer.coverage * total) / base
		),
	}));
	const drift = roundToOneDecimal(total - totalCoverage(scaled));
	const last = scaled.length - 1;

	return scaled.map((answer, index) =>
		index === last
			? { ...answer, coverage: roundToOneDecimal(answer.coverage + drift) }
			: answer
	);
};

export const PERFECT_ANSWERS = outcomesAt(
	["correct", "correct", "correct", "correct", "correct"],
	100
);

export const HEALTHY_ANSWERS = outcomesAt(
	["correct", "correct", "partial", "correct", "correct"],
	72
);

export const OK_ANSWERS = outcomesAt(
	["correct", "correct", "wrong", "partial", "correct"],
	32
);

export const SHAKY_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "partial", "correct"],
	20
);

export const DANGER_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "partial", "wrong"],
	14.2
);

const outcomeFrame = (
	frame: Partial<GateOutcomeFrame> = {}
): GateOutcomeFrame => ({
	gate: OUTCOME_GATE,
	answers: HEALTHY_ANSWERS,
	balanceBeforeKb: 102,
	planTier: 1,
	configs: LAVENDER_BUILD,
	streak: 3,
	auditIds: ["cost-overrun"],
	unlocked: [
		{
			config: { ...CONFIGS.telemetry, level: 2 },
			detail: "earned: peeked the community split 5 times",
		},
	],
	faded: [
		{
			config: CONFIGS.deprecated,
			detail: `${describeConfig(CONFIGS.deprecated)} · deleted in 2 clears`,
		},
	],
	paid: [{ config: CONFIGS.indexedDb, detail: "4 correct answers", kb: 32 }],
	...frame,
});

export const kantoGatePerfect = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame({ answers: PERFECT_ANSWERS, streak: 4 }));

export const kantoGateHealthy = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame());

export const kantoGateOk = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame({ answers: OK_ANSWERS }));

export const kantoGateShaky = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({ answers: SHAKY_ANSWERS, balanceBeforeKb: 12 })
	);

export const kantoGateShakyPicking = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			answers: SHAKY_ANSWERS,
			balanceBeforeKb: 12,
			chosen: [CONFIGS.indexedDb.id],
		})
	);

export const kantoGateShakyPaid = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			answers: SHAKY_ANSWERS,
			balanceBeforeKb: 12,
			chosen: [CONFIGS.cache.id],
		})
	);

export const kantoGateShakyFunded = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({ answers: SHAKY_ANSWERS, balanceBeforeKb: 512 })
	);

export const kantoGateShakyCollected = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			answers: SHAKY_ANSWERS,
			balanceBeforeKb: 12,
			configs: COLLECTED_BUILD,
			chosen: [CONFIGS.cache.id],
		})
	);

export const kantoGateDanger = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({ answers: DANGER_ANSWERS, balanceBeforeKb: 41 })
	);

export const kantoGateOutcomeOpen = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame({ open: true }));

export const kantoGateZero = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			gate: 0,
			answers: PERFECT_ANSWERS,
			balanceBeforeKb: 0,
			planTier: 0,
			configs: [CONFIGS.js, CONFIGS.unitTests],
			streak: 5,
			auditIds: [],
			unlocked: [],
			faded: [],
			paid: [],
		})
	);

export const kantoGateSummit = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			gate: VICTORY_GATE,
			balanceBeforeKb: 1024,
			planTier: 3,
			configs: CONFIG_LIST.slice(0, 4),
			streak: 9,
			auditIds: ["timeout"],
		})
	);

export const kantoGateOutcomeBuild = LAVENDER_BUILD;
export const kantoGateOutcomeCoinedBuild = COINED_BUILD;
export const kantoGateOutcomeGate = OUTCOME_GATE;

export const kantoGateOutcomeSellValues: readonly number[] =
	LAVENDER_BUILD.map(sellRefund);

export const kantoGateOutcomeOccupiedSlots = occupiedSlots(LAVENDER_BUILD);

export const kantoGatePeelBillKb =
	peelQuotaSlotsFor(
		occupiedSlots(LAVENDER_BUILD),
		failPeelShareFor(OUTCOME_GATE),
		OUTCOME_GATE
	) * PEEL_KB_PER_SLOT;

export const kantoGateAnswers = LAVENDER_ANSWERS;
export const kantoGateWindow = SLICE_WINDOW;
export { maxLevelOf };

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const REVIEW_EXPAND_LABEL = "open everything";
export const REVIEW_HINT = "fumbles open, passes folded";
export const REVIEW_DEX_NOTE = "every poll you saw is recorded in the Dex";

const REVIEW_LEAD = "Review";
const REVIEW_SEPARATOR = "·";
const CAUGHT = "caught";

const optionAt = (answer: GateAnswer, label: string): DiffOption => ({
	letter: OPTION_LETTERS[answer.options.indexOf(label)] ?? "?",
	label,
});

const diffFor = (answer: GateAnswer): AnswerDiffProps => {
	const picked = new Set(answer.picked);
	const named = new Set([...answer.correct, ...answer.picked]);
	const others = answer.options.filter((label) => !named.has(label));
	const hits = answer.correct.filter((label) => picked.has(label)).length;

	return {
		outcome: answer.outcome,
		answerType: answer.answerType,
		expected: answer.correct.map((label) => optionAt(answer, label)),
		received: answer.picked.map((label) => optionAt(answer, label)),
		others: others.map((label) => optionAt(answer, label)),
		tally:
			answer.answerType === "multiple"
				? `${hits} of ${answer.correct.length} ${CAUGHT}`
				: undefined,
		othersLabel:
			others.length === 0 ? undefined : plural(others.length, "other option"),
	};
};

const reviewRowFor = (answer: GateAnswer, open?: boolean): ReviewRow => ({
	verdict: answer.outcome,
	question: answer.question,
	category: categoryName(answer.category),
	coverage: signedPercent(answer.coverage),
	coverageColor: coverageColor(answer.coverage),
	open,
	codeBlock: answer.codeBlock,
	diff: diffFor(answer),
	explanation: answer.explanation,
	note: answer.note,
});

export type ReviewFrame = {
	gate: number;
	answers: readonly GateAnswer[];
	open?: boolean;
};

export const kantoReviewAt = ({
	gate,
	answers,
	open,
}: ReviewFrame): ReviewScreenProps => {
	const swatch = gateSwatchAt(gate);

	return {
		header: {
			swatch,
			title: `${REVIEW_LEAD} ${REVIEW_SEPARATOR} ${swatch.gateName}`,
			subtitle: `gate ${gate} ${REVIEW_SEPARATOR} ${plural(answers.length, "poll")}`,
			badges: [
				...answerTallyOf(answers),
				{
					label: `${signedPercent(totalCoverage(answers))}%`,
					color: coverageColor(totalCoverage(answers)),
				},
			],
		},
		hint: REVIEW_HINT,
		expand: { label: REVIEW_EXPAND_LABEL, onPress: noop },
		rows: answers.map((answer) => reviewRowFor(answer, open)),
		footer: {
			note: REVIEW_DEX_NOTE,
			noteAt: "row",
			action: { label: GATE_SHOP_LABEL, icon: "shop", onPress: noop },
		},
	};
};

export const kantoReview = (): ReviewScreenProps =>
	kantoReviewAt({ gate: 4, answers: LAVENDER_ANSWERS });

export const kantoReviewAllOpen = (): ReviewScreenProps =>
	kantoReviewAt({ gate: 4, answers: LAVENDER_ANSWERS, open: true });

export const kantoReviewFlawless = (): ReviewScreenProps =>
	kantoReviewAt({
		gate: 4,
		answers: LAVENDER_ANSWERS.map((answer) => ({
			...answer,
			outcome: "correct" as const,
			picked: answer.correct,
			coverage: Math.abs(answer.coverage),
		})),
	});
