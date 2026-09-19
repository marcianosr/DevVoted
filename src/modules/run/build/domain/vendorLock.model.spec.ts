import { describe, expect, it } from "vitest";

import {
	billableSlotsOf,
	occupiedSlots,
	overflowSlots,
	stripConfig,
} from "~/modules/run/build/domain/build.model";
import {
	canVendorLock,
	isVendorLocked,
} from "~/modules/run/build/domain/vendorLock.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";

const AGENTS_MD_WEIGHT = 8;
const VENDOR_LOCK_WEIGHT = 4;

const inShopHolding = (...ids: string[]): RunState => {
	const base = clearGate(started(["js"]));
	const configs = ids.map((id) => {
		const found = Object.values(CONFIGS).find((config) => config.id === id);
		if (!found) throw new Error(`no config ${id}`);
		return found;
	});
	return {
		...base,
		build: { ...base.build, slots: 32, configs },
	};
};

const locked = (state: RunState, configId: string): RunState =>
	runReducer(state, { type: "vendor-lock", configId });

describe("vendor-lock-in", () => {
	it("stops the locked config counting against the space the build rents", () => {
		const state = inShopHolding("vendor-lock-in", "agents-md");
		const after = locked(state, "agents-md");

		expect(occupiedSlots(after.build.configs)).toBe(
			VENDOR_LOCK_WEIGHT + AGENTS_MD_WEIGHT
		);
		expect(billableSlotsOf(after.build)).toBe(VENDOR_LOCK_WEIGHT);
	});

	it("leaves the weight a build carries untouched, so only the rent moves", () => {
		const state = inShopHolding("vendor-lock-in", "agents-md");
		const before = occupiedSlots(state.build.configs);

		expect(occupiedSlots(locked(state, "agents-md").build.configs)).toBe(
			before
		);
	});

	it("frees a build that its rung had over capacity", () => {
		const cramped = {
			...inShopHolding("vendor-lock-in", "agents-md"),
			build: {
				...inShopHolding("vendor-lock-in", "agents-md").build,
				slots: 8,
			},
		};
		expect(overflowSlots(cramped.build)).toBe(4);

		expect(overflowSlots(locked(cramped, "agents-md").build)).toBe(0);
	});

	it("refuses to lock the vendor to itself", () => {
		const state = inShopHolding("vendor-lock-in", "agents-md");

		expect(locked(state, "vendor-lock-in")).toBe(state);
	});

	it("refuses to lock a config the build does not hold", () => {
		const state = inShopHolding("vendor-lock-in", "agents-md");

		expect(locked(state, "freemium")).toBe(state);
	});

	it("refuses a second lock once one is placed", () => {
		const state = inShopHolding("vendor-lock-in", "agents-md", "intellisense");
		const once = locked(state, "agents-md");

		expect(locked(once, "intellisense")).toBe(once);
		expect(once.build.vendorLockedConfigId).toBe("agents-md");
	});

	it("refuses to lock at all without the config that grants it", () => {
		const state = inShopHolding("agents-md", "intellisense");

		expect(canVendorLock(state)).toBe(false);
		expect(locked(state, "agents-md")).toBe(state);
	});

	it("refuses to sell the config it locked in", () => {
		const state = locked(
			inShopHolding("vendor-lock-in", "agents-md"),
			"agents-md"
		);

		expect(runReducer(state, { type: "sell", configId: "agents-md" })).toBe(
			state
		);
	});

	it("refuses to drop the config it locked in", () => {
		const state = locked(
			inShopHolding("vendor-lock-in", "agents-md"),
			"agents-md"
		);

		expect(runReducer(state, { type: "drop", configId: "agents-md" })).toBe(
			state
		);
	});

	it("still sells every config it did not lock", () => {
		const state = locked(
			inShopHolding("vendor-lock-in", "agents-md", "intellisense"),
			"agents-md"
		);
		const sold = runReducer(state, {
			type: "sell",
			configId: "intellisense",
		});

		expect(sold).not.toBe(state);
		expect(isVendorLocked(sold, "agents-md")).toBe(true);
	});

	it("releases the lock when the vendor itself is sold", () => {
		const state = locked(
			inShopHolding("vendor-lock-in", "agents-md", "intellisense"),
			"agents-md"
		);
		const sold = runReducer(state, {
			type: "sell",
			configId: "vendor-lock-in",
		});

		expect(sold.build.vendorLockedConfigId).toBeUndefined();
		expect(billableSlotsOf(sold.build)).toBe(occupiedSlots(sold.build.configs));
	});

	it("releases the lock when the locked config leaves by a peel", () => {
		const state = locked(
			inShopHolding("vendor-lock-in", "agents-md"),
			"agents-md"
		);
		const peeled = stripConfig(state.build, "agents-md");

		expect(peeled.vendorLockedConfigId).toBeUndefined();
	});

	it("holds the lock across a gate, because it is a run-long commitment", () => {
		const state = locked(
			inShopHolding("vendor-lock-in", "agents-md"),
			"agents-md"
		);
		const next = clearGate(
			runReducer(state, { type: "finish-reward" })
		);

		expect(next.build.vendorLockedConfigId).toBe("agents-md");
	});
});
