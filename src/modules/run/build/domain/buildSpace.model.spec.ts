import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { Build } from "~/modules/run/build/domain/build.model";
import {
	buildSpaceOf,
	fitsBuildSpace,
	rungFitting,
	settleUpkeep,
} from "~/modules/run/build/domain/buildSpace.model";
import {
	BASE_SLOTS,
	BUILD_SPACE_RUNGS,
} from "~/modules/run/run/domain/rules.model";

const buildOf = (configs: Config[]): Build => ({
	id: "hyrule-ci",
	configs,
});

const holding = (configs: Config[], spaceDroppedTo?: number) => ({
	build: buildOf(configs),
	spaceDroppedTo,
});

const fourWtfpl = (): Config[] => Array.from({ length: 4 }, () => CONFIGS.wtfpl);

describe("the build space ladder (ADR-098)", () => {
	it("opens every run on four weight of free room", () => {
		expect(BASE_SLOTS).toBe(4);
		expect(rungFitting(BASE_SLOTS)).toEqual({ weight: 4, kb: 0 });
	});

	it("rents the smallest rung a weight fits in, rounding up between rungs", () => {
		expect(rungFitting(7)).toEqual({ weight: 8, kb: 32 });
		expect(rungFitting(9)).toEqual({ weight: 12, kb: 64 });
		expect(rungFitting(12)).toEqual({ weight: 12, kb: 64 });
	});

	it("rents the free rung for a weight below it", () => {
		expect(rungFitting(0)).toEqual({ weight: 4, kb: 0 });
	});

	it("holds the top rung for a weight heavier than the ladder", () => {
		expect(rungFitting(64)).toEqual({ weight: 32, kb: 512 });
	});

	it("doubles the bill at every billed rung, so room is never cheap twice", () => {
		const billed = BUILD_SPACE_RUNGS.filter((rung) => rung.kb > 0);

		billed.slice(1).forEach((rung, index) => {
			expect(rung.kb).toBe(billed[index].kb * 2);
		});
	});
});

describe("the space a build holds", () => {
	it("rents the smallest rung the build fits in", () => {
		expect(buildSpaceOf(holding([CONFIGS.js])).space).toBe(4);
		expect(buildSpaceOf(holding([CONFIGS.wtfpl])).space).toBe(8);
		expect(buildSpaceOf(holding([CONFIGS.wtfpl, CONFIGS.js])).space).toBe(12);
	});

	it("bills a weight one over a rung for the whole rung above it", () => {
		expect(buildSpaceOf(holding([CONFIGS.js])).upkeepKb).toBe(0);
		expect(buildSpaceOf(holding([CONFIGS.wtfpl])).upkeepKb).toBe(32);
		expect(buildSpaceOf(holding([CONFIGS.wtfpl, CONFIGS.js])).upkeepKb).toBe(
			64
		);
	});

	it("leaves free only the room inside the rung it rents", () => {
		expect(buildSpaceOf(holding([CONFIGS.indexedDb])).freeWeight).toBe(2);
		expect(buildSpaceOf(holding([CONFIGS.wtfpl])).freeWeight).toBe(0);
	});

	it("measures a vendor-locked config as though it were not there", () => {
		const locked: Build = {
			id: "hyrule-ci",
			configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd, CONFIGS.indexedDb],
			vendorLockedConfigId: CONFIGS.agentsMd.id,
		};

		expect(buildSpaceOf({ build: locked }).weight).toBe(
			buildSpaceOf(holding([CONFIGS.vendorLockIn, CONFIGS.indexedDb])).weight
		);
	});
});

describe("the cap a build is held to", () => {
	it("caps an uncapped run at the top of the ladder", () => {
		expect(buildSpaceOf(holding([CONFIGS.js])).cap).toBe(32);
	});

	it("caps a run at the space its balance covered", () => {
		expect(buildSpaceOf(holding([CONFIGS.js], 8)).cap).toBe(8);
	});

	it("reports an overflow only past the top of the ladder when uncapped", () => {
		const over = holding([...fourWtfpl(), CONFIGS.wtfpl]);

		expect(buildSpaceOf(over).overflow).toBe(8);
		expect(buildSpaceOf(holding(fourWtfpl())).overflow).toBe(0);
	});

	it("reports the weight past the covered space as overflow", () => {
		const capped = holding([CONFIGS.wtfpl, CONFIGS.indexedDb], 8);

		expect(buildSpaceOf(capped).overflow).toBe(2);
		expect(buildSpaceOf(capped).roomLeft).toBe(0);
	});
});

