import {
	gateClearPayout,
	occupiedSlots,
} from "~/modules/run/build/domain/build.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	describeConfig,
	faucetKbPerCorrect,
	maxLevelOf,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
	coverageDemandFor,
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
import type { GateClearScreenProps } from "~/ui/kanto-theme/GateClearScreen.ui";
import type { GateHoldScreenProps } from "~/ui/kanto-theme/GateHoldScreen.ui";
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

const THIS_GATE = "this gate";
const BALANCE = "balance";
const BALANCE_WORD = "balance";
const CLEARED_ROW = "gate cleared";
const PLAN_ROW = "storage plan";

const UNLOCKED = "unlocked";
const FADED = "faded";

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

export type GateClearFrame = {
	gate: number;
	answers: readonly GateAnswer[];
	balanceBeforeKb: number;
	planTier: number;
	configs: readonly Config[];
	unlocked?: readonly { config: Config; detail: string }[];
	faded?: readonly { config: Config; detail: string }[];
	paid?: readonly { config: Config; detail: string; kb: number }[];
	audit?: string;
	streak?: number;
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

const storageRows = ({
	gate,
	answers,
	balanceBeforeKb,
	planTier,
	configs,
	paid = [],
}: GateClearFrame): readonly LedgerRow[] => {
	const correct = correctCount(answers);
	const base = gateClearPayout(configs, correct, gate);
	const bill = planBillKb(planTier);
	const earned = base + paid.reduce((sum, row) => sum + row.kb, 0);
	const balance = balanceBeforeKb + earned - bill;

	return [
		{
			label: CLEARED_ROW,
			detail: `· ${correct} of ${answers.length} correct`,
			figures: [{ label: signedKbLabel(base), color: GAIN_COLOR }],
		},
		...paid.map((row) => ({
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
				{ label: `${balanceBeforeKb} →`, tone: "quiet" as const },
				{ label: kbLabel(balance), tone: "headline" as const },
			],
		},
	];
};

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

const headerChips = (frame: GateClearFrame, demand: number) => {
	const total = totalCoverage(frame.answers);
	const correct = correctCount(frame.answers);

	return [
		{
			label: `${signedPercent(total).replace("+", "")}% of ${demand}% needed`,
			color: GAIN_COLOR,
		},
		{ label: `${correct} of ${frame.answers.length} right` },
		...(frame.streak === undefined
			? []
			: [{ label: `streak ${frame.streak}` }]),
		...(frame.audit === undefined
			? []
			: [{ label: `${frame.audit} fired`, color: TERM_COLOR }]),
	];
};

export const kantoGateClearAt = (
	frame: GateClearFrame
): GateClearScreenProps => {
	const {
		gate,
		answers,
		configs,
		unlocked = [],
		faded = [],
		paid = [],
	} = frame;
	const swatch = gateSwatchAt(gate);
	const next = gateSwatchAt(gate + 1);
	const demand = coverageDemandFor(gate);
	const correct = correctCount(answers);
	const earned =
		gateClearPayout(configs, correct, gate) +
		paid.reduce((sum, row) => sum + row.kb, 0);
	const bill = planBillKb(frame.planTier);
	const changed = unlocked.length + faded.length + paid.length;

	return {
		header: {
			swatch,
			swatches: trackTo(gate + 1),
			title: `${swatch.gateName} earned`,
			subtitle:
				next === undefined
					? `gate ${gate} of ${VICTORY_GATE} cleared · the climb is done`
					: `gate ${gate} of ${VICTORY_GATE} cleared · next up ${next.gateName}`,
			gain: {
				amount: signedKbLabel(earned - bill),
				note: `${BALANCE_WORD} ${kbLabel(frame.balanceBeforeKb + earned - bill)}`,
			},
			chips: headerChips(frame, demand),
		},
		coverage: {
			title: COVERAGE_TITLE,
			summary: plural(byCategory(answers).size, "category").replace(
				"categorys",
				"categories"
			),
			badges: [
				{
					label: `${signedPercent(totalCoverage(answers))}%`,
					color: GAIN_COLOR,
				},
			],
			open: frame.open,
			rows: coverageRows(answers, demand),
		},
		storage: {
			title: STORAGE_TITLE,
			summary: `${plural(paid.length + 1, "payout")}, ${plural(bill === 0 ? 0 : 1, "bill")}`,
			badges: [{ label: signedKbLabel(earned - bill), color: GAIN_COLOR }],
			open: frame.open,
			rows: storageRows(frame),
		},
		changes: {
			title: CHANGES_TITLE,
			summary: changed === 0 ? "nothing moved" : undefined,
			badges: [
				...(unlocked.length === 0
					? []
					: [
							{
								label: `${unlocked.length} ${UNLOCKED}`,
								color: GAIN_COLOR,
							},
						]),
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
		},
		answers: {
			title: ANSWERS_TITLE,
			badges: answerTallyOf(answers),
			open: frame.open,
			rows: answerRows(answers),
			review: { label: GATE_REVIEW_LABEL, icon: "review", onPress: noop },
		},
		footer: {
			aside: {
				label: GATE_COMMUNITY_LABEL,
				icon: "community",
				onPress: noop,
			},
			note:
				next === undefined
					? "the climb is done"
					: `the shop stays open until ${next.gateName} starts`,
			noteAt: "row",
			action: { label: GATE_SHOP_LABEL, icon: "shop", onPress: noop },
		},
	};
};

const LAVENDER_BUILD: readonly Config[] = [
	CONFIGS.indexedDb,
	CONFIGS.unitTests,
	{ ...CONFIGS.telemetry, level: 2 },
	CONFIGS.deprecated,
];

export const kantoGateClear = (): GateClearScreenProps =>
	kantoGateClearAt({
		gate: 4,
		answers: LAVENDER_ANSWERS,
		balanceBeforeKb: 102,
		planTier: 1,
		configs: LAVENDER_BUILD,
		streak: 3,
		audit: "424",
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
		paid: [
			{
				config: CONFIGS.indexedDb,
				detail: "4 correct answers",
				kb: 32,
			},
			{ config: CONFIGS.unitTests, detail: "on clear", kb: 32 },
		],
	});

export const kantoGateClearOpen = (): GateClearScreenProps => ({
	...kantoGateClear(),
	coverage: { ...kantoGateClear().coverage, open: true },
	storage: { ...kantoGateClear().storage, open: true },
	changes: { ...kantoGateClear().changes, open: true },
	answers: { ...kantoGateClear().answers, open: true },
});

export const kantoGateClearFlawless = (): GateClearScreenProps =>
	kantoGateClearAt({
		gate: 0,
		answers: LAVENDER_ANSWERS.map((answer) => ({
			...answer,
			outcome: "correct" as const,
			coverage: Math.abs(answer.coverage),
		})),
		balanceBeforeKb: 0,
		planTier: 0,
		configs: [CONFIGS.js, CONFIGS.unitTests],
		streak: 5,
	});

export const kantoGateClearSummit = (): GateClearScreenProps =>
	kantoGateClearAt({
		gate: VICTORY_GATE,
		answers: LAVENDER_ANSWERS,
		balanceBeforeKb: 1024,
		planTier: 3,
		configs: CONFIG_LIST.slice(0, 4),
		streak: 9,
		audit: "408",
	});

export const kantoGateAnswers = LAVENDER_ANSWERS;
export const kantoGateWindow = SLICE_WINDOW;
export { maxLevelOf };

const HOLD_TITLE_SUFFIX = "holds";
const HOLD_DROP_TITLE = "Drop configs to pay the peel";
const HOLD_NOT_PAID = "not paid";
const HOLD_NOTHING_PAID = "nothing paid";
const HOLD_PEEL_ROW = "peel refund";
const HOLD_CORRECT_ROW = "correct answers";
const HOLD_DROP_BADGE = "drop";
const HOLD_DROPPING_BADGE = "dropping";
const HOLD_REFUSAL = "The gate stays shut until the peel is paid in full.";
const HOLD_NO_REFUND_NOTE =
	"Drops refund nothing. Whatever you overpay is simply gone.";
const HOLD_REFUND_NOTE =
	"Garbage Collection is installed, so every config you drop here refunds its sell value.";

export type GateHoldFrame = {
	gate: number;
	answers: readonly GateAnswer[];
	balanceBeforeKb: number;
	configs: readonly Config[];
	chosen?: readonly string[];
	onToggle?: (configId: string) => void;
	auditIds?: readonly AuditId[];
	open?: boolean;
};

export const holdTallyOf = (
	demandSlots: number,
	chosenSlots: number
): string => {
	const over = chosenSlots - demandSlots;

	if (chosenSlots === 0) return plural(demandSlots, "slot");
	if (over > 0)
		return `${plural(demandSlots, "slot")} · ${chosenSlots} chosen · ${over} over`;

	return `${plural(demandSlots, "slot")} · ${chosenSlots} chosen`;
};

export type HoldAction = {
	label: string;
	onPress?: () => void;
	refusal?: string;
};

export const holdActionOf = (
	demandSlots: number,
	chosenSlots: number,
	chosenCount: number
): HoldAction => {
	const shortBy = Math.max(0, demandSlots - chosenSlots);

	if (shortBy > 0)
		return {
			label: `Free ${plural(shortBy, "more slot")}`,
			refusal: HOLD_REFUSAL,
		};

	return { label: `Drop ${plural(chosenCount, "config")} →`, onPress: noop };
};

const collectsOnDrop = (configs: readonly Config[]) =>
	configs.some((config) => config.refundsPeeledConfigs === true);

const peelRefundFor = (configs: readonly Config[], chosen: readonly Config[]) =>
	chosen.reduce((sum, config) => sum + peelRefundIn(configs, config), 0);

const holdChips = (frame: GateHoldFrame) => [
	{
		label: `${correctCount(frame.answers)} of ${frame.answers.length} right`,
	},
];

const holdAudits = (
	gate: number,
	ids: readonly AuditId[]
): readonly AuditProps[] =>
	ids.map((id) => {
		const audit = auditAt(id, gate);

		return {
			code: audit.code,
			name: audit.name,
			cue: audit.answerCue ?? audit.description,
		};
	});

const holdStorageRows = (
	frame: GateHoldFrame,
	chosen: readonly Config[]
): readonly LedgerRow[] => {
	const faucet =
		faucetKbPerCorrect(frame.configs) * correctCount(frame.answers);
	const refund = peelRefundFor(frame.configs, chosen);

	return [
		{
			label: CLEARED_ROW,
			figures: [{ label: HOLD_NOT_PAID, tone: "quiet" as const }],
		},
		...(faucet === 0
			? []
			: [
					{
						label: HOLD_CORRECT_ROW,
						figures: [{ label: signedKbLabel(faucet), color: GAIN_COLOR }],
					},
				]),
		...(refund === 0
			? []
			: [
					{
						label: HOLD_PEEL_ROW,
						figures: [{ label: signedKbLabel(refund), color: GAIN_COLOR }],
					},
				]),
		{
			label: BALANCE,
			total: true,
			figures: [
				{
					label: kbLabel(frame.balanceBeforeKb + faucet + refund),
					tone: "headline" as const,
				},
			],
		},
	];
};

const dropChip = (
	config: Config,
	configs: readonly Config[],
	chosen: boolean,
	onPress: () => void
): ConfigChipProps => {
	const refund = peelRefundIn(configs, config);

	const badges: ConfigChipBadge[] = [
		...(refund === 0
			? []
			: [{ label: signedKbLabel(refund), color: GAIN_COLOR }]),
		{
			label: chosen ? HOLD_DROPPING_BADGE : HOLD_DROP_BADGE,
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

export const kantoGateHoldAt = (frame: GateHoldFrame): GateHoldScreenProps => {
	const { gate, answers, configs, chosen = [] } = frame;
	const swatch = gateSwatchAt(gate);
	const demand = coverageDemandFor(gate);
	const occupied = occupiedSlots(configs);
	const demandSlots = peelQuotaSlotsFor(occupied, failPeelShareFor(gate), gate);
	const chosenConfigs = configs.filter((config) => chosen.includes(config.id));
	const chosenSlots = occupiedSlots(chosenConfigs);
	const refund = peelRefundFor(configs, chosenConfigs);
	const action = holdActionOf(demandSlots, chosenSlots, chosenConfigs.length);
	const shortBy = roundToOneDecimal(demand - totalCoverage(answers));

	return {
		header: {
			swatch,
			swatches: trackTo(gate),
			title: `${swatch.gateName} ${HOLD_TITLE_SUFFIX}`,
			subtitle: `gate ${gate} of ${VICTORY_GATE} · the meter fell short · ${plural(SLICE_WINDOW, "fresh poll")} on the retry`,
			toll: {
				amount: plural(demandSlots, "slot"),
				note: `of ${plural(occupied, "slot")} to free`,
			},
			chips: holdChips(frame),
		},
		audits: holdAudits(gate, frame.auditIds ?? []),
		coverage: {
			title: COVERAGE_TITLE,
			summary: plural(byCategory(answers).size, "category").replace(
				"categorys",
				"categories"
			),
			badges: [{ label: `short by ${shortBy}%`, color: LOSS_COLOR }],
			open: frame.open,
			rows: coverageRows(answers, demand),
		},
		storage: {
			title: STORAGE_TITLE,
			summary: collectsOnDrop(configs) ? undefined : HOLD_NO_REFUND_NOTE,
			badges:
				refund === 0
					? [{ label: HOLD_NOTHING_PAID, color: TERM_COLOR }]
					: [{ label: signedKbLabel(refund), color: GAIN_COLOR }],
			open: frame.open,
			rows: holdStorageRows(frame, chosenConfigs),
		},
		drop: {
			title: HOLD_DROP_TITLE,
			meta: holdTallyOf(demandSlots, chosenSlots),
			note: collectsOnDrop(configs) ? HOLD_REFUND_NOTE : HOLD_NO_REFUND_NOTE,
			configs: configs.map((config) =>
				dropChip(config, configs, chosen.includes(config.id), () =>
					frame.onToggle?.(config.id)
				)
			),
		},
		footer: {
			aside: { label: GATE_REVIEW_LABEL, icon: "review", onPress: noop },
			action: { label: action.label, onPress: action.onPress },
			refusal: action.refusal,
		},
	};
};

const HOLD_BUILD: readonly Config[] = [
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

const HOLD_GATE = 4;

const holdFrame = (frame: Partial<GateHoldFrame> = {}): GateHoldFrame => ({
	gate: HOLD_GATE,
	answers: LAVENDER_ANSWERS,
	balanceBeforeKb: 102,
	configs: HOLD_BUILD,
	auditIds: ["cost-overrun"],
	...frame,
});

export const kantoGateHold = (): GateHoldScreenProps =>
	kantoGateHoldAt(holdFrame());

export const kantoGateHoldShort = (): GateHoldScreenProps =>
	kantoGateHoldAt(
		holdFrame({ configs: COINED_BUILD, chosen: [CONFIGS.js.id] })
	);

export const kantoGateHoldExact = (): GateHoldScreenProps =>
	kantoGateHoldAt(
		holdFrame({
			configs: COINED_BUILD,
			chosen: [CONFIGS.indexedDb.id, CONFIGS.js.id],
		})
	);

export const kantoGateHoldOver = (): GateHoldScreenProps =>
	kantoGateHoldAt(holdFrame({ chosen: [CONFIGS.cache.id] }));

export const kantoGateHoldCollected = (): GateHoldScreenProps =>
	kantoGateHoldAt(
		holdFrame({ configs: COLLECTED_BUILD, chosen: [CONFIGS.cache.id] })
	);

export const kantoGateHoldOpen = (): GateHoldScreenProps =>
	kantoGateHoldAt(holdFrame({ open: true }));

export const kantoGateHoldBuild = HOLD_BUILD;
export const kantoGateHoldCoinedBuild = COINED_BUILD;

export const kantoGateHoldSlotSizes: readonly number[] =
	HOLD_BUILD.map(slotsOf);

export const kantoGateHoldOccupiedSlots = occupiedSlots(HOLD_BUILD);

export const kantoGateHoldDemandSlots = peelQuotaSlotsFor(
	occupiedSlots(HOLD_BUILD),
	failPeelShareFor(HOLD_GATE),
	HOLD_GATE
);

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
