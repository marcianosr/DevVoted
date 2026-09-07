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
const GARY = "gary";
const MISTY = "misty";

const player = (id: string) => ({
	id,
	displayName: id[0].toUpperCase() + id.slice(1),
	photoUrl: null,
	borderUrl: null,
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
	pollsIntoGate: 0,
	configCount: 0,
	slotsHeld: 0,
	configsLost: 0,
	startedAtGate: 0,
	outcomes: [],
	...over,
});

/** Everything off by default, so each test switches on only what it asserts. */
const input = (over: Partial<StandoutInput> = {}): StandoutInput => ({
	answers: [],
	eligiblePolls: [],
	isCorrect: () => false,
	runStats: [],
	viewerId: RED,
	...over,
});

const titles = (result: ReturnType<typeof standoutsFor>) =>
	result.map((standout) => standout.title);

const find = (result: ReturnType<typeof standoutsFor>, title: string) =>
	result.find((standout) => standout.title === title);

const rightOption = 2;
const picksRight = (_pollId: number, optionIds: ReadonlySet<number>): boolean =>
	optionIds.has(rightOption);

const room = (
	pollId: number,
	rightIds: readonly string[],
	wrongIds: readonly string[]
): CommunityAnswer[] => [
	...rightIds.map((userId) =>
		answer({ pollId, userId, optionIds: new Set([rightOption]) })
	),
	...wrongIds.map((userId) => answer({ pollId, userId })),
];

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

	it("skips run awards when every active run is still at zero", () => {
		const result = standoutsFor(input({ runStats: [runStats(RED)] }));

		expect(result).toEqual([]);
	});

	it("waits for the room to be mostly wrong before crowning a contrarian", () => {
		const result = standoutsFor(
			input({
				answers: room(7, [RED, BLUE], []),
				eligiblePolls: [{ id: 7 }],
				isCorrect: picksRight,
			})
		);

		expect(titles(result)).not.toContain("against the room");
	});

	it("never names a poll the viewer has not reached", () => {
		const result = standoutsFor(
			input({
				answers: room(99, [BLUE], [RED, GARY, MISTY]),
				eligiblePolls: [],
				isCorrect: picksRight,
			})
		);

		expect(titles(result)).not.toContain("against the room");
	});

	it("ignores losses that never turned into a clear", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { configsLost: 4 })] })
		);

		expect(titles(result)).not.toContain("comeback");
	});

	it("waits for two losses before calling it a comeback", () => {
		const result = standoutsFor(
			input({
				runStats: [runStats(RED, { gatesCleared: 2, configsLost: 1 })],
			})
		);

		expect(titles(result)).not.toContain("comeback");
	});
});

describe("standoutsFor — deepest", () => {
	it("ranks by track position, so polls into the gate break a gate tie", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { gatesCleared: 3, pollsIntoGate: 4 }),
					runStats(BLUE, { gatesCleared: 4 }),
				],
			})
		);

		expect(find(result, "deepest")).toMatchObject({
			value: { unit: "text", text: "gate 4" },
			voter: { id: BLUE },
		});
	});

	it("names the poll depth when the leader is mid-gate", () => {
		const result = standoutsFor(
			input({
				runStats: [runStats(RED, { gatesCleared: 10, pollsIntoGate: 2 })],
			})
		);

		expect(find(result, "deepest")?.value).toEqual({
			unit: "text",
			text: "gate 10 · poll 2",
		});
	});

	it("wears the gate's swatch", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { gatesCleared: 6 })] })
		);

		expect(find(result, "deepest")?.swatch).toBeDefined();
	});
});

describe("standoutsFor — against the room", () => {
	it("crowns a right answer on the poll with the lowest right-share", () => {
		const result = standoutsFor(
			input({
				answers: [
					...room(1, [RED, BLUE], [GARY, MISTY]),
					...room(2, [GARY], [RED, BLUE, MISTY]),
				],
				eligiblePolls: [{ id: 1 }, { id: 2 }],
				isCorrect: picksRight,
			})
		);

		expect(find(result, "against the room")).toMatchObject({
			value: { unit: "text", text: "right on poll 2 · 25% were" },
			voter: { id: GARY },
		});
	});

	it("breaks a share tie toward the latest poll in the viewer's sequence", () => {
		const result = standoutsFor(
			input({
				answers: [
					...room(1, [BLUE], [RED, GARY, MISTY]),
					...room(2, [MISTY], [RED, BLUE, GARY]),
				],
				eligiblePolls: [{ id: 1 }, { id: 2 }],
				isCorrect: picksRight,
			})
		);

		expect(find(result, "against the room")).toMatchObject({
			value: { unit: "text", text: "right on poll 2 · 25% were" },
			voter: { id: MISTY },
		});
	});
});

