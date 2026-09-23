import { describe, expect, it } from "vitest";

import { Config, maxLevelOf } from "~/modules/run/config/domain/config.model";
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
	isUpgradeOffer,
	offerCount,
	offerOddsOf,
	rebuildCost,
	rollDraft,
	sellRefundIn,
	upgradeOfferFor,
	versionOddsFor,
} from "~/modules/run/shop/domain/draft.model";

const ids = (configs: readonly Config[]): string[] =>
	configs.map((config) => config.id);
/** Enough rolls to reach a pool this size, so a new config cannot starve the sample. */
const SEEDS_PER_CONFIG = 3;

const seenAcrossSeeds = (equipped: readonly Config[]): string[] =>
	Array.from({ length: CONFIG_LIST.length * SEEDS_PER_CONFIG }, (_, seed) =>
		rollDraft(seed, equipped)
	).flatMap(ids);

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

	it("refunds half of what Freemium's registry charged, not half of list", () => {
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

	it("halves every price in the registry while Freemium is installed", () => {
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

	it("never re-offers a config the player cannot version up", () => {
		expect(seenAcrossSeeds([CONFIGS.eslint])).not.toContain("eslint");
	});

	it("re-offers an owned config only above the version held, never past its cap", () => {
		const reoffered = Array.from({ length: 30 }, (_, seed) =>
			rollDraft(seed, [CONFIGS.js])
		)
			.flat()
			.filter((config) => config.id === "js");

		expect(reoffered.length).toBeGreaterThan(0);
		expect(reoffered.every((config) => (config.level ?? 1) > 1)).toBe(true);
		expect(
			reoffered.every((config) => (config.level ?? 1) <= maxLevelOf(config))
		).toBe(true);
	});

	it("offers Unit Tests like any other unowned config", () => {
		expect(seenAcrossSeeds([])).toContain("unit-tests");
	});
});

describe("upgradeOfferFor", () => {
	const acrossSeeds = (equipped: readonly Config[]) =>
		Array.from({ length: 80 }, (_, seed) => upgradeOfferFor(seed, equipped));

	it("offers a version of something already installed, never a new config", () => {
		const offered = acrossSeeds([CONFIGS.js]).filter(
			(config) => config !== undefined
		);

		expect(offered.length).toBeGreaterThan(0);
		expect(offered.every((config) => config.id === "js")).toBe(true);
		expect(offered.every((config) => (config.level ?? 1) > 1)).toBe(true);
	});

	describe("the climb (ADR-097)", () => {
		const CLIMB_SEEDS = 4000;
		const levelsOffered = (equipped: readonly Config[]): number[] =>
			Array.from({ length: CLIMB_SEEDS }, (_, seed) =>
				upgradeOfferFor(seed, equipped)
			)
				.filter((config) => config !== undefined)
				.map((config) => config.level ?? 1);
		const shareAt = (levels: readonly number[], level: number): number =>
			levels.filter((offered) => offered === level).length / levels.length;

		it("lands one rung up about half the time, and halves per rung after that", () => {
			const levels = levelsOffered([CONFIGS.js]);

			expect(levels.length).toBeGreaterThan(CLIMB_SEEDS / 16);
			expect(shareAt(levels, 2)).toBeGreaterThan(0.4);
			expect(shareAt(levels, 2)).toBeLessThan(0.6);
			expect(shareAt(levels, 3)).toBeGreaterThan(0.15);
			expect(shareAt(levels, 3)).toBeLessThan(0.35);
			expect(shareAt(levels, 4)).toBeGreaterThan(0);
			expect(shareAt(levels, 5)).toBeGreaterThan(0);
		});

		it("never climbs past the ladder's cap", () => {
			expect(
				levelsOffered([CONFIGS.js]).every(
					(level) => level <= maxLevelOf(CONFIGS.js)
				)
			).toBe(true);
		});

		it("always hands a two-rung config its second rung", () => {
			const levels = levelsOffered([CONFIGS.telemetry]);

			expect(levels.length).toBeGreaterThan(0);
			expect(levels.every((level) => level === 2)).toBe(true);
		});

		it("always hands a config one rung short of its cap that cap", () => {
			const levels = levelsOffered([{ ...CONFIGS.js, level: 4 }]);

			expect(levels.length).toBeGreaterThan(0);
			expect(levels.every((level) => level === 5)).toBe(true);
		});

		it("climbs from the rung held, not from v1", () => {
			expect(
				levelsOffered([{ ...CONFIGS.js, level: 3 }]).every((level) => level > 3)
			).toBe(true);
		});
	});

	it("stays rare enough that the shop Upgrade is still the way to level", () => {
		const offered = acrossSeeds([CONFIGS.js]).filter(
			(config) => config !== undefined
		);

		expect(offered.length).toBeLessThan(80 / 4);
	});

	it("reads the same for the same seed and build", () => {
		expect(upgradeOfferFor(7, [CONFIGS.js])).toEqual(
			upgradeOfferFor(7, [CONFIGS.js])
		);
	});

	it("withholds an offer when nothing in the build can be upgraded", () => {
		expect(acrossSeeds([CONFIGS.eslint]).every((c) => c === undefined)).toBe(
			true
		);
	});

	it("withholds an offer from an empty build", () => {
		expect(acrossSeeds([]).every((config) => config === undefined)).toBe(true);
	});
});

describe("versionOddsFor", () => {
	const shares = (held: number, maxLevel: number) =>
		versionOddsFor(held, maxLevel).map(({ version, share }) => [
			version,
			share,
		]);

	it("halves per rung and hands the cap the flips it cannot take", () => {
		expect(shares(1, 5)).toEqual([
			[2, 1 / 2],
			[3, 1 / 4],
			[4, 1 / 8],
			[5, 1 / 8],
		]);
	});

	it("makes a two-rung ladder's second rung a certainty", () => {
		expect(shares(1, 2)).toEqual([[2, 1]]);
	});

	it("reads from the rung held, so a v3 sees only v4 and v5", () => {
		expect(shares(3, 5)).toEqual([
			[4, 1 / 2],
			[5, 1 / 2],
		]);
	});

	it("sums to one however tall the ladder", () => {
		for (const maxLevel of [2, 3, 5, 8]) {
			const total = versionOddsFor(1, maxLevel).reduce(
				(sum, { share }) => sum + share,
				0
			);
			expect(total).toBeCloseTo(1);
		}
	});

	it("has nothing to say for a config at its cap", () => {
		expect(versionOddsFor(5, 5)).toEqual([]);
	});

	it("states the share of the rung a rolled offer landed on", () => {
		expect(offerOddsOf(1, { ...CONFIGS.js, level: 3 })).toBe(1 / 4);
		expect(offerOddsOf(1, { ...CONFIGS.telemetry, level: 2 })).toBe(1);
	});
});

describe("isUpgradeOffer", () => {
	it("reads a higher version of an installed config as an upgrade", () => {
		expect(isUpgradeOffer([CONFIGS.js], { ...CONFIGS.js, level: 2 })).toBe(
			true
		);
	});

	it("reads an unowned config as a plain offer", () => {
		expect(isUpgradeOffer([CONFIGS.ts], { ...CONFIGS.js, level: 2 })).toBe(
			false
		);
	});

	it("reads the same version of an installed config as a re-buy", () => {
		expect(isUpgradeOffer([CONFIGS.js], CONFIGS.js)).toBe(false);
	});
});