describe("whether a config fits", () => {
	it("fits anything the top rung can still hold on an uncapped run", () => {
		expect(fitsBuildSpace(holding([CONFIGS.indexedDb]), 16)).toBe(true);
		expect(fitsBuildSpace(holding(fourWtfpl()), 1)).toBe(false);
	});

	it("refuses a config past the space the balance covered", () => {
		const capped = holding([CONFIGS.wtfpl], 8);

		expect(fitsBuildSpace(capped, 1)).toBe(false);
		expect(fitsBuildSpace(holding([CONFIGS.wtfpl]), 1)).toBe(true);
	});

	it("fits a config that fills the covered space exactly", () => {
		expect(fitsBuildSpace(holding([CONFIGS.indexedDb], 8), 6)).toBe(true);
		expect(fitsBuildSpace(holding([CONFIGS.indexedDb], 8), 7)).toBe(false);
	});
});

describe("YAGNI discounts the bill for the room the build is not using", () => {
	it("leaves the bill alone when it is not installed", () => {
		expect(buildSpaceOf(holding([CONFIGS.wtfpl])).upkeepKb).toBe(32);
		expect(
			buildSpaceOf(holding([CONFIGS.wtfpl, CONFIGS.js])).emptyCreditKb
		).toBe(0);
	});

	it("credits nothing when the build fills its rung exactly", () => {
		const flush = buildSpaceOf(
			holding([CONFIGS.yagni, CONFIGS.wtfpl, CONFIGS.js, CONFIGS.indexedDb])
		);
		expect(flush.freeWeight).toBe(0);
		expect(flush.upkeepKb).toBe(64);
	});

	it("credits 8 KB for a single empty slot", () => {
		const oneSpare = buildSpaceOf(
			holding([CONFIGS.yagni, CONFIGS.wtfpl, CONFIGS.indexedDb])
		);
		expect(oneSpare.freeWeight).toBe(1);
		expect(oneSpare.emptyCreditKb).toBe(8);
		expect(oneSpare.upkeepKb).toBe(56);
	});

	it("credits every empty slot, so a build low in a wide rung pays least", () => {
		const threeSpare = buildSpaceOf(holding([CONFIGS.yagni, CONFIGS.wtfpl]));
		expect(threeSpare.freeWeight).toBe(3);
		expect(threeSpare.emptyCreditKb).toBe(24);
		expect(threeSpare.upkeepKb).toBe(40);
	});

	it("never credits past the bill, so the free rung still pays nothing", () => {
		const tiny = buildSpaceOf(holding([CONFIGS.yagni, CONFIGS.js]));
		expect(tiny.freeWeight).toBe(2);
		expect(tiny.upkeepKb).toBe(0);
	});

	it("costs more than it saves when it tips a flush build into a wider rung", () => {
		expect(buildSpaceOf(holding([CONFIGS.wtfpl])).upkeepKb).toBe(32);
		expect(
			buildSpaceOf(holding([CONFIGS.wtfpl, CONFIGS.yagni])).upkeepKb
		).toBe(40);
	});

	it("counts the room a vendor lock frees as empty too", () => {
		const locked: Build = {
			id: "hyrule-ci",
			configs: [
				CONFIGS.vendorLockIn,
				CONFIGS.yagni,
				CONFIGS.agentsMd,
				CONFIGS.indexedDb,
			],
			vendorLockedConfigId: CONFIGS.agentsMd.id,
		};
		const space = buildSpaceOf({ build: locked });
		expect(space.freeWeight).toBe(1);
		expect(space.upkeepKb).toBe(24);
	});
});

describe("settling the upkeep against a balance", () => {
	it("pays the whole bill and leaves no cap when the balance covers it", () => {
		expect(settleUpkeep(buildOf([CONFIGS.wtfpl]), 32)).toEqual({ paidKb: 32 });
	});

	it("pays the widest rung the balance covers and caps the build there", () => {
		expect(settleUpkeep(buildOf(fourWtfpl()), 100)).toEqual({
			paidKb: 64,
			droppedTo: 12,
		});
	});

	it("drops to the free rung when the balance covers nothing", () => {
		expect(settleUpkeep(buildOf([CONFIGS.wtfpl]), 0)).toEqual({
			paidKb: 0,
			droppedTo: 4,
		});
	});

	it("never falls below the free rung, so a spent run still carries a build", () => {
		expect(settleUpkeep(buildOf([CONFIGS.wtfpl]), -50)).toEqual({
			paidKb: 0,
			droppedTo: 4,
		});
	});

	it("bills the YAGNI-credited figure, not the bare rung", () => {
		expect(
			settleUpkeep(buildOf([CONFIGS.yagni, CONFIGS.wtfpl]), 40)
		).toEqual({ paidKb: 40 });
	});
});
