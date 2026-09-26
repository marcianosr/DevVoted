import { describe, expect, it } from "vitest";

import {
	BASE_SLOTS,
	TOP_BUILD_SPACE_RUNG,
	buildSpaceFor,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	Build,
	freeSlots,
	gateClearPayout,
	canLint,
	extraPickPayoutFor,
	hasRoomFor,
	isBare,
	isOverCapacity,
	occupiedSlots,
	rungAfterBuild,
	spaceForBuild,
	upkeepForBuild,
	overflowSlots,
	buildModifiersFor,
	rewardMultiplierFor,
	storageInterestFor,
	stripConfig,
} from "~/modules/run/build/domain/build.model";

const buildOf = (configs: Config[]): Build => ({
	id: "hyrule-ci",
	configs,
});

describe("the build space the run rents (ADR-098)", () => {
	it("opens every run on the free four", () => {
		expect(BASE_SLOTS).toBe(4);
	});

	it("tops out at 32, the widest rung on the ladder", () => {
		expect(buildSpaceFor(TOP_BUILD_SPACE_RUNG)).toBe(32);
	});

	it("rents the smallest rung the build fits in", () => {
		expect(spaceForBuild(buildOf([CONFIGS.js]))).toBe(4);
		expect(spaceForBuild(buildOf([CONFIGS.wtfpl]))).toBe(8);
		expect(spaceForBuild(buildOf([CONFIGS.wtfpl, CONFIGS.js]))).toBe(12);
	});

	it("bills a weight one over a rung for the whole rung above it", () => {
		expect(upkeepForBuild(buildOf([CONFIGS.js]))).toBe(0);
		expect(upkeepForBuild(buildOf([CONFIGS.wtfpl]))).toBe(32);
		expect(upkeepForBuild(buildOf([CONFIGS.wtfpl, CONFIGS.js]))).toBe(64);
	});

	it("names the rung ahead, and nothing once the ladder runs out", () => {
		expect(rungAfterBuild(buildOf([CONFIGS.js]))?.weight).toBe(6);
		expect(
			rungAfterBuild(buildOf(Array.from({ length: 4 }, () => CONFIGS.wtfpl)))
		).toBeUndefined();
	});
});

describe("what fills the build (ADR-044)", () => {
	it("charges each config the slots its size names", () => {
		expect(occupiedSlots([CONFIGS.js])).toBe(1);
		expect(occupiedSlots([CONFIGS.indexedDb])).toBe(2);
		expect(occupiedSlots([CONFIGS.wtfpl])).toBe(8);
		expect(occupiedSlots([CONFIGS.js, CONFIGS.indexedDb])).toBe(3);
	});

	it("leaves free only the room inside the rung it rents", () => {
		expect(freeSlots(buildOf([CONFIGS.indexedDb]))).toBe(2);
		expect(freeSlots(buildOf([CONFIGS.wtfpl]))).toBe(0);
	});

	/**
	 * Room stopped being a reason to refuse an offer at every rung but the last
	 * (ADR-098): a build grows into the rung above rather than being held out of
	 * it, so only the top of the ladder can still say no.
	 */
	it("refuses only what the top rung cannot hold", () => {
		expect(hasRoomFor(buildOf([CONFIGS.indexedDb]), 16)).toBe(true);

		const brimming = buildOf(Array.from({ length: 4 }, () => CONFIGS.wtfpl));
		expect(hasRoomFor(brimming, 1)).toBe(false);
	});

	it("reports an overflow only past the top of the ladder", () => {
		const over = buildOf(Array.from({ length: 5 }, () => CONFIGS.wtfpl));

		expect(isOverCapacity(over)).toBe(true);
		expect(overflowSlots(over)).toBe(8);
	});
});

const buildWith = buildOf;

describe("rewardMultiplierFor", () => {
	it("is 1 across the whole shipped roster — configs pay in coverage or KB, never in a storage multiplier", () => {
		expect(
			rewardMultiplierFor([
				{ ...CONFIGS.unitTests, level: 2 },
				CONFIGS.agentsMd,
				CONFIGS.coldStart,
				CONFIGS.intellisense,
			])
		).toBe(1);
	});

	it("is 1 for a bare build", () => {
		expect(rewardMultiplierFor([])).toBe(1);
	});
});

