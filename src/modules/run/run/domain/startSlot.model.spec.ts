import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { handed, pool } from "~/modules/run/run/domain/run.factory";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import {
	MAX_SLOTS,
	SLOT_PRICES_KB,
} from "~/modules/run/run/domain/rules.model";
import {
	buyStartSlot,
	canBuyStartSlot,
	canRefundStartSlot,
	refundStartSlot,
	startSlotPriceKb,
	startSlotRefundKb,
} from "~/modules/run/run/domain/startSlot.model";

const opening = (overrides: Partial<RunState> = {}): RunState => ({
	...createRun(pool(6), handed),
	...overrides,
});

describe("startSlotPriceKb", () => {
	it("doubles the rung the shop would charge, the archive paying a premium", () => {
		expect(startSlotPriceKb(opening())).toBe(SLOT_PRICES_KB[0] * 2);
	});

	it("climbs the same ladder the shop climbs, start purchases counting on it", () => {
		expect(startSlotPriceKb(opening({ slotsBought: 3 }))).toBe(
			SLOT_PRICES_KB[3] * 2
		);
	});

	it("quotes nothing once the build stands at the ceiling", () => {
		expect(
			startSlotPriceKb(
				opening({
					slotsBought: 20,
					build: { id: "b", slots: MAX_SLOTS, configs: [] },
				})
			)
		).toBeUndefined();
	});
});

describe("startSlotRefundKb", () => {
	it("returns exactly what the last slot cost, so the loop cannot profit", () => {
		const state = opening({
			slotsBought: 2,
			build: { id: "b", slots: 6, configs: [] },
		});

		expect(startSlotRefundKb(state)).toBe(SLOT_PRICES_KB[1] * 2);
		expect(startSlotRefundKb(state)).toBe(
			startSlotPriceKb(opening({ slotsBought: 1 }))
		);
	});

	it("refuses a run that has bought nothing, the free four never being for sale", () => {
		expect(startSlotRefundKb(opening())).toBeUndefined();
		expect(canRefundStartSlot(opening())).toBe(false);
	});
});

describe("buyStartSlot", () => {
	it("widens the build and bills the archive, leaving run storage alone", () => {
		const { state, archiveKb } = buyStartSlot(opening({ storage: 64 }), 512);

		expect(state.build.slots).toBe(5);
		expect(state.slotsBought).toBe(1);
		expect(archiveKb).toBe(512 - SLOT_PRICES_KB[0] * 2);
		expect(state.storage).toBe(64);
	});

	it("refuses an archive that cannot cover the rung, changing nothing", () => {
		const before = opening();
		const { state, archiveKb } = buyStartSlot(before, 12);

		expect(canBuyStartSlot(before, 12)).toBe(false);
		expect(state).toBe(before);
		expect(archiveKb).toBe(12);
	});

	it("leaves the shop's next slot standing on the rung above what the archive bought", () => {
		const { state } = buyStartSlot(opening(), 512);

		expect(startSlotPriceKb(state)).toBe(SLOT_PRICES_KB[1] * 2);
	});
});

describe("refundStartSlot", () => {
	it("hands the width back and credits the archive with what it paid", () => {
		const opened = buyStartSlot(opening(), 512);
		const handedBack = refundStartSlot(opened.state, opened.archiveKb);

		expect(handedBack.state.build.slots).toBe(4);
		expect(handedBack.state.slotsBought).toBe(0);
		expect(handedBack.archiveKb).toBe(512);
	});

	it("rolls the ladder back, unlike the shop's cash-out", () => {
		const opened = buyStartSlot(opening(), 512);
		const handedBack = refundStartSlot(opened.state, opened.archiveKb);

		expect(startSlotPriceKb(handedBack.state)).toBe(SLOT_PRICES_KB[0] * 2);
	});

	it("refuses to hand back width a config is standing in", () => {
		const opened = buyStartSlot(opening(), 512);
		const full = {
			...opened.state,
			build: {
				...opened.state.build,
				configs: [CONFIGS.freemium],
			},
		};

		expect(canRefundStartSlot(full)).toBe(false);
		expect(refundStartSlot(full, opened.archiveKb).state).toBe(full);
	});
});

describe("once the run is under way", () => {
	const started = opening({ status: "answering", slotsBought: 1 });

	it("shuts the archive out of buying, the offer being a start-screen one", () => {
		expect(canBuyStartSlot(started, 4096)).toBe(false);
		expect(buyStartSlot(started, 4096).state).toBe(started);
	});

	it("shuts it out of refunding, so a 16 KB shop slot cannot sell back for 32", () => {
		expect(canRefundStartSlot(started)).toBe(false);
		expect(refundStartSlot(started, 0).archiveKb).toBe(0);
	});
});
