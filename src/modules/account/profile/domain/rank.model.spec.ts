import { describe, expect, it } from "vitest";

import {
	RANK_RUNGS,
	TOP_RANK,
} from "~/modules/account/profile/domain/rank.model";

describe("RANK_RUNGS", () => {
	it("opens the first rung on the first poll answered", () => {
		expect(RANK_RUNGS[0]).toEqual({ name: "Poll Newbie", from: 1 });
	});

	it("opens each rung one past the ceiling of the one before", () => {
		expect(RANK_RUNGS[1]).toEqual({ name: "Poll Acquaintance", from: 36 });
	});

	it("tops out on its own rung past the last ceiling", () => {
		expect(RANK_RUNGS.at(-1)).toEqual({ name: TOP_RANK, from: 786 });
	});

	it("climbs, so no rung opens below the one before it", () => {
		const starts = RANK_RUNGS.map((rung) => rung.from);

		expect(starts).toEqual([...starts].sort((a, b) => a - b));
	});

	it("names every rung distinctly, since each is a title", () => {
		const names = RANK_RUNGS.map((rung) => rung.name);

		expect(new Set(names).size).toBe(names.length);
	});
});
