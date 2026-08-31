import { describe, expect, it } from "vitest";

import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";
import {
	type ActiveRunStats,
	type CommunityAnswer,
	longestCorrectStreak,
	type StandoutInput,
	standoutsFor,
} from "~/modules/run/community/domain/standouts.model";

const RED = "red";
const BLUE = "blue";

const SEED_DROP = new Date("2026-05-13T09:00:00Z");
const minutesAfterDrop = (minutes: number): Date =>
	new Date(SEED_DROP.getTime() + minutes * 60_000);

const player = (id: string) => ({
	id,
	displayName: id[0].toUpperCase() + id.slice(1),
	photoUrl: null,
});

const answer = (
	over: Partial<CommunityAnswer> &
		Pick<CommunityAnswer, "pollId"> & {
			userId: string;
		}
): CommunityAnswer => {
	const { userId, ...rest } = over;
	return {
		user: player(userId),
		optionIds: new Set([1]),
		categoryCode: "css",
		answeredAt: minutesAfterDrop(5),
		elapsedMs: 20_000,
		mirrored: false,
		...rest,
		pollId: over.pollId,
	};
};

const runStats = (
	userId: string,
	over: Partial<Omit<ActiveRunStats, "user">> = {}
): ActiveRunStats => ({
	user: player(userId),
	gatesCleared: 0,
	coverage: 0,
	configCount: 0,
	outcomes: [],
	streak: 0,
	...over,
});

/** Everything off by default, so each test switches on only what it asserts. */
const input = (over: Partial<StandoutInput> = {}): StandoutInput => ({
	answers: [],
	eligiblePolls: [],
	isCorrect: () => false,
	seedCreatedAt: SEED_DROP,
	runStats: [],
	viewerId: RED,
	...over,
});

const titles = (result: ReturnType<typeof standoutsFor>) =>
	result.map((standout) => standout.title);

const find = (result: ReturnType<typeof standoutsFor>, title: string) =>
	result.find((standout) => standout.title === title);

describe("longestCorrectStreak", () => {
	it("counts nothing for a run that has answered nothing", () => {
		expect(longestCorrectStreak([])).toBe(0);
	});

	it("reports the best run, not the one still going", () => {
		const outcomes: AnswerOutcome[] = [
			"correct",
			"correct",
			"correct",
			"wrong",
			"correct",
		];
		expect(longestCorrectStreak(outcomes)).toBe(3);
	});

	it("breaks the streak on a wrong answer", () => {
		expect(longestCorrectStreak(["correct", "wrong", "correct"])).toBe(1);
	});

	it("holds the streak through a partial, mirroring the engine", () => {
		expect(longestCorrectStreak(["correct", "partial", "correct"])).toBe(2);
	});

	it("counts a flawless run end to end", () => {
		expect(longestCorrectStreak(["correct", "correct", "correct"])).toBe(3);
	});
});

describe("standoutsFor — awards nobody has earned", () => {
	it("returns nothing on an empty day", () => {
		expect(standoutsFor(input())).toEqual([]);
	});

	it("skips the timed awards when no answer carries a timing", () => {
		const result = standoutsFor(
			input({
				answers: [answer({ pollId: 1, userId: RED, elapsedMs: null })],
			})
		);

		expect(titles(result)).not.toContain("fastest answer");
	});

	it("skips the first-answer awards when the seed's drop time is unknown", () => {
		const result = standoutsFor(
			input({
				answers: [answer({ pollId: 1, userId: RED })],
				seedCreatedAt: null,
				isCorrect: () => true,
			})
		);

		expect(titles(result)).not.toContain("first to answer");
		expect(titles(result)).not.toContain("first good");
	});

	it("waits for a real lead before awarding a category", () => {
		const result = standoutsFor(
			input({ answers: [answer({ pollId: 1, userId: RED })] })
		);

		expect(titles(result)).not.toContain("most CSS polls");
	});

	it("skips run awards when every active run is still at zero", () => {
		const result = standoutsFor(input({ runStats: [runStats(RED)] }));

		expect(result).toEqual([]);
	});

	it("does not call one correct answer in a row a streak", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { outcomes: ["correct", "wrong"] })] })
		);

		expect(titles(result)).not.toContain("longest streak");
	});
});

