import { describe, expect, it } from "vitest";

import {
	RANK_COUNT,
	RANK_LADDER,
	rankFor,
	TOP_RANK,
} from "~/modules/account/profile/domain/rank.model";

describe("rankFor", () => {
	it("starts an account that has answered nothing on the first rung", () => {
		expect(rankFor(0)).toBe("Poll Newbie");
	});

	it("holds the rung right up to its ceiling", () => {
		expect(rankFor(35)).toBe("Poll Newbie");
	});

	it("moves up one past the ceiling", () => {
		expect(rankFor(36)).toBe("Poll Acquaintance");
	});

	it("reads every boundary as the rung that owns it, never the next one", () => {
		for (const [index, rung] of RANK_LADDER.entries()) {
			expect(rankFor(rung.upTo)).toBe(rung.name);
			expect(rankFor(rung.upTo + 1)).toBe(
				RANK_LADDER[index + 1]?.name ?? TOP_RANK
			);
		}
	});

	it("tops out rather than falling off the end", () => {
		expect(rankFor(785)).toBe("Polls treasure trove");
		expect(rankFor(786)).toBe(TOP_RANK);
		expect(rankFor(50_000)).toBe(TOP_RANK);
	});

	it("climbs, so no rung ever ranks below the one before it", () => {
		const ceilings = RANK_LADDER.map((rung) => rung.upTo);

		expect(ceilings).toEqual([...ceilings].sort((a, b) => a - b));
	});

	it("names every rung distinctly, since the rank is the whole label", () => {
		const names = [...RANK_LADDER.map((rung) => rung.name), TOP_RANK];

		expect(new Set(names).size).toBe(RANK_COUNT);
	});
});
