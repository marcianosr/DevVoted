import { getCategoryMetadata, isCategoryCode } from "~/shared/lib/categories";
import {
	count,
	type Count,
	duration,
	type Duration,
	percent,
	type Percent,
} from "~/shared/lib/displayValue";

import {
	type AnswerOutcome,
	nextStreak,
} from "~/modules/run/run/domain/run.model";
import {
	type SwatchFinish,
	swatchForGate,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";

/**
 * The day's awards (DVTD-wp69). Two kinds, and the difference matters:
 *
 * - **Poll-scoped** awards read today's answers — who was quickest, who got the
 *   one nobody else did.
 * - **Run-scoped** awards read live run state across *active runs only* — how
 *   deep, how wide, how hot. These rank a standing, not an activity, so a player
 *   who has not answered today still holds the deepest gate.
 *
 * Everything here is pure: correctness arrives as a callback and run state as
 * plain numbers, so no award needs a database to be tested.
 */

export type CommunityVoter = {
	id: string;
	displayName: string;
	/** Optional so fixtures stay lean — the handler always sets it. */
	photoUrl?: string | null;
	/** The viewer's own chip — rendered as "you". */
	you: boolean;
};

/**
 * What an award is worth. `configs` is this context's own — it carries a plural
 * the shared units have no reason to know about. `text` is for the two awards
 * whose value genuinely is prose (a gate's name, a question snippet), not an
 * escape hatch for numbers that were easier to format here.
 */
export type StandoutValue =
	| Duration
	| Count
	| Percent
	| { readonly unit: "configs"; readonly amount: number }
	| { readonly unit: "text"; readonly text: string };

/** A "standouts today" row: who, what for, and what it was worth. */
export type CommunityStandout = {
	voter: CommunityVoter;
	title: string;
	value: StandoutValue;
	/**
	 * A gate's badge to sit beside the value, when the value *is* a gate. Carried
	 * as theme and finish rather than a colour, because the palette lives in
	 * app.css and only the swatch roster knows which gate wears which.
	 */
	swatch?: { theme: SwatchTheme; finish: SwatchFinish };
};

type Player = { id: string; displayName: string; photoUrl: string | null };

/** One player's answer to one poll, folded from the day's response rows. */
export type CommunityAnswer = {
	pollId: number;
	user: Player;
	optionIds: Set<number>;
	categoryCode: string | null;
	answeredAt: Date | null;
	elapsedMs: number | null;
};

/**
 * Whether a pick counts as fully correct. A callback rather than the option
 * data, so this module never has to know what a poll record looks like — and so
 * every award that depends on correctness can be tested with a stub.
 */
export type CorrectnessCheck = (
	pollId: number,
	optionIds: ReadonlySet<number>
) => boolean;

/** A live run's standing. `outcomes` is its answer history, oldest first. */
export type ActiveRunStats = {
	user: Player;
	gatesCleared: number;
	coverage: number;
	configCount: number;
	outcomes: readonly AnswerOutcome[];
	/** The engine's *current* streak — the fallback for snapshots predating `outcomes`. */
	streak: number;
};

export type StandoutInput = {
	answers: readonly CommunityAnswer[];
	/** Polls the viewer is already past — the only ones an award may name. */
	eligiblePolls: readonly { id: number; question: string }[];
	isCorrect: CorrectnessCheck;
	seedCreatedAt: Date | null;
	runStats: readonly ActiveRunStats[];
	viewerId: string;
};

// ─── Shared plumbing ──────────────────────────────────────────────────────────

const toVoter = (user: Player, viewerId: string): CommunityVoter => ({
	...user,
	you: user.id === viewerId,
});

/**
 * The winner by `score`, ties broken on player id. Every award goes through here
 * because the day's answers arrive unordered — a `reduce` that keeps the first
 * best would hand the award to whichever row Postgres happened to return first.
 */
const topBy = <T>(
	items: readonly T[],
	score: (item: T) => number,
	playerOf: (item: T) => Player
): T | undefined =>
	[...items].sort(
		(a, b) =>
			score(b) - score(a) || playerOf(a).id.localeCompare(playerOf(b).id)
	)[0];

const award = (
	user: Player,
	viewerId: string,
	title: string,
	value: StandoutValue
): CommunityStandout => ({ voter: toVoter(user, viewerId), title, value });

const text = (value: string): StandoutValue => ({ unit: "text", text: value });

// ─── Poll-scoped awards ───────────────────────────────────────────────────────

type TimedAnswer = CommunityAnswer & { elapsedMs: number };
const isTimed = (answer: CommunityAnswer): answer is TimedAnswer =>
	answer.elapsedMs !== null;

const fastestAnswer = ({
	answers,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	// Negated, because `topBy` ranks high-to-low and quickest wins here.
	const fastest = topBy(
		answers.filter(isTimed),
		(answer) => -answer.elapsedMs,
		(answer) => answer.user
	);
	if (!fastest) return null;
	return award(
		fastest.user,
		viewerId,
		"fastest answer",
		duration(fastest.elapsedMs)
	);
};

const sinceDrop = (answeredAt: Date, seedCreatedAt: Date): StandoutValue =>
	duration(Math.max(0, answeredAt.getTime() - seedCreatedAt.getTime()));

type DatedAnswer = CommunityAnswer & { answeredAt: Date };
const isDated = (answer: CommunityAnswer): answer is DatedAnswer =>
	answer.answeredAt !== null;

const earliest = (answers: readonly DatedAnswer[]): DatedAnswer | undefined =>
	topBy(
		answers,
		(answer) => -answer.answeredAt.getTime(),
		(answer) => answer.user
	);

const firstToAnswer = ({
	answers,
	seedCreatedAt,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	if (!seedCreatedAt) return null;
	const first = earliest(answers.filter(isDated));
	if (!first) return null;
	return award(
		first.user,
		viewerId,
		"first to answer",
		sinceDrop(first.answeredAt, seedCreatedAt)
	);
};

/**
 * First to get one *right*. Distinct from "first to answer", which rewards being
 * quick off the mark whether or not it landed.
 */
const firstGood = ({
	answers,
	isCorrect,
	seedCreatedAt,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	if (!seedCreatedAt) return null;
	const first = earliest(
		answers
			.filter(isDated)
			.filter((answer) => isCorrect(answer.pollId, answer.optionIds))
	);
	if (!first) return null;
	return award(
		first.user,
		viewerId,
		"first good",
		sinceDrop(first.answeredAt, seedCreatedAt)
	);
};

const categoryNameOf = (code: string): string =>
	isCategoryCode(code) ? getCategoryMetadata(code).name : code;

const mostInCategory = ({
	answers,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	const tallies = new Map<
		string,
		{ user: Player; category: string; count: number }
	>();
	for (const answer of answers) {
		if (!answer.categoryCode) continue;
		const key = `${answer.user.id}:${answer.categoryCode}`;
		const tally = tallies.get(key) ?? {
			user: answer.user,
			category: answer.categoryCode,
			count: 0,
		};
		tally.count += 1;
		tallies.set(key, tally);
	}
	const top = topBy(
		[...tallies.values()],
		(tally) => tally.count,
		(tally) => tally.user
	);
	// A "most" of one is no distinction — the award waits for a real lead.
	if (!top || top.count < 2) return null;
	return award(
		top.user,
		viewerId,
		`most ${categoryNameOf(top.category)} polls`,
		count(top.count)
	);
};

const QUESTION_MAX = 32;

const shorten = (question: string): string =>
	question.length <= QUESTION_MAX
		? question
		: `${question.slice(0, QUESTION_MAX - 1).trimEnd()}…`;

/**
 * The poll exactly one player got right — the day's hardest question, named by
 * the one who cracked it.
 *
 * Only polls the viewer has already met are eligible: naming one still ahead of
 * them would spoil the climb, which is the same rule the poll board's redaction
 * follows. Where several qualify, the latest in the viewer's sequence wins —
 * it is the one they most recently struggled with.
 */
const onlyOneRight = ({
	answers,
	eligiblePolls,
	isCorrect,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	const lone = eligiblePolls
		.map((poll) => {
			const winners = answers.filter(
				(answer) =>
					answer.pollId === poll.id &&
					isCorrect(answer.pollId, answer.optionIds)
			);
			return winners.length === 1 ? { poll, winner: winners[0] } : null;
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

	const latest = lone.at(-1);
	if (!latest) return null;
	return award(
		latest.winner.user,
		viewerId,
		"only one right",
		text(shorten(latest.poll.question))
	);
};

// ─── Run-scoped awards (active runs only) ─────────────────────────────────────

/** The longest run of correct answers, not the streak being ridden now. */
export const longestCorrectStreak = (
	outcomes: readonly AnswerOutcome[]
): number => {
	let best = 0;
	let current = 0;
	for (const outcome of outcomes) {
		current = nextStreak(current, outcome);
		best = Math.max(best, current);
	}
	return best;
};

/** Snapshots taken before the run engine kept a history fall back to the live streak. */
const streakOf = (stats: ActiveRunStats): number =>
	stats.outcomes.length > 0
		? longestCorrectStreak(stats.outcomes)
		: stats.streak;

const runAward = (
	{ runStats, viewerId }: StandoutInput,
	title: string,
	score: (stats: ActiveRunStats) => number,
	format: (stats: ActiveRunStats) => StandoutValue,
	floor = 1
): { standout: CommunityStandout; top: ActiveRunStats } | null => {
	const top = topBy(runStats, score, (stats) => stats.user);
	// Nothing to celebrate: an award nobody has earned is noise, not a leaderboard.
	if (!top || score(top) < floor) return null;
	return { standout: award(top.user, viewerId, title, format(top)), top };
};

const justTheAward = (
	result: ReturnType<typeof runAward>
): CommunityStandout | null => result?.standout ?? null;

const deepestGate = (input: StandoutInput): CommunityStandout | null => {
	const result = runAward(
		input,
		"deepest gate",
		(stats) => stats.gatesCleared,
		(stats) => text(swatchForGate(stats.gatesCleared)?.gateName ?? "the climb")
	);
	if (!result) return null;
	// The badge, not just its name: the gate you are chasing is a colour before
	// it is a word, everywhere else in the game.
	const swatch = swatchForGate(result.top.gatesCleared);
	return swatch
		? {
				...result.standout,
				swatch: { theme: swatch.theme, finish: swatch.finish },
			}
		: result.standout;
};

const longestStreak = (input: StandoutInput): CommunityStandout | null =>
	justTheAward(
		runAward(
			input,
			"longest streak",
			streakOf,
			(stats) => count(streakOf(stats)),
			// One correct answer in a row is just an answer.
			2
		)
	);

const mostCoverage = (input: StandoutInput): CommunityStandout | null =>
	justTheAward(
		runAward(
			input,
			"most coverage",
			(stats) => stats.coverage,
			(stats) => percent(roundToOneDecimal(stats.coverage))
		)
	);

const widestPipeline = (input: StandoutInput): CommunityStandout | null =>
	justTheAward(
		runAward(
			input,
			"widest pipeline",
			(stats) => stats.configCount,
			(stats) => ({ unit: "configs", amount: stats.configCount })
		)
	);

// ─── The panel ────────────────────────────────────────────────────────────────

/**
 * Poll-scoped first, run-scoped second. The panel lays these out in two columns
 * filled top-to-bottom, so the order is also the split: how today went on the
 * left, where the climb stands on the right.
 */
const AWARDS = [
	fastestAnswer,
	firstToAnswer,
	firstGood,
	mostInCategory,
	onlyOneRight,
	deepestGate,
	longestStreak,
	mostCoverage,
	widestPipeline,
] as const;

export const standoutsFor = (input: StandoutInput): CommunityStandout[] =>
	AWARDS.map((build) => build(input)).filter(
		(standout): standout is CommunityStandout => standout !== null
	);
