import { describe, expect, it } from "vitest";

import { Config } from "~/modules/run/config/domain/config.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	DRAFT_SIZE,
	draftCostIn,
	draftSeed,
	extendCost,
	MAX_EXTENSIONS,
	offerCount,
	rebuildCost,
	rollDraft,
	sellRefundIn,
} from "~/modules/run/shop/domain/draft.model";

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

describe("extendCost", () => {
	it("prices the run's extensions 48KB then 96KB", () => {
		expect([0, 1].map(extendCost)).toEqual([48, 96]);
	});

	it("caps at the last step once every extension is bought", () => {
		expect(extendCost(MAX_EXTENSIONS)).toBe(96);
	});
});

describe("offerCount", () => {
	it("shows five offers before any extension", () => {
		expect(offerCount(0)).toBe(DRAFT_SIZE);
	});

	it("adds one offer per extension bought", () => {
		expect(offerCount(1)).toBe(DRAFT_SIZE + 1);
		expect(offerCount(2)).toBe(DRAFT_SIZE + 2);
	});

	it("never grows past the extensions a run can buy", () => {
		expect(offerCount(99)).toBe(DRAFT_SIZE + MAX_EXTENSIONS);
	});
});

describe("rollDraft with shop controls", () => {
	it("keeps a locked offer in the draft and leads with it", () => {
		const offered = ids(rollDraft(7, [], ["eslint"]));
		expect(offered[0]).toBe("eslint");
		expect(offered).toHaveLength(DRAFT_SIZE);
	});

	it("holds the locked offer across every reroll", () => {
		const held = Array.from({ length: 20 }, (_, seed) =>
			ids(rollDraft(seed, [], ["cold-start"]))
		);
		expect(held.every((offers) => offers.includes("cold-start"))).toBe(true);
	});

	it("still rerolls everything the lock does not hold", () => {
		const first = ids(rollDraft(0, [], ["eslint"]));
		const second = ids(rollDraft(1, [], ["eslint"]));
		expect(second.slice(1)).not.toEqual(first.slice(1));
	});

	it("offers no duplicate of the locked config", () => {
		const offered = ids(rollDraft(3, [], ["eslint"]));
		expect(offered.filter((id) => id === "eslint")).toHaveLength(1);
	});

	it("drops a locked id the player has since installed", () => {
		const offered = ids(rollDraft(3, [CONFIGS.eslint], ["eslint"]));
		expect(offered).not.toContain("eslint");
		expect(offered).toHaveLength(DRAFT_SIZE);
	});

	it("offers as many configs as the extensions bought allow", () => {
		expect(rollDraft(0, [], [], offerCount(2))).toHaveLength(DRAFT_SIZE + 2);
	});
});

describe("sellRefundIn", () => {
	it("refunds half the draft cost in an ordinary build", () => {
		expect(sellRefundIn([CONFIGS.js, CONFIGS.agentsMd], CONFIGS.agentsMd)).toBe(
			128
		);
	});

	it("zeroes every sale while WTFPL is installed — no warranty on anything", () => {
		const build = [CONFIGS.wtfpl, CONFIGS.agentsMd];
		expect(sellRefundIn(build, CONFIGS.agentsMd)).toBe(0);
		expect(sellRefundIn(build, CONFIGS.wtfpl)).toBe(0);
	});

	it("refunds half of what Freemium's shelf charged, not half of list", () => {
		const build = [CONFIGS.freemium, CONFIGS.agentsMd];
		expect(draftCostIn(build, CONFIGS.agentsMd)).toBe(128);
		expect(sellRefundIn(build, CONFIGS.agentsMd)).toBe(64);
	});

	it("keeps WTFPL's zero ahead of Freemium's discount", () => {
		const build = [CONFIGS.wtfpl, CONFIGS.freemium, CONFIGS.agentsMd];
		expect(sellRefundIn(build, CONFIGS.agentsMd)).toBe(0);
	});
});

describe("draftCostIn", () => {
	it("charges list price in an ordinary build", () => {
		expect(draftCostIn([CONFIGS.js], CONFIGS.agentsMd)).toBe(256);
		expect(draftCostIn([CONFIGS.js], CONFIGS.intellisense)).toBe(128);
	});

	it("halves every price on the shelf while Freemium is installed", () => {
		const build = [CONFIGS.freemium];
		expect(draftCostIn(build, CONFIGS.agentsMd)).toBe(128);
		expect(draftCostIn(build, CONFIGS.intellisense)).toBe(64);
		expect(draftCostIn(build, CONFIGS.unitTests)).toBe(16);
	});

	it("costs nothing to draft Freemium itself — the bill is the whole price", () => {
		expect(draftCostIn([], CONFIGS.freemium)).toBe(0);
		expect(sellRefundIn([CONFIGS.freemium], CONFIGS.freemium)).toBe(0);
	});
});

describe("rollDraft under WTFPL", () => {
	it("lays out the entire remaining roster instead of a rolled five", () => {
		const offered = ids(rollDraft(0, [CONFIGS.wtfpl]));
		expect(offered).toHaveLength(CONFIG_LIST.length - 1);
		expect(offered).not.toContain("wtfpl");
	});

	it("offers the catalog in roster order, the same on every seed — a reroll sells nothing", () => {
		expect(ids(rollDraft(0, [CONFIGS.wtfpl]))).toEqual(
			ids(rollDraft(99, [CONFIGS.wtfpl]))
		);
	});

	it("still excludes everything the build owns", () => {
		const offered = ids(rollDraft(0, [CONFIGS.wtfpl, CONFIGS.js, CONFIGS.ts]));
		expect(offered).not.toContain("js");
		expect(offered).not.toContain("ts");
		expect(offered).toHaveLength(CONFIG_LIST.length - 3);
	});

	it("keeps a previously held offer at the front of the catalog", () => {
		expect(ids(rollDraft(0, [CONFIGS.wtfpl], ["eslint"]))[0]).toBe("eslint");
	});
});

describe("draftSeed", () => {
	it("is stable for the same gate and rebuild count", () => {
		expect(draftSeed(3, 2)).toBe(draftSeed(3, 2));
	});

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
