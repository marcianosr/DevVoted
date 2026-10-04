import { describe, expect, it } from "vitest";

import { TITLES } from "~/modules/account/profile/domain/title.model";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import {
	configTallyOf,
	pollTallyOf,
	tallyOf,
	titleTallyOf,
} from "~/modules/collection/dex/domain/tally.model";

const LEGACY_TESTER = "title-legacy-tester";
const IT_COMPILES = "title-it-compiles";

describe("tallyOf", () => {
	it("counts what is held against everything listed", () => {
		expect(tallyOf([1, 2, 3, 4], (value) => value % 2 === 0)).toEqual({
			held: 2,
			total: 4,
		});
	});

	it("reads zero of zero for an empty list", () => {
		expect(tallyOf([], () => true)).toEqual({ held: 0, total: 0 });
	});
});

describe("pollTallyOf", () => {
	it("holds a poll dealt or answered at least once", () => {
		expect(
			pollTallyOf([
				{ categoryCode: "css", timesSeen: 3 },
				{ categoryCode: "js", timesSeen: 1 },
				{ categoryCode: "js", timesSeen: 0 },
			])
		).toEqual({ held: 2, total: 3 });
	});

	it("leaves a poll outside every Dex category out of both sides", () => {
		expect(
			pollTallyOf([
				{ categoryCode: "css", timesSeen: 1 },
				{ categoryCode: "cobol", timesSeen: 4 },
			])
		).toEqual({ held: 1, total: 1 });
	});
});

describe("configTallyOf", () => {
	it("holds only the free configs for a fresh account, out of the whole roster", () => {
		expect(configTallyOf(configdex([], []))).toEqual({
			held: FREE_CONFIG_IDS.length,
			total: CONFIG_LIST.length,
		});
	});

	it("holds the free configs and every unlocked one, nothing else", () => {
		const entries = configdex(
			[{ configId: "telemetry", viaMetric: "community-peeks" }],
			[]
		);

		expect(configTallyOf(entries).held).toBe(FREE_CONFIG_IDS.length + 1);
	});

	it("holds one more for an unlocked config", () => {
		const before = configTallyOf(configdex([], [])).held;
		const after = configTallyOf(
			configdex([{ configId: "telemetry", viaMetric: "polls-correct" }], [])
		).held;

		expect(after).toBe(before + 1);
	});
});

describe("titleTallyOf", () => {
	it("counts an earnable title towards the total before it is owned", () => {
		const earnable = TITLES.filter((title) => title.earn.kind !== "granted");

		expect(titleTallyOf([])).toEqual({ held: 0, total: earnable.length });
	});

	it("adds a granted title to both sides only for the account that owns it", () => {
		const without = titleTallyOf([IT_COMPILES]);
		const withIt = titleTallyOf([IT_COMPILES, LEGACY_TESTER]);

		expect(withIt).toEqual({
			held: without.held + 1,
			total: without.total + 1,
		});
	});

	it("never holds a retired title id, so held cannot pass the total", () => {
		const tally = titleTallyOf([IT_COMPILES, "title-retired-long-ago"]);

		expect(tally.held).toBe(1);
		expect(tally.held).toBeLessThanOrEqual(tally.total);
	});

	it("counts a title owned twice once", () => {
		expect(titleTallyOf([IT_COMPILES, IT_COMPILES]).held).toBe(1);
	});
});
