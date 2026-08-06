import { describe, expect, it } from "vitest";

import { Config } from "../configs/config.model";
import { CONFIGS, CONFIG_LIST } from "../configs/configRoster.model";
import { DRAFT_SIZE, draftSeed, rebuildCost, rollDraft } from "./draft.model";

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

	it("offers no duplicates within a single draft", () => {
		for (let seed = 0; seed < 30; seed++) {
			const offered = ids(rollDraft(seed, []));
			expect(new Set(offered).size).toBe(offered.length);
		}
	});

	// The old implementation returned pool[(seed + offset) % length], so every
	// draft was a contiguous run of the roster and rebuilding just paged forward.
	// Learning CONFIG_LIST's order told you exactly what came next.
	it("does not offer a contiguous slice of the roster", () => {
		const rosterIndex = (id: string) =>
			CONFIG_LIST.findIndex((config) => config.id === id);
		const isContiguous = (offered: readonly string[]) => {
			const positions = offered.map(rosterIndex).sort((a, b) => a - b);
			return positions.every(
				(position, offset) => position === positions[0] + offset
			);
		};
		const contiguousDrafts = Array.from({ length: 30 }, (_, seed) =>
			ids(rollDraft(seed, []))
		).filter(isContiguous);
		expect(contiguousDrafts).toHaveLength(0);
	});

	it("spreads offers across the whole pool given enough seeds", () => {
		const seen = new Set(seenAcrossSeeds([]));
		expect(seen.size).toBe(CONFIG_LIST.length);
	});
});

describe("draftSeed", () => {
	it("is stable for the same gate and rebuild count", () => {
		expect(draftSeed(3, 2)).toBe(draftSeed(3, 2));
	});

	// A plain sum would make gate 1's opening draft identical to gate 0's first
	// rebuild, handing back offers the player just paid to replace.
	it("does not collide across gate and rebuild combinations", () => {
		const seeds = new Set<number>();
		for (let gate = 0; gate < 12; gate++) {
			for (let rebuilds = 0; rebuilds < 8; rebuilds++) {
				seeds.add(draftSeed(gate, rebuilds));
			}
		}
		expect(seeds.size).toBe(12 * 8);
	});

	it("gives a different draft after a rebuild at the same gate", () => {
		const opening = ids(rollDraft(draftSeed(0, 0), []));
		const rebuilt = ids(rollDraft(draftSeed(0, 1), []));
		expect(rebuilt).not.toEqual(opening);
	});

	it("never re-offers any owned config — drafts are new configs only", () => {
		expect(seenAcrossSeeds([CONFIGS.eslint])).not.toContain("eslint");
		expect(seenAcrossSeeds([CONFIGS.js])).not.toContain("js");
	});

	it("offers Unit Tests like any other unowned config", () => {
		expect(seenAcrossSeeds([])).toContain("unit-tests");
	});
});
