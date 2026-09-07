import type { Count, Duration, Percent } from "~/shared/lib/displayValue";

import {
	type AnswerOutcome,
	nextStreak,
} from "~/modules/run/run/domain/runPoll.model";
import {
	type SwatchFinish,
	swatchForGate,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { trackPosition } from "~/modules/run/community/domain/climbMap.model";

/**
 * The day's awards (DVTD-wp69, reshaped by ADR-065). Two kinds, and the
 * difference matters:
 *
 * - **Poll-scoped** awards read today's answers — who was right where the room
 *   was wrong.
 * - **Run-scoped** awards read live run state across *active runs only* — how
 *   deep, how wide, how light. These rank a standing, not an activity, so a
 *   player who has not answered today still holds the deepest position.
 *
 * Everything here is pure: correctness arrives as a callback and run state as
 * plain numbers, so no award needs a database to be tested.
 */

export type CommunityVoter = {
	id: string;
	displayName: string;
	/** Optional so fixtures stay lean — the handler always sets it. */
	photoUrl?: string | null;
	/** The equipped border's art, worn wherever the game draws the player. */
	borderUrl?: string | null;
	/** The viewer's own chip — rendered as "you". */
	you: boolean;
};

/**
 * What an award is worth. `configs` is this context's own — it carries a plural
 * the shared units have no reason to know about. The six live awards all speak
 * prose (`text`); the other variants stay for the fixtures that still emit them.
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

type Player = {
	id: string;
	displayName: string;
	photoUrl: string | null;
	borderUrl: string | null;
};

/** One player's answer to one poll, folded from the day's response rows. */
export type CommunityAnswer = {
	pollId: number;
	user: Player;
	optionIds: Set<number>;
	/** Given at a Mirror gate, so the picks answer the inverted poll (ADR-038).
	 * Whoever grades this answer has to invert with it. */
	mirrored: boolean;
};

/**
 * Whether a pick counts as fully correct. A callback rather than the option
 * data, so this module never has to know what a poll record looks like — and so
 * every award that depends on correctness can be tested with a stub.
 */
export type CorrectnessCheck = (
	pollId: number,
	optionIds: ReadonlySet<number>,
	/** Graded against the mirrored poll when true (ADR-038). */
	mirrored: boolean
) => boolean;

/** A live run's standing. `outcomes` is its answer history, oldest first. */
export type ActiveRunStats = {
	user: Player;
	gatesCleared: number;
	pollsIntoGate: number;
	configCount: number;
	slotsHeld: number;
	configsLost: number;
	startedAtGate: number;
	outcomes: readonly AnswerOutcome[];
};

export type StandoutInput = {
	answers: readonly CommunityAnswer[];
	/** Polls the viewer is already past — the only ones an award may name. */
	eligiblePolls: readonly { id: number }[];
	isCorrect: CorrectnessCheck;
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

const plural = (amount: number, noun: string): string =>
	`${amount} ${noun}${amount === 1 ? "" : "s"}`;

const withGateSwatch = (
	standout: CommunityStandout,
	gate: number
): CommunityStandout => {
	const swatch = swatchForGate(gate);
	if (!swatch) return standout;
	return {
		...standout,
		swatch: { theme: swatch.theme, finish: swatch.finish },
	};
};

const runAward = (
	runStats: readonly ActiveRunStats[],
	viewerId: string,
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

// ─── The six (ADR-065, grid order) ────────────────────────────────────────────

const deepest = ({
	runStats,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	const result = runAward(
		runStats,
		viewerId,
		"deepest",
		(stats) =>
			trackPosition({
				gate: stats.gatesCleared,
				pollsIntoGate: stats.pollsIntoGate,
			}),
		(stats) =>
			text(
				stats.pollsIntoGate === 0
					? `gate ${stats.gatesCleared}`
					: `gate ${stats.gatesCleared} · poll ${stats.pollsIntoGate}`
			)
	);
	if (!result) return null;
	return withGateSwatch(result.standout, result.top.gatesCleared);
};

export const AGAINST_ROOM_MAX_SHARE = 50;

type Room = {
	index: number;
	right: readonly CommunityAnswer[];
	share: number;
};

const againstTheRoom = ({
	answers,
	eligiblePolls,
	isCorrect,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	const rooms = eligiblePolls
		.map((poll, index): Room | null => {
			const pollAnswers = answers.filter((answer) => answer.pollId === poll.id);
			const right = pollAnswers.filter((answer) =>
				isCorrect(answer.pollId, answer.optionIds, answer.mirrored)
			);
			if (right.length === 0) return null;
			const share = Math.round((right.length / pollAnswers.length) * 100);
			if (share > AGAINST_ROOM_MAX_SHARE) return null;
			return { index, right, share };
		})
		.filter((room): room is Room => room !== null);

	const hardest = rooms.reduce<Room | null>(
		(best, room) => (best === null || room.share <= best.share ? room : best),
		null
	);
	if (!hardest) return null;

	const winner = topBy(
		hardest.right,
		() => 0,
		(answer) => answer.user
	);
	if (!winner) return null;
	return award(
		winner.user,
		viewerId,
		"against the room",
		text(`right on poll ${hardest.index + 1} · ${hardest.share}% were`)
	);
};

const sweepGateOf = (stats: ActiveRunStats): number | null => {
	const settledCount = stats.outcomes.length - stats.pollsIntoGate;
	for (let back = 0; (back + 1) * SLICE_WINDOW <= settledCount; back++) {
		const end = settledCount - back * SLICE_WINDOW;
		const chunk = stats.outcomes.slice(end - SLICE_WINDOW, end);
		const gate = stats.gatesCleared - 1 - back;
		if (gate < 0 || gate < stats.startedAtGate) return null;
		if (chunk.every((outcome) => outcome === "correct")) return gate;
	}
	return null;
};

const cleanSweep = ({
	runStats,
	viewerId,
}: StandoutInput): CommunityStandout | null => {
	const sweeps = runStats.flatMap((stats) => {
		const gate = sweepGateOf(stats);
		return gate === null ? [] : [{ stats, gate }];
	});
	const top = topBy(
		sweeps,
		(sweep) => sweep.gate,
		(sweep) => sweep.stats.user
	);
	if (!top) return null;
	const gateName = swatchForGate(top.gate)?.gateName ?? `gate ${top.gate}`;
	return withGateSwatch(
		award(
			top.stats.user,
			viewerId,
			"clean sweep",
			text(`${SLICE_WINDOW} of ${SLICE_WINDOW} at ${gateName}`)
		),
		top.gate
	);
};

const widestBuild = ({
	runStats,
	viewerId,
}: StandoutInput): CommunityStandout | null =>
	justTheAward(
		runAward(
			runStats,
			viewerId,
			"widest build",
			(stats) => stats.slotsHeld,
			(stats) => text(`${plural(stats.slotsHeld, "slot")} held`)
		)
	);

export const TRAVELLING_LIGHT_STRIDE = 100;

const travellingLight = ({
	runStats,
	viewerId,
}: StandoutInput): CommunityStandout | null =>
	justTheAward(
		runAward(
			runStats.filter(
				(stats) =>
					stats.gatesCleared > stats.startedAtGate && stats.configCount >= 1
			),
			viewerId,
			"travelling light",
			(stats) =>
				stats.gatesCleared * TRAVELLING_LIGHT_STRIDE - stats.configCount,
			(stats) =>
				text(
					`gate ${stats.gatesCleared} on ${plural(stats.configCount, "config")}`
				)
		)
	);

export const COMEBACK_MIN_LOSSES = 2;

const comeback = ({
	runStats,
	viewerId,
}: StandoutInput): CommunityStandout | null =>
	justTheAward(
		runAward(
			runStats.filter((stats) => stats.gatesCleared > stats.startedAtGate),
			viewerId,
			"comeback",
			(stats) => stats.configsLost,
			(stats) =>
				text(`cleared after losing ${plural(stats.configsLost, "config")}`),
			COMEBACK_MIN_LOSSES
		)
	);

// ─── Kept for proto-run's fixtures ────────────────────────────────────────────

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

// ─── The panel ────────────────────────────────────────────────────────────────

/** Registry order is the grid order (ADR-065). */
const AWARDS = [
	deepest,
	againstTheRoom,
	cleanSweep,
	widestBuild,
	travellingLight,
	comeback,
] as const;

export const standoutsFor = (input: StandoutInput): CommunityStandout[] =>
	AWARDS.map((build) => build(input)).filter(
		(standout): standout is CommunityStandout => standout !== null
	);