describe("standoutsFor — clean sweep", () => {
	it("calls a perfect settled window a sweep at its gate", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(BLUE, {
						gatesCleared: 7,
						pollsIntoGate: 2,
						outcomes: [
							"correct",
							"correct",
							"correct",
							"correct",
							"correct",
							"wrong",
							"correct",
						],
					}),
				],
			})
		);

		expect(find(result, "clean sweep")).toMatchObject({
			value: { unit: "text", text: "5 of 5 at Soul" },
			voter: { id: BLUE },
		});
		expect(find(result, "clean sweep")?.swatch).toBeDefined();
	});

	it("ignores the unsettled trailing window", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, {
						gatesCleared: 1,
						pollsIntoGate: 4,
						outcomes: ["correct", "correct", "correct", "correct"],
					}),
				],
			})
		);

		expect(titles(result)).not.toContain("clean sweep");
	});

	it("walks past a flawed tail to an earlier sweep", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, {
						gatesCleared: 4,
						outcomes: [
							"correct",
							"correct",
							"correct",
							"correct",
							"correct",
							"wrong",
							"correct",
							"correct",
							"correct",
							"correct",
						],
					}),
				],
			})
		);

		expect(find(result, "clean sweep")?.value).toEqual({
			unit: "text",
			text: "5 of 5 at Cascade",
		});
	});

	it("prefers the deeper sweep between players", () => {
		const sweep: AnswerOutcome[] = [
			"correct",
			"correct",
			"correct",
			"correct",
			"correct",
		];
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { gatesCleared: 3, outcomes: sweep }),
					runStats(BLUE, { gatesCleared: 6, outcomes: sweep }),
				],
			})
		);

		expect(find(result, "clean sweep")).toMatchObject({
			value: { unit: "text", text: "5 of 5 at Rainbow" },
			voter: { id: BLUE },
		});
	});

	it("counts a sweep of the very first gate", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, {
						gatesCleared: 1,
						outcomes: ["correct", "correct", "correct", "correct", "correct"],
					}),
				],
			})
		);

		expect(find(result, "clean sweep")?.value).toEqual({
			unit: "text",
			text: "5 of 5 at Pallet",
		});
	});

	it("never sweeps a gate below a pinned start", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, {
						gatesCleared: 5,
						startedAtGate: 5,
						outcomes: ["correct", "correct", "correct", "correct", "correct"],
					}),
				],
			})
		);

		expect(titles(result)).not.toContain("clean sweep");
	});
});

describe("standoutsFor — widest build", () => {
	it("counts the widest build in slots held", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { slotsHeld: 3 }),
					runStats(BLUE, { slotsHeld: 11 }),
				],
			})
		);

		expect(find(result, "widest build")).toMatchObject({
			value: { unit: "text", text: "11 slots held" },
			voter: { id: BLUE },
		});
	});

	it("keeps the slot count singular at one", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { slotsHeld: 1 })] })
		);

		expect(find(result, "widest build")?.value).toEqual({
			unit: "text",
			text: "1 slot held",
		});
	});
});

describe("standoutsFor — travelling light", () => {
	it("rewards depth first, then the lighter build", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { gatesCleared: 8, configCount: 3 }),
					runStats(BLUE, { gatesCleared: 8, configCount: 5 }),
					runStats(GARY, { gatesCleared: 7, configCount: 1 }),
				],
			})
		);

		expect(find(result, "travelling light")).toMatchObject({
			value: { unit: "text", text: "gate 8 on 3 configs" },
			voter: { id: RED },
		});
	});

	it("keeps the config count singular at one", () => {
		const result = standoutsFor(
			input({
				runStats: [runStats(RED, { gatesCleared: 2, configCount: 1 })],
			})
		);

		expect(find(result, "travelling light")?.value).toEqual({
			unit: "text",
			text: "gate 2 on 1 config",
		});
	});

	it("does not count a pinned start that has cleared nothing yet", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, {
						gatesCleared: 5,
						startedAtGate: 5,
						configCount: 2,
					}),
				],
			})
		);

		expect(titles(result)).not.toContain("travelling light");
	});
});

describe("standoutsFor — comeback", () => {
	it("crowns the biggest loss that still cleared a gate", () => {
		const result = standoutsFor(
			input({
				runStats: [
					runStats(RED, { gatesCleared: 3, configsLost: 4 }),
					runStats(BLUE, { gatesCleared: 5, configsLost: 2 }),
				],
			})
		);

		expect(find(result, "comeback")).toMatchObject({
			value: { unit: "text", text: "cleared after losing 4 configs" },
			voter: { id: RED },
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

		expect(find(first, "deepest")?.voter.id).toBe(BLUE);
		expect(find(reversed, "deepest")?.voter.id).toBe(BLUE);
	});

	it("lists the awards in grid order", () => {
		const result = standoutsFor(
			input({
				answers: room(1, [GARY], [RED, BLUE, MISTY]),
				eligiblePolls: [{ id: 1 }],
				isCorrect: picksRight,
				runStats: [
					runStats(BLUE, {
						gatesCleared: 4,
						configCount: 2,
						slotsHeld: 5,
						configsLost: 2,
						outcomes: ["correct", "correct", "correct", "correct", "correct"],
					}),
				],
			})
		);

		expect(titles(result)).toEqual([
			"deepest",
			"against the room",
			"clean sweep",
			"widest build",
			"travelling light",
			"comeback",
		]);
	});

	it("marks the viewer's own awards as theirs", () => {
		const result = standoutsFor(
			input({ runStats: [runStats(RED, { gatesCleared: 4 })] })
		);

		expect(find(result, "deepest")?.voter.you).toBe(true);
	});

	it("carries the equipped border onto the voter chip", () => {
		const stats = {
			...runStats(BLUE, { gatesCleared: 2 }),
			user: { ...player(BLUE), borderUrl: "/borders/x.png" },
		};
		const result = standoutsFor(input({ runStats: [stats] }));

		expect(find(result, "deepest")?.voter.borderUrl).toBe("/borders/x.png");
	});
});
