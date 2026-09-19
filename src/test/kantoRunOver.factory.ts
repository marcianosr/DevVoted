import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	floorAt,
	healthyAt,
	okAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type RunOverFrame,
	runOverPropsFor,
} from "~/modules/run/run/application/runOverScreen.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { CategoryCode } from "~/shared/lib/categories";
import type { PollScoreRow } from "~/ui/kanto-theme/PollScores.ui";
import type { RunOverScreenProps } from "~/ui/kanto-theme/RunOverScreen.ui";

export { runOverPropsFor, type RunOverFrame };

export {
	COMMUNITY_LABEL,
	NEW_RUN_LABEL,
	RUN_OVER_TITLE,
	SUMMIT_TITLE,
} from "~/modules/run/run/application/runOverScreen.viewmodel";

const PAID_COLOR = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
} as const;

/** The gate the sample run dies on: Lavender, deep enough to have a real ladder. */
export const SAMPLE_GATE = 4;

const CATEGORIES: readonly CategoryCode[] = [
	"css",
	"ts",
	"html",
	"js",
	"react",
];

const outcomeOf = (units: number) => {
	if (units === 0) return "wrong" as const;
	return units < 1 ? ("partial" as const) : ("correct" as const);
};

const answerAt = (
	gate: number,
	position: number,
	unitsEarned: number
): AnsweredPoll => ({
	id: `poll-${gate}-${position}`,
	question: `Question ${position + 1} at ${gateSwatchAt(gate).gateName}`,
	category: CATEGORIES[(gate + position) % CATEGORIES.length],
	outcome: outcomeOf(unitsEarned),
	picked: [],
	gate,
	coverageEarned: unitsEarned,
});

/** Each inner array is one gate's five payouts, in the order they were answered. */
export const runAnswers = (
	paid: readonly (readonly number[])[]
): readonly AnsweredPoll[] =>
	paid.flatMap((slots, gate) =>
		slots.map((unitsEarned, position) => answerAt(gate, position, unitsEarned))
	);

export const runPayoutRows = (
	paid: readonly (readonly number[])[]
): readonly PollScoreRow[] =>
	paid.map((slots, gate) => ({
		swatch: gateSwatchAt(gate),
		correct: slots.filter((unitsEarned) => unitsEarned >= 1).length,
		polls: slots.length,
		payouts: {
			slots: slots.map((unitsEarned) => ({
				figure: `${unitsEarned}`,
				color: PAID_COLOR[outcomeOf(unitsEarned)],
			})),
			total: `${slots.reduce((sum, unitsEarned) => sum + unitsEarned, 0)}`,
		},
		...(gate === paid.length - 1 ? { current: true } : {}),
	}));

const SAMPLE_PAID: readonly (readonly number[])[] = [
	[1.3, 1, 2, 0, 0],
	[1, 1, 0, 1, 0],
	[1, 0, 0.5, 1, 0],
	[1.2, 1, 0, 1, 0],
	[1, 0, 0, 0, 0],
];

const ladderAt = (gate: number) => ({
	floor: percentOf(floorAt(gate)),
	ok: percentOf(okAt(gate)),
	healthy: percentOf(healthyAt(gate)),
});

export const runOverFrame = (
	overrides: Partial<RunOverFrame> = {}
): RunOverFrame => ({
	gate: SAMPLE_GATE,
	won: false,
	answers: runAnswers(SAMPLE_PAID),
	payouts: { rows: runPayoutRows(SAMPLE_PAID) },
	bar: { ...ladderAt(SAMPLE_GATE), held: 24 },
	unitsHeld: 14,
	swatchGates: [0, 1, 2, 3],
	configs: [
		CONFIGS.js,
		CONFIGS.css,
		CONFIGS.codeCoverage,
		CONFIGS.indexedDb,
		CONFIGS.cache,
	],
	space: 12,
	weight: 9,
	balanceKb: 512,
	upkeepPaidKb: 96,
	unlocked: [
		{ config: CONFIGS.cache, detail: "Earned: answered 30 polls" },
		{ config: CONFIGS.indexedDb, detail: "Earned: cleared 4 gates" },
	],
	...overrides,
});

export const kantoRunOver = (
	overrides: Partial<RunOverFrame> = {}
): RunOverScreenProps => runOverPropsFor(runOverFrame(overrides));

export const kantoRunSummit = (): RunOverScreenProps =>
	kantoRunOver({
		gate: 12,
		won: true,
		bar: { ...ladderAt(12), held: 93 },
		unitsHeld: 60.5,
		swatchGates: [0, 1, 2, 3, 5, 7, 9],
	});