describe("standoutsFor — poll-scoped awards", () => {
	it("crowns the quickest answer of the day", () => {
		const result = standoutsFor(
			input({
				answers: [
					answer({ pollId: 1, userId: RED, elapsedMs: 30_000 }),
					answer({ pollId: 1, userId: BLUE, elapsedMs: 9_000 }),
				],
			})
		);

		expect(find(result, "fastest answer")).toMatchObject({
			value: { unit: "duration", ms: 9_000 },
			voter: { id: BLUE, you: false },
		});
	});

	it("measures first to answer from the seed's drop", () => {
		const result = standoutsFor(
			input({
				answers: [
					answer({
						pollId: 1,
						userId: RED,
						answeredAt: minutesAfterDrop(1.75),
					}),
					answer({ pollId: 1, userId: BLUE, answeredAt: minutesAfterDrop(9) }),
				],
			})
		);

		expect(find(result, "first to answer")).toMatchObject({
			value: { unit: "duration", ms: 105_000 },
			voter: { id: RED, you: true },
		});
	});

	it("separates first good from first to answer when the quick one missed", () => {
		const result = standoutsFor(
			input({
				answers: [
					answer({ pollId: 1, userId: RED, answeredAt: minutesAfterDrop(1) }),
					answer({ pollId: 2, userId: BLUE, answeredAt: minutesAfterDrop(4) }),
				],
				// Only Blue's answer landed.
				isCorrect: (pollId) => pollId === 2,
			})
		);

		expect(find(result, "first to answer")?.voter.id).toBe(RED);
		expect(find(result, "first good")).toMatchObject({
			value: { unit: "duration", ms: 240_000 },
			voter: { id: BLUE },
		});
	});

	it("skips the award when nobody cracked the poll at all", () => {
		const result = standoutsFor(
			input({
				answers: [
					answer({ pollId: 7, userId: RED }),
					answer({ pollId: 7, userId: BLUE }),
				],
				eligiblePolls: [{ id: 7, question: "Why do margins collide?" }],
				isCorrect: (_pollId, optionIds) => optionIds.has(9),
			})
		);

		expect(find(result, "only one right")).toBeUndefined();
	});

	it("awards the lone solver of a poll the viewer has already met", () => {
		const result = standoutsFor(
			input({
				answers: [
					answer({ pollId: 7, userId: RED, optionIds: new Set([1]) }),
					answer({ pollId: 7, userId: BLUE, optionIds: new Set([2]) }),
				],
				eligiblePolls: [{ id: 7, question: "Why do margins collide?" }],
				isCorrect: (_pollId, optionIds) => optionIds.has(2),
			})
		);

		expect(find(result, "only one right")).toMatchObject({
			value: { unit: "text", text: "Why do margins collide?" },
			voter: { id: BLUE },
		});
	});

	it("never names a poll the viewer has not reached", () => {
		const result = standoutsFor(
			input({
				answers: [answer({ pollId: 99, userId: BLUE })],
				// Poll 99 is ahead of the viewer, so it is not eligible.
				eligiblePolls: [],
				isCorrect: () => true,
			})
		);

		expect(find(result, "only one right")).toBeUndefined();
	});

	it("shortens a long question so the value column stays a column", () => {
		const result = standoutsFor(
			input({
				answers: [answer({ pollId: 7, userId: BLUE })],
				eligiblePolls: [
					{
						id: 7,
						question:
							"When block level margins vertically collide, what explains it?",
					},
				],
				isCorrect: () => true,
			})
		);

		const value = find(result, "only one right")?.value;
		expect(value?.unit).toBe("text");
		const question = value?.unit === "text" ? value.text : "";
		expect(question.length).toBeLessThanOrEqual(32);
		expect(question.endsWith("…")).toBe(true);
	});
});

describe("standoutsFor — run-scoped awards", () => {
	it("names the deepest gate reached by its badge", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { gatesCleared: 2 }),
					runStats(BLUE, { gatesCleared: 6 }),
				],
			})
		);

		expect(find(result, "deepest gate")).toMatchObject({
			value: { unit: "text", text: "Soul" },
			voter: { id: BLUE },
		});
	});

	it("ranks the longest streak a run managed, not the one it is riding", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, {
						outcomes: ["correct", "correct", "correct", "wrong"],
					}),
					runStats(BLUE, { outcomes: ["correct", "correct"] }),
				],
			})
		);

		// Red's live streak is 0, but its best was 3.
		expect(find(result, "longest streak")).toMatchObject({
			value: { unit: "count", amount: 3 },
			voter: { id: RED },
		});
	});

	it("falls back to the stored streak for a run with no answer history", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { outcomes: [], streak: 4 })] })
		);

		expect(find(result, "longest streak")?.value).toEqual({
			unit: "count",
			amount: 4,
		});
	});

	it("reports coverage as a gain, rounded to one decimal", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { coverage: 21.44 })] })
		);

		expect(find(result, "most coverage")?.value).toEqual({
			unit: "percent",
			amount: 21.4,
		});
	});

	it("counts the widest build in configs", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { configCount: 3 }),
					runStats(BLUE, { configCount: 7 }),
				],
			})
		);

		expect(find(result, "widest build")).toMatchObject({
			value: { unit: "configs", amount: 7 },
			voter: { id: BLUE },
		});
	});

	it("keeps the config count singular at one", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { configCount: 1 })] })
		);

		expect(find(result, "widest build")?.value).toEqual({
			unit: "configs",
			amount: 1,
		});
	});
});

describe("standoutsFor — ordering and ties", () => {
	it("breaks a tie on player id rather than row order", () => {
		const first = standoutsFor(
			input({
				runStats: [
					runStats(BLUE, { gatesCleared: 4 }),
					runStats(RED, { gatesCleared: 4 }),
				],
			})
		);
		const reversed = standoutsFor(
			input({
				runStats: [
					runStats(RED, { gatesCleared: 4 }),
					runStats(BLUE, { gatesCleared: 4 }),
				],
			})
		);

		expect(find(first, "deepest gate")?.voter.id).toBe(BLUE);
		expect(find(reversed, "deepest gate")?.voter.id).toBe(BLUE);
	});

	it("lists today's awards before the climb's", () => {
		const result = standoutsFor(
			input({
				answers: [answer({ pollId: 1, userId: RED })],
				runStats: [runStats(BLUE, { gatesCleared: 4 })],
			})
		);

		expect(titles(result)).toEqual([
			"fastest answer",
			"first to answer",
			"deepest gate",
		]);
	});

	it("marks the viewer's own awards as theirs", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { gatesCleared: 4 })] })
		);

		expect(find(result, "deepest gate")?.voter.you).toBe(true);
	});
});
