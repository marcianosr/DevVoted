import { rungFitting } from "~/modules/run/build/domain/buildSpace.model";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import { clearsAt } from "~/modules/run/gate/domain/gate.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	type Config,
	faucetKbPerCorrect,
	maxLevelOf,
	sellRefund,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
	failPeelShareFor,
	peelQuotaSlotsFor,
	BASE_SLOTS,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import type { OutcomeRevealData } from "~/ui/kanto-theme/OutcomeReveal.ui";
import {
	type GateAnswer,
	type GateOutcomeFrame,
	gateOutcomePropsFor,
	outcomeRevealOf,
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
	peelSlotsOf,
	peelTallyOf,
	type GateAnswer,
	type GateOutcomeFrame,
	ONLY_BANKED_CARRIES,
	BRIBE_LABEL,
	GATE_COMMUNITY_LABEL,
	GATE_REVIEW_LABEL,
	GATE_SHOP_LABEL,
	NEW_RUN_LABEL,
	NO_REFUND_NOTE,
	REFUND_NOTE,
	REFUSAL_LABEL,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";

export {
	type ReviewFrame,
	REVIEW_DEX_NOTE,
	REVIEW_EXPAND_LABEL,
	REVIEW_HINT,
} from "~/modules/run/gate/application/gateReview.viewmodel";
import { KANTO_RUN_PAYOUTS } from "~/test/kantoPoll.factory";
import { pollPayoutRows } from "~/test/swatchTrack.factory";

export type GateOutcomeFixture = Omit<
	GateOutcomeFrame,
	| "bar"
	| "payoutKb"
	| "bonusKb"
	| "faucetKb"
	| "billKb"
	| "swatchGates"
	| "closing"
> & {
	openingHeld?: number;
};

const heldPercentOf = (fixture: GateOutcomeFixture) =>
	roundToOneDecimal(
		Math.min(
			percentOf(1),
			Math.max(0, (fixture.openingHeld ?? 0) + totalCoverage(fixture.answers))
		)
	);

const heldRatioOf = (fixture: GateOutcomeFixture) =>
	ratioOf(heldPercentOf(fixture));

const ladderBarFor = (fixture: GateOutcomeFixture) => ({
	floor: roundToOneDecimal(percentOf(floorAt(fixture.gate))),
	ok: roundToOneDecimal(percentOf(okAt(fixture.gate))),
	healthy: roundToOneDecimal(percentOf(healthyAt(fixture.gate))),
	held: heldPercentOf(fixture),
});

const settle = (fixture: GateOutcomeFixture): GateOutcomeFrame => {
	const { openingHeld: _openingHeld, ...frame } = fixture;
	const ratio = heldRatioOf(fixture);
	const band = bandFor(ratio, fixture.gate).id;
	const clears = clearsAt(band, fixture.gate) && fixture.heldBy === undefined;
	const closing = clears
		? "cleared"
		: band === "danger" && fixture.heldBy === undefined
			? "fatal"
			: "held";
	const payoutKb = clears
		? gatePayoutKb(ratio, fixture.gate, occupiedSlots(fixture.configs))
		: 0;
	const correct = fixture.answers.filter(
		(answer) => answer.outcome === "correct"
	).length;

	return {
		...frame,
		closing,
		swatchGates: correct >= SLICE_WINDOW ? [fixture.gate] : [],
		bar: { ...ladderBarFor(fixture), band },
		payoutKb,
		bonusKb: payoutKb - Math.round(payoutKb / PERFECT_BONUS),
		faucetKb: faucetKbPerCorrect(fixture.configs) * correct,
		billKb: clears ? rungFitting(fixture.buildSpace ?? BASE_SLOTS).kb : 0,
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
		units: 3.08,
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
		units: 4.8,
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
		units: -1.1,
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
		units: 2.8,
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
		units: 3.08,
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
	{ ...CONFIGS.deprecated, coverageMultiplier: 0.5 },
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
	83
);

export const OK_ANSWERS = outcomesAt(
	["correct", "correct", "wrong", "partial", "correct"],
	68
);

export const SHAKY_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "partial", "correct"],
	58
);

