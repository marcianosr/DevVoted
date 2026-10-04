import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	fetchBestStreakOf,
	fetchCategoryBoards,
	fetchCategoryLeader,
} from "~/modules/run/run/infrastructure/categoryLeader.repository";

const mock = vi.hoisted((): DrizzleMockState => ({
	results: [],
	setCalls: [],
	valuesCalls: [],
	insertTables: [],
	updateTables: [],
	deleteTables: [],
}));

vi.mock("~/database/db", async () => {
	const { createMockDb } = await import("~/test/drizzleMock.factory");
	return { db: createMockDb(mock) };
});

const ME = "sabrina";

type SeatRow = {
	userId: string | null;
	best: string | number | null;
	handle: string | null;
	displayName: string | null;
	photoUrl: string | null;
	borderId: string | null;
};

type BoardRow = Omit<SeatRow, "best"> & {
	categoryCode: string;
	bestStreak: string | number | null;
	bestCorrect: string | number | null;
	streakRank: string | number;
	correctRank: string | number;
};

const SABRINA: SeatRow = {
	userId: ME,
	best: "17",
	handle: "sabrina",
	displayName: "Sabrina",
	photoUrl: "/editors/sabrina.png",
	borderId: null,
};

const GIOVANNI: SeatRow = {
	...SABRINA,
	userId: "giovanni",
	handle: "giovanni",
	displayName: "Giovanni",
	photoUrl: "/editors/giovanni.png",
};

const queue = (leader: SeatRow | undefined) => {
	mock.results.push(leader === undefined ? [] : [leader]);
};

const board = (
	seat: SeatRow,
	categoryCode: string,
	standing: Partial<
		Pick<BoardRow, "bestStreak" | "bestCorrect" | "streakRank" | "correctRank">
	>
): BoardRow => ({
	userId: seat.userId,
	handle: seat.handle,
	displayName: seat.displayName,
	photoUrl: seat.photoUrl,
	borderId: seat.borderId,
	categoryCode,
	bestStreak: "13",
	bestCorrect: "41",
	streakRank: 1,
	correctRank: 1,
	...standing,
});

const queueBoard = (rows: BoardRow[]) => {
	mock.results.push(rows);
};

describe("fetchCategoryLeader", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads the driver's string counts as numbers", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.best).toBe(17);
	});

	it("marks the leader as you when the seat is your own", async () => {
		queue(SABRINA);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.you).toBe(true);
	});

	it("does not mistake another account's seat for yours", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.you).toBe(false);
	});

	it("leaves the seat open while nobody clears the streak floor", async () => {
		queue({ ...GIOVANNI, best: "2" });

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader).toBeUndefined();
	});

	it("leaves a category nobody has answered open", async () => {
		queue(undefined);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader).toBeUndefined();
	});

	it("hands the photo through as stored rather than deriving one", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.avatarUrl).toBe("/editors/giovanni.png");
	});

	it("leaves the avatar off an account with no photo", async () => {
		queue({ ...GIOVANNI, photoUrl: null });

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.avatarUrl).toBeUndefined();
	});

	it("resolves the equipped border to its art", async () => {
		queue({ ...GIOVANNI, borderId: "border-ts" });

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.borderUrl).toBeDefined();
	});

	it("draws an unknown border as none at all", async () => {
		queue({ ...GIOVANNI, borderId: "border-gengar" });

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.borderUrl).toBeUndefined();
	});

	it("names a leader by their @handle", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.handle).toBe("@giovanni");
	});

	it("falls back to the display name when there is no handle", async () => {
		queue({ ...GIOVANNI, handle: null });

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.handle).toBe("Giovanni");
	});

	it("states the category it was asked about", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.category).toBe("js");
	});
});

describe("fetchCategoryBoards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads the driver's string ranks as numbers, so a top seat is not dropped", async () => {
		queueBoard([
			board(GIOVANNI, "git", { streakRank: "1", correctRank: "2" }),
			board(SABRINA, "git", { streakRank: "2", correctRank: "1" }),
		]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak).toHaveLength(1);
		expect(boards.correct).toHaveLength(1);
	});

	it("fills both boards from one round trip", async () => {
		queueBoard([board(GIOVANNI, "git", {})]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak).toHaveLength(1);
		expect(boards.correct).toHaveLength(1);
		expect(mock.results).toHaveLength(0);
	});

	it("carries each seat's own category and figure", async () => {
		queueBoard([
			board(GIOVANNI, "git", { bestStreak: "13", bestCorrect: "41" }),
		]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak[0]?.category).toBe("git");
		expect(boards.streak[0]?.leader?.best).toBe(13);
		expect(boards.correct[0]?.leader?.best).toBe(41);
	});

	it("seats a row on the board it tops and leaves it off the other", async () => {
		queueBoard([
			board(GIOVANNI, "git", { streakRank: 1, correctRank: 2 }),
			board(SABRINA, "git", { streakRank: 2, correctRank: 1 }),
		]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak.map(({ leader }) => leader?.handle)).toEqual([
			"@giovanni",
		]);
		expect(boards.correct.map(({ leader }) => leader?.handle)).toEqual([
			"@sabrina",
		]);
	});

	it("seats one row on both boards when the same account tops each", async () => {
		queueBoard([board(GIOVANNI, "git", { streakRank: 1, correctRank: 1 })]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak[0]?.leader?.handle).toBe("@giovanni");
		expect(boards.correct[0]?.leader?.handle).toBe("@giovanni");
	});

	it("drops a category from the streak board while its best run is under the floor", async () => {
		queueBoard([
			board(GIOVANNI, "git", { bestStreak: "2", bestCorrect: "41" }),
		]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak).toEqual([]);
		expect(boards.correct).toHaveLength(1);
	});

	it("applies each board's own floor, so the correct board can refuse what the streak board seats", async () => {
		queueBoard([board(GIOVANNI, "git", { bestStreak: "3", bestCorrect: "3" })]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak).toHaveLength(1);
		expect(boards.correct).toEqual([]);
	});

	it("drops a category code the game no longer knows from both boards", async () => {
		queueBoard([board(GIOVANNI, "cobol", {})]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak).toEqual([]);
		expect(boards.correct).toEqual([]);
	});

	it("marks your own seat across both boards", async () => {
		queueBoard([board(GIOVANNI, "git", {}), board(SABRINA, "ts", {})]);

		const boards = await fetchCategoryBoards(ME);

		expect(boards.streak.map(({ leader }) => leader?.you)).toEqual([
			false,
			true,
		]);
		expect(boards.correct.map(({ leader }) => leader?.you)).toEqual([
			false,
			true,
		]);
	});
});

describe("fetchBestStreakOf", () => {
	beforeEach(() => {
		resetDrizzleMock(mock);
	});

	it("reads the longest run streak the player holds in any category", async () => {
		mock.results = [[{ best: "21" }]];

		expect(await fetchBestStreakOf(ME)).toBe(21);
	});

	it("reads zero for a player with no run answers", async () => {
		mock.results = [[{ best: null }]];

		expect(await fetchBestStreakOf(ME)).toBe(0);
	});
});
