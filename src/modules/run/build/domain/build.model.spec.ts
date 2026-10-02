import { describe, expect, it } from "vitest";

import {
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";
import {
	Build,
	gateClearPayout,
	canLint,
	extraPickPayoutFor,
	isBare,
	occupiedSlots,
	buildModifiersFor,
	rewardMultiplierFor,
	storageInterestFor,
	stripConfig,
} from "~/modules/run/build/domain/build.model";

const buildOf = (configs: Config[]): Build => ({
	id: "hyrule-ci",
	configs,
});

const NARROW_LINTER = {
	...CONFIGS.linter,
	eliminatesWrongOptionsFor: ["js", "ts"] as const,
};

describe("what fills the build (ADR-044)", () => {
	it("charges each config the slots its size names", () => {
		expect(occupiedSlots([CONFIGS.js])).toBe(1);
		expect(occupiedSlots([CONFIGS.indexedDb])).toBe(2);
		expect(occupiedSlots([CONFIGS.wtfpl])).toBe(8);
		expect(occupiedSlots([CONFIGS.js, CONFIGS.indexedDb])).toBe(3);
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
		expect(canLint([NARROW_LINTER], "js")).toBe(true);
		expect(canLint([NARROW_LINTER], "ts")).toBe(true);
		expect(canLint([NARROW_LINTER], "css")).toBe(false);
		expect(canLint([CONFIGS.js, CONFIGS.agentsMd], "js")).toBe(false);
	});

	it("is true on every category for the roster's Linter", () => {
		CATEGORY_CODES.forEach((category) =>
			expect(canLint([CONFIGS.linter], category)).toBe(true)
		);
	});
});

describe("stripConfig and isBare", () => {
	it("peels a config and reports bareness", () => {
		expect(isBare(buildWith([]))).toBe(true);
		const stripped = stripConfig(
			buildWith([CONFIGS.js, CONFIGS.linter]),
			"linter"
		);
		expect(stripped.configs.map((config) => config.id)).toEqual(["js"]);
	});
});