export const UNSCORED_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "wrong", "wrong"],
	12
);

export const DANGER_ANSWERS = outcomesAt(
	["correct", "wrong", "wrong", "partial", "wrong"],
	52
);

const outcomeFrame = (
	frame: Partial<GateOutcomeFixture> = {}
): GateOutcomeFixture => ({
	gate: OUTCOME_GATE,
	answers: HEALTHY_ANSWERS,
	balanceBeforeKb: 102,
	buildSpace: 1,
	configs: LAVENDER_BUILD,
	auditIds: ["cost-overrun"],
	unlocked: [
		{
			config: CONFIGS.coldStart,
			detail: "Earned: peeked the community split 5 times",
		},
	],
	titles: [{ name: "CSS Carrier", detail: "50 distinct CSS polls answered" }],
	upgraded: [
		{
			config: { ...CONFIGS.telemetry, level: 2 },
			detail: "upgraded by Dependabot",
		},
	],
	removed: [{ config: CONFIGS.css, detail: "its deprecation ran out" }],
	paid: [{ config: CONFIGS.indexedDb, detail: "4 correct answers", kb: 32 }],
	payouts: {
		rows: pollPayoutRows(KANTO_RUN_PAYOUTS.slice(0, OUTCOME_GATE + 1)),
	},
	...frame,
});

export const kantoGatePerfect = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame({ answers: PERFECT_ANSWERS }));

export const kantoGateHealthy = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame());

export const kantoGateOk = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame({ answers: OK_ANSWERS }));

export const kantoGateShaky = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({ answers: SHAKY_ANSWERS, balanceBeforeKb: 28 })
	);

export const kantoGateHeldUnscored = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			answers: UNSCORED_ANSWERS,
			openingHeld: 63,
			heldBy: "unscored",
			balanceBeforeKb: 12,
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

export const kantoGateShakyCollecting = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			answers: SHAKY_ANSWERS,
			balanceBeforeKb: 12,
			configs: COLLECTED_BUILD,
		})
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

const SMALL_BUILD: readonly Config[] = [
	CONFIGS.indexedDb,
	{ ...CONFIGS.telemetry, level: 2 },
];

const SMALL_BUILD_BILL_SLOTS = 3;

const smallBuildFrame = (
	frame: Partial<GateOutcomeFixture>
): GateOutcomeFixture =>
	outcomeFrame({
		answers: SHAKY_ANSWERS,
		configs: SMALL_BUILD,
		peelSlotsRemaining: SMALL_BUILD_BILL_SLOTS,
		...frame,
	});

export const kantoGateShakyFundedDropping = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			answers: SHAKY_ANSWERS,
			balanceBeforeKb: 512,
			chosen: [CONFIGS.cache.id],
		})
	);

export const kantoGateShakyStorageOnly = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(smallBuildFrame({ balanceBeforeKb: 512 }));

export const kantoGateShakyMix = (
	chosen: readonly string[] = [],
	fromStorage = false
): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		smallBuildFrame({ balanceBeforeKb: 28, chosen, fromStorage })
	);

export const kantoGateShakyMixSettled = (): GateOutcomeScreenProps =>
	kantoGateShakyMix([CONFIGS.indexedDb.id], true);

export const kantoGateShakyStuck = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		smallBuildFrame({ balanceBeforeKb: 0, configs: [CONFIGS.indexedDb] })
	);

export const kantoGateDanger = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({ answers: DANGER_ANSWERS, balanceBeforeKb: 41 })
	);

const CAUGHT_BUILD: readonly Config[] = [CONFIGS.tryCatch, ...LAVENDER_BUILD];