describe("buildModifiersFor", () => {
	it("prices a bare build at the opening gate's reward with identity multipliers", () => {
		expect(buildModifiersFor([], 0)).toEqual({
			gateReward: 32,
			rewardMultiplier: 1,
		});
	});

	it("prices the clear against the gate being previewed, not the base", () => {
		expect(buildModifiersFor([], 1).gateReward).toBe(64);
		expect(buildModifiersFor([], 2).gateReward).toBe(96);
	});

	it("agrees with what a full window actually pays", () => {
		const configs = [CONFIGS.unitTests, CONFIGS.agentsMd];
		for (const gate of [0, 1, 5, 12])
			expect(buildModifiersFor(configs, gate).gateReward).toBe(
				gateClearPayout(configs, SLICE_WINDOW, gate)
			);
	});

	it("folds flat clear payouts into the modifier set", () => {
		expect(
			buildModifiersFor([CONFIGS.unitTests, CONFIGS.agentsMd], 0)
		).toEqual({
			gateReward: 64,
			rewardMultiplier: 1,
		});
	});
});

describe("gateClearPayout", () => {
	it("scales the base reward with window correctness", () => {
		expect(gateClearPayout([], 5, 0)).toBe(32);
		expect(gateClearPayout([], 3, 0)).toBe(19);
	});

	it("rides the same gate-depth curve as coverage", () => {
		expect(gateClearPayout([], 5, 4)).toBe(160);
		expect(gateClearPayout([], 5, 11)).toBe(384);
	});

	it("caps the depth multiplier at the summit for endless runs", () => {
		expect(gateClearPayout([], 5, VICTORY_GATE)).toBe(416);
		expect(gateClearPayout([], 5, 30)).toBe(416);
	});

	it("pays a 0/5 clear nothing — a farm build banks no storage", () => {
		expect(gateClearPayout([], 0, 11)).toBe(0);
	});

	it("keeps flat clear payouts whole — they ride their own passed check", () => {
		expect(gateClearPayout([CONFIGS.unitTests], 3, 0)).toBe(19 + 32);
	});
});

describe("storageInterestFor", () => {
	it("pays nothing without an interest config", () => {
		expect(storageInterestFor([], 512)).toBe(0);
		expect(storageInterestFor([CONFIGS.unitTests], 512)).toBe(0);
	});

	it("pays 2% of held storage at L1, rounded down to whole KB", () => {
		expect(storageInterestFor([CONFIGS.mooresLaw], 512)).toBe(10);
		expect(storageInterestFor([CONFIGS.mooresLaw], 99)).toBe(1);
	});

	it("pays 2% more per level, reaching a tenth at L5", () => {
		expect(storageInterestFor([{ ...CONFIGS.mooresLaw, level: 3 }], 512)).toBe(
			30
		);
		expect(storageInterestFor([{ ...CONFIGS.mooresLaw, level: 5 }], 512)).toBe(
			51
		);
	});

	it("pays nothing on a balance too small to earn a whole KB", () => {
		expect(storageInterestFor([CONFIGS.mooresLaw], 0)).toBe(0);
		expect(storageInterestFor([CONFIGS.mooresLaw], 32)).toBe(0);
	});

	it("compounds across gates by reading the grown balance each time", () => {
		const maxed = [{ ...CONFIGS.mooresLaw, level: 5 }];
		const first = storageInterestFor(maxed, 512);
		expect(storageInterestFor(maxed, 512 + first)).toBe(56);
	});
});

const PER_EXTRA_PICK: Config = {
	id: "per-extra-pick",
	label: "Per extra pick",
	description: "Pays per correct answer beyond one per poll.",
	rewardMultiplier: 1,
	storagePerExtraPick: 16,
};

describe("extraPickPayoutFor", () => {
	it("pays nothing to a build with no config on the axis", () => {
		expect(extraPickPayoutFor([], 3)).toBe(0);
		expect(extraPickPayoutFor([CONFIGS.unitTests], 3)).toBe(0);
		expect(extraPickPayoutFor([CONFIGS.length], 3)).toBe(0);
	});

	it("pays its rate per correct answer beyond one per poll", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 3)).toBe(48);
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 1)).toBe(16);
	});

	it("pays nothing on a window of single-answer polls, the axis's dead slot", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 0)).toBe(0);
	});

	it("never pays negative on a short final window", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], -2)).toBe(0);
	});
});

describe("canLint", () => {
	it("is true only for a linter that covers the poll's category", () => {
		expect(canLint([CONFIGS.eslint], "js")).toBe(true);
		expect(canLint([CONFIGS.eslint], "ts")).toBe(true);
		expect(canLint([CONFIGS.eslint], "css")).toBe(false);
		expect(canLint([CONFIGS.stylelint], "css")).toBe(true);
		expect(canLint([CONFIGS.js, CONFIGS.agentsMd], "js")).toBe(false);
	});
});

describe("stripConfig and isBare", () => {
	it("peels a config and reports bareness", () => {
		expect(isBare(buildWith([]))).toBe(true);
		const stripped = stripConfig(
			buildWith([CONFIGS.js, CONFIGS.eslint]),
			"eslint"
		);
		expect(stripped.configs.map((config) => config.id)).toEqual(["js"]);
	});
});
