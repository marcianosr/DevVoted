import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	type Config,
	describeConfig,
	faucetKbPerCorrect,
	maxLevelOf,
	sellRefund,
} from "~/modules/run/config/domain/config.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
	failPeelShareFor,
	peelQuotaSlotsFor,
	planBillKb,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import {
	type GateAnswer,
	type GateOutcomeFrame,
	gateOutcomePropsFor,
	PEEL_KB_PER_SLOT,
	totalCoverage,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	PERFECT_BONUS,
	bandFor,
	floorAt,
	percentOf,
	ratioOf,
	gatePayoutKb,
	healthyAt,
	okAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import { reviewPropsFor } from "~/modules/run/gate/application/gateReview.viewmodel";

export const kantoReviewAt = reviewPropsFor;

import type { GateOutcomeScreenProps } from "~/ui/kanto-theme/GateOutcomeScreen.ui";
import type { ReviewScreenProps } from "~/ui/kanto-theme/ReviewScreen.ui";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

export {
	answerTallyOf,
	peelTallyOf,
	retryActionOf,
	type GateAnswer,
	type GateOutcomeFrame,
	type RetryAction,
	ARCHIVE_EMPTIES,
	BRIBE_LABEL,
	GATE_COMMUNITY_LABEL,
	GATE_REVIEW_LABEL,
	GATE_SHOP_LABEL,
	NEW_RUN_LABEL,
	NO_REFUND_NOTE,
	PEEL_PAID,
	PEEL_REFUSAL,
	REFUND_NOTE,
	REFUSAL_LABEL,
	REFUSAL_NOTE,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";

export {
	type ReviewFrame,
	REVIEW_DEX_NOTE,
	REVIEW_EXPAND_LABEL,
	REVIEW_HINT,
} from "~/modules/run/gate/application/gateReview.viewmodel";

const CLEARING_BANDS = {
	perfect: true,
	healthy: true,
	ok: true,
	shaky: false,
	danger: false,
} as const;

export type GateOutcomeFixture = Omit<
	GateOutcomeFrame,
	"bar" | "payoutKb" | "bonusKb" | "faucetKb" | "billKb"
>;

const heldRatioOf = (answers: readonly GateAnswer[]) =>
	Math.min(1, Math.max(0, ratioOf(totalCoverage(answers))));

const ladderBarFor = (fixture: GateOutcomeFixture) => ({
	floor: roundToOneDecimal(percentOf(floorAt(fixture.gate))),
	ok: roundToOneDecimal(percentOf(okAt(fixture.gate))),
	healthy: roundToOneDecimal(percentOf(healthyAt(fixture.gate))),
	held: roundToOneDecimal(
		Math.min(percentOf(1), Math.max(0, totalCoverage(fixture.answers)))
	),
});

const settle = (fixture: GateOutcomeFixture): GateOutcomeFrame => {
	const ratio = heldRatioOf(fixture.answers);
	const band = bandFor(ratio, fixture.gate).id;
	const clears = CLEARING_BANDS[band];
	const payoutKb = clears
		? gatePayoutKb(
				ratio,
				fixture.gate,
				occupiedSlots(fixture.configs),
				fixture.streak ?? 0
			)
		: 0;
	const correct = fixture.answers.filter(
		(answer) => answer.outcome === "correct"
	).length;

	return {
		...fixture,
		bar: ladderBarFor(fixture),
		payoutKb,
		bonusKb: payoutKb - Math.round(payoutKb / PERFECT_BONUS),
		faucetKb: faucetKbPerCorrect(fixture.configs) * correct,
		billKb: clears ? planBillKb(fixture.planTier ?? 0) : 0,
	};
};

export const kantoGateOutcomeAt = (
	fixture: GateOutcomeFixture
): GateOutcomeScreenProps => gateOutcomePropsFor(settle(fixture));

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
	46
);

export const SHAKY_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "partial", "correct"],
	38
);

export const DANGER_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "partial", "wrong"],
	20
);

const outcomeFrame = (
	frame: Partial<GateOutcomeFixture> = {}
): GateOutcomeFixture => ({
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

export const kantoGateWon = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			gate: VICTORY_GATE,
			answers: PERFECT_ANSWERS,
			balanceBeforeKb: 4096,
			planTier: 3,
			configs: CONFIG_LIST.slice(0, 4),
			streak: 12,
			auditIds: [],
			won: true,
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
/** The ladder lines, re-exported: a ui/*.spec may not reach into a module itself. */
export const kantoGateHealthyLine = (gate: number): number =>
	roundToOneDecimal(percentOf(healthyAt(gate)));
export { maxLevelOf };

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