const caughtFrame = (chosen: readonly string[] = []): GateOutcomeFixture =>
	outcomeFrame({
		answers: DANGER_ANSWERS,
		balanceBeforeKb: 192,
		configs: CAUGHT_BUILD,
		heldBy: "catch",
		caughtFatalBy: CONFIGS.tryCatch.label,
		peelSlotsRemaining: Math.max(
			peelQuotaSlotsFor(
				occupiedSlots(CAUGHT_BUILD),
				failPeelShareFor(OUTCOME_GATE),
				OUTCOME_GATE
			),
			slotsOf(CONFIGS.tryCatch)
		),
		chosen,
	});

export const kantoGateCaught = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(caughtFrame());

export const kantoGateCaughtDropped = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(caughtFrame([CONFIGS.tryCatch.id]));

export const kantoGateCaughtOwing = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt({
		...caughtFrame([CONFIGS.tryCatch.id]),
		peelSlotsRemaining: slotsOf(CONFIGS.tryCatch) + 3,
	});

export const kantoGateCaughtFrame = caughtFrame;

export const kantoRevealCleared = (): OutcomeRevealData =>
	outcomeRevealOf(settle(outcomeFrame()));

export const kantoRevealPerfect = (): OutcomeRevealData =>
	outcomeRevealOf(settle(outcomeFrame({ answers: PERFECT_ANSWERS })));

export const kantoRevealShaky = (): OutcomeRevealData =>
	outcomeRevealOf(
		settle(outcomeFrame({ answers: SHAKY_ANSWERS, balanceBeforeKb: 28 }))
	);

export const kantoRevealCaught = (): OutcomeRevealData =>
	outcomeRevealOf(settle(caughtFrame()));

export const kantoRevealEnded = (): OutcomeRevealData =>
	outcomeRevealOf(
		settle(outcomeFrame({ answers: DANGER_ANSWERS, balanceBeforeKb: 41 }))
	);

export const kantoGateOutcomeOpen = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(outcomeFrame({ open: true }));

export const kantoGateZero = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			gate: 0,
			answers: PERFECT_ANSWERS,
			balanceBeforeKb: 0,
			buildSpace: 0,
			configs: [CONFIGS.js, CONFIGS.unitTests],
			auditIds: [],
			unlocked: [],
			titles: [],
			upgraded: [],
			removed: [],
			paid: [],
		})
	);

export const kantoGateWon = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			gate: VICTORY_GATE,
			answers: PERFECT_ANSWERS,
			balanceBeforeKb: 4096,
			buildSpace: 3,
			configs: CONFIG_LIST.slice(0, 4),
			auditIds: [],
			won: true,
		})
	);

export const kantoGateSummit = (): GateOutcomeScreenProps =>
	kantoGateOutcomeAt(
		outcomeFrame({
			gate: VICTORY_GATE,
			balanceBeforeKb: 1024,
			buildSpace: 3,
			configs: CONFIG_LIST.slice(0, 4),
			auditIds: ["timeout"],
		})
	);

export const kantoGateOutcomeBuild = LAVENDER_BUILD;
export const kantoGateOutcomeCoinedBuild = COINED_BUILD;
export const kantoGateOutcomeGate = OUTCOME_GATE;

export const kantoGateOutcomeSellValues: readonly number[] =
	LAVENDER_BUILD.map(sellRefund);

export const kantoGatePeelValues: readonly number[] = LAVENDER_BUILD.map(
	(config) => slotsOf(config) * PEEL_KB_PER_SLOT
);

export const kantoGateOutcomeOccupiedSlots = occupiedSlots(LAVENDER_BUILD);

export const kantoGatePeelBillSlots = peelQuotaSlotsFor(
	occupiedSlots(LAVENDER_BUILD),
	failPeelShareFor(OUTCOME_GATE),
	OUTCOME_GATE
);

export const kantoGatePeelBillKb = kantoGatePeelBillSlots * PEEL_KB_PER_SLOT;

export const kantoGateAnswers = LAVENDER_ANSWERS;
export const kantoGateWindow = SLICE_WINDOW;
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
