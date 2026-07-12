import { describe, expect, it } from "vitest";

import { Config } from "../configs/config";
import { CONFIGS } from "../configs/configRoster";
import { DRAFT_SIZE, rebuildCost, rollDraft } from "./draft";

const ids = (configs: readonly Config[]): string[] =>
	configs.map((config) => config.id);
const seenAcrossSeeds = (equipped: readonly Config[]): string[] =>
	Array.from({ length: 30 }, (_, seed) => rollDraft(seed, equipped)).flatMap(
		ids
	);

describe("rebuildCost", () => {
	it("follows the Fibonacci sequence in KB", () => {
		expect([0, 1, 2, 3, 4, 5].map(rebuildCost)).toEqual([1, 2, 3, 5, 8, 13]);
	});

	it("caps at the last defined step", () => {
		expect(rebuildCost(50)).toBe(89);
	});
});

describe("rollDraft", () => {
	it("offers DRAFT_SIZE configs", () => {
		expect(rollDraft(0, [])).toHaveLength(DRAFT_SIZE);
	});

	it("is deterministic for a given seed", () => {
		expect(ids(rollDraft(2, []))).toEqual(ids(rollDraft(2, [])));
	});

	it("rotates the pool as the seed changes", () => {
		expect(ids(rollDraft(0, []))).not.toEqual(ids(rollDraft(1, [])));
	});

	it("never re-offers an owned non-Focus config", () => {
		expect(seenAcrossSeeds([CONFIGS.eslint])).not.toContain("eslint");
	});

	it("still offers an owned Focus config, so it can be drafted as an upgrade", () => {
		expect(seenAcrossSeeds([CONFIGS.js])).toContain("js");
	});
});
