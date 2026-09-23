import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import { fetchCategoryRecord } from "~/modules/run/run/infrastructure/categoryRecord.repository";

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

type HolderRow = {
	userId: string | null;
	best: string | number | null;
	handle: string | null;
	displayName: string | null;
	photoUrl: string | null;
	borderId: string | null;
};

const SABRINA: HolderRow = {
	userId: ME,
	best: "17",
	handle: "sabrina",
	displayName: "Sabrina",
	photoUrl: "/editors/sabrina.png",
	borderId: null,
};

const GIOVANNI: HolderRow = {
	...SABRINA,
	userId: "giovanni",
	handle: "giovanni",
	displayName: "Giovanni",
	photoUrl: "/editors/giovanni.png",
};

const queue = (holder: HolderRow | undefined, yourBest: string | null) => {
	mock.results.push(holder === undefined ? [] : [holder]);
	mock.results.push(yourBest === null ? [] : [{ best: yourBest }]);
};

describe("fetchCategoryRecord", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads the driver's string counts as numbers", async () => {
		queue(GIOVANNI, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.streak).toBe(17);
		expect(record.yourBest).toBe(4);
	});

	it("marks the holder as you when the record is your own", async () => {
		queue(SABRINA, "17");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.you).toBe(true);
	});

	it("does not mistake another account's record for yours", async () => {
		queue(GIOVANNI, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.you).toBe(false);
	});

	it("leaves the record unclaimed while nobody clears the floor", async () => {
		queue({ ...GIOVANNI, best: "2" }, "2");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder).toBeUndefined();
		expect(record.yourBest).toBe(2);
	});

	it("leaves a category nobody has answered unclaimed, at zero", async () => {
		queue(undefined, null);

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder).toBeUndefined();
		expect(record.yourBest).toBe(0);
	});

	it("hands the photo through as stored rather than deriving one", async () => {
		queue(GIOVANNI, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.avatarUrl).toBe("/editors/giovanni.png");
	});

	it("leaves the avatar off an account with no photo", async () => {
		queue({ ...GIOVANNI, photoUrl: null }, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.avatarUrl).toBeUndefined();
	});

	it("resolves the equipped border to its art", async () => {
		queue({ ...GIOVANNI, borderId: "border-ts" }, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.borderUrl).toBeDefined();
	});

	it("draws an unknown border as none at all", async () => {
		queue({ ...GIOVANNI, borderId: "border-gengar" }, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.borderUrl).toBeUndefined();
	});

	it("names a GitHub account by its handle, ready to link", async () => {
		queue(GIOVANNI, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.handle).toBe("@giovanni");
		expect(record.holder?.githubLogin).toBe("giovanni");
	});

	it("falls back to the display name, with nothing to link to", async () => {
		queue({ ...GIOVANNI, handle: null }, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.holder?.handle).toBe("Giovanni");
		expect(record.holder?.githubLogin).toBeUndefined();
	});

	it("states the category it was asked about", async () => {
		queue(GIOVANNI, "4");

		const record = await fetchCategoryRecord("js", ME);

		expect(record.category).toBe("js");
	});
});
