import { describe, expect, it } from "vitest";

import { Config } from "../configs/config.model";
import { CONFIGS } from "../configs/configRoster.model";
import { DRAFT_SIZE, rebuildCost, rollDraft } from "./draft.model";

const ids = (configs: readonly Config[]): string[] =>
	configs.map((config) => config.id);
const seenAcrossSeeds = (equipped: readonly Config[]): string[] =>
	Array.from({ length: 30 }, (_, seed) => rollDraft(seed, equipped)).flatMap(
		ids
	);

describe("rebuildCost", () => {
	it("doubles each rebuild in KB (powers of 2)", () => {
		expect([0, 1, 2, 3, 4, 5].map(rebuildCost)).toEqual([
			4, 8, 16, 32, 64, 128,
		]);
	});

	it("caps at the last defined step", () => {
		expect(rebuildCost(50)).toBe(512);
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

	it("never re-offers any owned config — drafts are new configs only", () => {
		expect(seenAcrossSeeds([CONFIGS.eslint])).not.toContain("eslint");
		expect(seenAcrossSeeds([CONFIGS.js])).not.toContain("js");
	});

	it("never offers a fixed config", () => {
		expect(seenAcrossSeeds([])).not.toContain("unit-tests");
	});
});
