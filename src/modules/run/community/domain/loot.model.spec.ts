import { describe, expect, it } from "vitest";

import {
	type LootTarget,
	type LootViewer,
	lootRefusalOf,
} from "~/modules/run/community/domain/loot.model";

const ASH = "ash";
const MISTY = "misty";

const corpse = (over: Partial<LootTarget> = {}): LootTarget => ({
	ownerId: ASH,
	lootedById: null,
	lootKb: 67,
	...over,
});

const climber = (over: Partial<LootViewer> = {}): LootViewer => ({
	id: MISTY,
	hasLiveRun: true,
	...over,
});

describe("who may take a fallen run's leftovers", () => {
	it("lets a climber with a live run take an untouched corpse", () => {
		expect(lootRefusalOf(corpse(), climber())).toBeNull();
	});

	it("refuses a corpse somebody already took, naming that first", () => {
		expect(lootRefusalOf(corpse({ lootedById: ASH }), climber())).toBe(
			"already-looted"
		);
	});

	it("refuses your own fallen run", () => {
		expect(lootRefusalOf(corpse(), climber({ id: ASH }))).toBe("own-run");
	});

	it("reports an empty corpse as empty rather than as your own", () => {
		expect(lootRefusalOf(corpse({ lootKb: 0 }), climber({ id: MISTY }))).toBe(
			"nothing-left"
		);
	});

	it("refuses a climber who has no run to take it into", () => {
		expect(lootRefusalOf(corpse(), climber({ hasLiveRun: false }))).toBe(
			"no-run"
		);
	});

	it("names the taken corpse even to the climber who owns it", () => {
		expect(
			lootRefusalOf(corpse({ lootedById: MISTY }), climber({ id: ASH }))
		).toBe("already-looted");
	});
});
