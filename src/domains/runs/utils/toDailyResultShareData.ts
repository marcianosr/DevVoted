import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";
import type { CategoryCode } from "~/domains/shared/categories";

import type {
	CoverageBar,
	DailyResultShareData,
} from "./buildDailyResultShare";

// Number of categories shown in the coverage row. Top-N by coverage keeps the
// card reading as strength/progress (ego-safety rule 2).
const COVERAGE_CATEGORIES = 3;

// Coverage is stored as a percentage-like magnitude; the bar wants a 0..1 ratio.
const COVERAGE_FULL = 100;

// Short, monospace-friendly labels for the coverage row. Falls back to the
// upper-cased code for anything not listed.
const CATEGORY_SHORT_LABEL: Partial<Record<CategoryCode, string>> = {
	js: "JS",
	css: "CSS",
	ts: "TS",
	html: "HTML",
	git: "Git",
	react: "React",
	java: "Java",
	python: "Py",
	ruby: "Ruby",
	"general-frontend": "FE",
	"general-backend": "BE",
};

const shortLabel = (code: CategoryCode): string =>
	CATEGORY_SHORT_LABEL[code] ?? code.toUpperCase();

export const toCoverageBars = (
	categoryCoverage: readonly RunCategoryCoverage[]
): CoverageBar[] =>
	[...categoryCoverage]
		.sort((a, b) => b.currentCoverage - a.currentCoverage)
		.slice(0, COVERAGE_CATEGORIES)
		.map((c) => ({
			label: shortLabel(c.categoryCode),
			ratio: c.currentCoverage / COVERAGE_FULL,
		}));

// "How far you got" as counts, never attempt-order: the first N cells are the
// window's correct answers, the rest are the misses that still count as progress.
// Deliberately not ordered so no cell can be read as "today's poll".
export const toPipelineCells = (
	context: PipelineEvaluationContext
): boolean[] => {
	const answered = context.pollsAnsweredInWindow;
	const correct = context.correctAnswersInWindow;
	return Array.from({ length: answered }, (_, i) => i < correct);
};

/** Minimal per-option slice the crowd-stat derivations need. */
export type OptionTally = {
	isCorrect: boolean;
	votes: number;
};

const toTallies = (community: CommunityStats): OptionTally[] =>
	community.optionBreakdown.map((option) => ({
		isCorrect: option.isCorrect,
		votes: option.voters.length,
	}));

/**
 * Share of the community stumped by today's poll — the fraction of votes that
 * landed on an incorrect option. This is a fact about the CROWD, not the sharer,
 * so it is safe to show verbatim and frames the reader's challenge.
 */
export const deriveStumpedPct = (tallies: readonly OptionTally[]): number => {
	const votes = tallies.reduce(
		(acc, option) => ({
			total: acc.total + option.votes,
			wrong: acc.wrong + (option.isCorrect ? 0 : option.votes),
		}),
		{ total: 0, wrong: 0 }
	);

	if (votes.total === 0) return 0;
	return Math.round((votes.wrong / votes.total) * 100);
};

/**
 * "beat X% of devs" — the percentile the card brags about.
 *
 * ⚠️ DECISION POINT (yours to make — see the message in chat):
 * There is no single obvious source for this. Derive it from the community
 * `tallies` (and optionally whether the viewer got today's poll right) while
 * honouring ego-safety rule 2: an average or bad day must NEVER produce a
 * humiliating number. Extend the input if you want more signal.
 *
 * The stub below returns the stumped share, i.e. "if you got it right you beat
 * everyone who didn't" — a safe placeholder, but replace it with your call.
 */
export const derivePercentile = (
	tallies: readonly OptionTally[],
	viewerIsCorrect: boolean
): number => {
	// TODO(marciano): own this derivation.
	return viewerIsCorrect ? deriveStumpedPct(tallies) : 0;
};

type ToShareDataArgs = {
	dayNumber: number;
	categoryCoverage: readonly RunCategoryCoverage[];
	windowContext: PipelineEvaluationContext;
	gateCleared: boolean;
	community: CommunityStats;
	viewerIsCorrect: boolean;
	todayCategoryName: string;
	streakDays?: number;
};

/**
 * Maps live run + community domain data onto the plain, ego-safe props the pure
 * string builder consumes. Kept separate (and unit-tested) so the mapping rules
 * are verifiable without React or a server.
 */
export const toDailyResultShareData = ({
	dayNumber,
	categoryCoverage,
	windowContext,
	gateCleared,
	community,
	viewerIsCorrect,
	todayCategoryName,
	streakDays,
}: ToShareDataArgs): DailyResultShareData => ({
	dayNumber,
	pipeline: toPipelineCells(windowContext),
	gateNumber: windowContext.currentGate,
	gateCleared,
	coverage: toCoverageBars(categoryCoverage),
	streakDays,
	percentile: derivePercentile(toTallies(community), viewerIsCorrect),
	todayCategory: todayCategoryName,
	hardPct: deriveStumpedPct(toTallies(community)),
});
