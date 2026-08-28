import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	billLedger,
	billSubscriptionsOnClear,
	subscriptionBillFor,
	subscriptionBillTotal,
} from "~/modules/run/config/domain/subscription.model";

describe("subscriptionBillFor", () => {
	it("doubles Freemium's bill with every gate of run depth", () => {
		const ladder = [0, 1, 2, 3, 4, 5].map((gate) =>
			subscriptionBillFor(CONFIGS.freemium, gate)
		);
		expect(ladder).toEqual([8, 16, 32, 64, 128, 256]);
	});

	it("prices a deep re-draft at the deep rate, so dropping it resets nothing", () => {
		expect(subscriptionBillFor(CONFIGS.freemium, 5)).toBe(256);
	});

	it("charges nothing for a config that carries no subscription", () => {
		expect(subscriptionBillFor(CONFIGS.agentsMd, 4)).toBe(0);
		expect(subscriptionBillTotal([CONFIGS.agentsMd, CONFIGS.js], 4)).toBe(0);
	});
});

describe("billSubscriptionsOnClear", () => {
	it("leaves a build with no subscription untouched, identity included", () => {
		const configs: readonly Config[] = [CONFIGS.agentsMd, CONFIGS.js];
		const billed = billSubscriptionsOnClear(configs, 128, 3);
		expect(billed.configs).toBe(configs);
		expect(billed.paidKb).toBe(0);
		expect(billed.lapsed).toEqual([]);
	});

	it("charges the gate's bill and keeps the config installed", () => {
		const billed = billSubscriptionsOnClear([CONFIGS.freemium], 128, 2);
		expect(billed.paidKb).toBe(32);
		expect(billed.configs).toEqual([CONFIGS.freemium]);
		expect(billed.lapsed).toEqual([]);
	});

	it("lapses the config when the balance cannot cover the bill", () => {
		const billed = billSubscriptionsOnClear(
			[CONFIGS.freemium, CONFIGS.js],
			100,
			4
		);
		expect(billed.lapsed).toEqual([CONFIGS.freemium]);
		expect(billed.configs).toEqual([CONFIGS.js]);
		expect(billed.paidKb).toBe(0);
	});

	it("lapses on the exact shortfall and survives on the exact balance", () => {
		expect(billSubscriptionsOnClear([CONFIGS.freemium], 64, 3).lapsed).toEqual(
			[]
		);
		expect(billSubscriptionsOnClear([CONFIGS.freemium], 63, 3).lapsed).toEqual([
			CONFIGS.freemium,
		]);
	});

	it("pays what the balance covers and lapses only the rest", () => {
		const second: Config = { ...CONFIGS.freemium, id: "freemium-2" };
		const billed = billSubscriptionsOnClear([CONFIGS.freemium, second], 40, 2);
		expect(billed.paidKb).toBe(32);
		expect(billed.configs).toEqual([CONFIGS.freemium]);
		expect(billed.lapsed).toEqual([second]);
	});
});

describe("billLedger", () => {
	const atGate = (gate: number, configs: readonly Config[], storageKb = 512) =>
		billLedger({ configs, gate, storageKb });

	it("lists every subscribed config and nothing else", () => {
		const ledger = atGate(2, [CONFIGS.freemium, CONFIGS.agentsMd]);
		expect(ledger.lines.map((line) => [line.id, line.kb])).toEqual([
			["freemium", 32],
		]);
		expect(ledger.totalKb).toBe(32);
	});

	it("charges nothing toward a missed attempt", () => {
		const ledger = atGate(2, [CONFIGS.freemium]);
		expect(ledger.totalKb).toBe(32);
		expect(ledger.onMissKb).toBe(0);
	});

	it("reports the shortfall when the balance cannot cover the bill", () => {
		expect(atGate(4, [CONFIGS.freemium], 100).shortfallKb).toBe(28);
	});

	it("reports no shortfall when the balance covers the bill exactly", () => {
		expect(atGate(2, [CONFIGS.freemium], 32).shortfallKb).toBe(0);
	});

	it("bills nothing for a build with no subscription at all", () => {
		const ledger = billLedger({
			configs: [CONFIGS.agentsMd],
			gate: 5,
			storageKb: 0,
		});
		expect(ledger.lines).toEqual([]);
		expect(ledger.totalKb).toBe(0);
		expect(ledger.shortfallKb).toBe(0);
	});
});
