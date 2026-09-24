import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	fetchCategoryLeader,
	fetchCategoryLeaders,
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

type LeaderRow = {
	userId: string | null;
	best: string | number | null;
	handle: string | null;
	displayName: string | null;
	photoUrl: string | null;
	borderId: string | null;
};

const SABRINA: LeaderRow = {
	userId: ME,
	best: "17",
	handle: "sabrina",
	displayName: "Sabrina",
	photoUrl: "/editors/sabrina.png",
	borderId: null,
};

const GIOVANNI: LeaderRow = {
	...SABRINA,
	userId: "giovanni",
	handle: "giovanni",
	displayName: "Giovanni",
	photoUrl: "/editors/giovanni.png",
};

const queue = (leader: LeaderRow | undefined) => {
	mock.results.push(leader === undefined ? [] : [leader]);
};

const queueBoard = (rows: (LeaderRow & { categoryCode: string })[]) => {
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

		expect(seat.leader?.streak).toBe(17);
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

	it("leaves the seat open while nobody clears the floor", async () => {
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

	it("names a GitHub account by its handle, ready to link", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.handle).toBe("@giovanni");
		expect(seat.leader?.githubLogin).toBe("giovanni");
	});

	it("falls back to the display name, with nothing to link to", async () => {
		queue({ ...GIOVANNI, handle: null });

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.leader?.handle).toBe("Giovanni");
		expect(seat.leader?.githubLogin).toBeUndefined();
	});

	it("states the category it was asked about", async () => {
		queue(GIOVANNI);

		const seat = await fetchCategoryLeader("js", ME);

		expect(seat.category).toBe("js");
	});
});

describe("fetchCategoryLeaders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads every category the board asked about in one round trip", async () => {
		queueBoard([
			{ ...GIOVANNI, categoryCode: "git", best: "13" },
			{ ...SABRINA, categoryCode: "ts", best: "16" },
		]);

		const seats = await fetchCategoryLeaders(ME);

		expect(seats).toHaveLength(2);
		expect(mock.results).toHaveLength(0);
	});

	it("carries each seat's own category and figure", async () => {
		queueBoard([{ ...GIOVANNI, categoryCode: "git", best: "13" }]);

		const [seat] = await fetchCategoryLeaders(ME);

		expect(seat?.category).toBe("git");
		expect(seat?.leader?.streak).toBe(13);
	});

	it("drops a category whose best run is under the floor", async () => {
		queueBoard([{ ...GIOVANNI, categoryCode: "git", best: "2" }]);

		expect(await fetchCategoryLeaders(ME)).toEqual([]);
	});

	it("drops a category code the game no longer knows", async () => {
		queueBoard([{ ...GIOVANNI, categoryCode: "cobol", best: "13" }]);

		expect(await fetchCategoryLeaders(ME)).toEqual([]);
	});

	it("marks your own seat across the board", async () => {
		queueBoard([
			{ ...GIOVANNI, categoryCode: "git", best: "13" },
			{ ...SABRINA, categoryCode: "ts", best: "16" },
		]);

		const seats = await fetchCategoryLeaders(ME);

		expect(seats.map(({ leader }) => leader?.you)).toEqual([false, true]);
	});
});
