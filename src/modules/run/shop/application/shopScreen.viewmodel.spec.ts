import { describe, expect, it, vi } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	buildChipFor,
	incidentDeskFor,
	shopHeaderFor,
	upgradeChipFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import { kantoIncidentDeal } from "~/test/kantoIncidentDesk.factory";
import { offeredRungOf } from "~/ui/kanto-theme/Upgrades.ui";

describe("upgradeChipFor (ADR-053, ADR-097)", () => {
	const deal = { priceKb: 32, affordable: true, onInstall: vi.fn() };
	const chip = upgradeChipFor({ ...CONFIGS.js, level: 3 }, 1, deal);

	it("wears the version held, the press stating the one on offer", () => {
		expect(chip.version).toBe(1);
		expect(offeredRungOf(chip.upgrades?.rungs ?? [])?.version).toBe(3);
	});

	it("states the odds the roll landed on, at rest beside the pennant", () => {
		expect(chip.detail).toBe("1 in 4 rolls");
	});

	it("offers the landed rung at the registry price", () => {
		const offered = chip.upgrades?.rungs.find(
			(rung) => rung.state === "offered"
		);

		expect(offered?.version).toBe(3);
		expect(offered?.price).toBe("32 KB");
	});

	it("sells through the install deal rather than the shop's Upgrade press", () => {
		chip.upgrades?.onBuy?.(3);

		expect(deal.onInstall).toHaveBeenCalledTimes(1);
	});

	it("dims a rolled upgrade the balance cannot cover, like any offer", () => {
		const broke = upgradeChipFor({ ...CONFIGS.js, level: 2 }, 1, {
			...deal,
			affordable: false,
		});

		expect(broke.skipped).toBe(true);
		expect(chip.skipped).toBe(false);
	});
});

describe("buildChipFor (ADR-097 decision 6)", () => {
	const deal = { storageKb: 512, coveragePct: 100 };

	it("sells an installed config its own next version", () => {
		const chip = buildChipFor(CONFIGS.mooresLaw, undefined, undefined, deal);
		const offered = chip.upgrades?.rungs.find(
			(rung) => rung.state === "offered"
		);

		expect(offered?.version).toBe(2);
		expect(offered?.price).toBe("64 KB");
	});

	it("offers nothing on a config that has no version ladder", () => {
		expect(
			buildChipFor(CONFIGS.codeCoverage, undefined, undefined, deal).upgrades
		).toBeUndefined();
	});

	it("offers nothing on a config already at its ceiling", () => {
		expect(
			buildChipFor(
				{ ...CONFIGS.telemetry, level: 2 },
				undefined,
				undefined,
				deal
			).upgrades
		).toBeUndefined();
	});

	it("carries no panel at all where no deal is on the table", () => {
		expect(buildChipFor(CONFIGS.mooresLaw).upgrades).toBeUndefined();
	});
});

describe("shopHeaderFor, previewing an install", () => {
	const CLEARED = 3;
	const BALANCE_KB = 410;

	it("leaves the balance alone when nothing is pointed at", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB);

		expect(header.funds?.kb).toBe(BALANCE_KB);
		expect(header.funds?.preview).toBeUndefined();
	});

	it("states what the pointed offer would leave behind", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB, [], 32);

		expect(header.funds?.preview).toEqual({
			label: "after install",
			figure: "378 KB",
			color: "vermillion",
		});
	});

	it("keeps the balance itself unchanged, so the preview cannot be mistaken for it", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB, [], 32);

		expect(header.funds?.kb).toBe(BALANCE_KB);
	});

	it("states no after for an offer the balance cannot cover", () => {
		const header = shopHeaderFor(CLEARED, 16, [], 64);

		expect(header.funds?.preview).toBeUndefined();
	});

	it("still states the after for an offer that spends the balance exactly", () => {
		const header = shopHeaderFor(CLEARED, 64, [], 64);

		expect(header.funds?.preview?.figure).toBe("0 B");
	});
});

describe("incidentDeskFor, the shop's incident on offer", () => {
	it("reads the offered audit at the gate it would land on", () => {
		const desk = incidentDeskFor(kantoIncidentDeal());

		expect(desk.audit.code).toBe(409);
		expect(desk.audit.name).toBe("Conflict");
	});

	it("states the rule the desk plays by", () => {
		expect(incidentDeskFor(kantoIncidentDeal()).rule).toBe(
			"hold 1 · targets your gate or ahead"
		);
	});

	it("offers a plain buy while the hand is empty", () => {
		const desk = incidentDeskFor(kantoIncidentDeal());

		expect(desk.buy.label).toBe("Buy");
		expect(desk.buy.onPress).toBeDefined();
		expect(desk.discards).toBeUndefined();
	});

	it("names what a replacement would throw away", () => {
		const desk = incidentDeskFor(kantoIncidentDeal({ heldAudit: "not-found" }));

		expect(desk.buy.label).toBe("Replace held");
		expect(desk.discards).toBe("Your held 404 Not Found will be discarded.");
	});

	it("refuses the buy when nobody could take it, before price is even asked", () => {
		const desk = incidentDeskFor(
			kantoIncidentDeal({ rivalsInReach: 0, balanceKb: 0 })
		);

		expect(desk.buy.onPress).toBeUndefined();
		expect(desk.buy.refusal).toBe("nobody in reach");
	});

	it("refuses the buy short, naming the gap", () => {
		const desk = incidentDeskFor(kantoIncidentDeal({ balanceKb: 8 }));

		expect(desk.buy.refusal).toBe("24 KB short");
	});

	it("closes both presses under a read-only shop", () => {
		const desk = incidentDeskFor(kantoIncidentDeal({ shopLocked: true }));

		expect(desk.buy.onPress).toBeUndefined();
		expect(desk.refresh?.onPress).toBeUndefined();
	});

	it("marks the rung the refresh price stands on", () => {
		const desk = incidentDeskFor(
			kantoIncidentDeal({ refreshes: 2, refreshCostKb: 32 })
		);

		expect(desk.refresh?.atRung).toBe(2);
		expect(desk.refresh?.price).toBe("32 KB");
	});

	it("holds at the last rung rather than pointing past the ladder", () => {
		const desk = incidentDeskFor(kantoIncidentDeal({ refreshes: 99 }));

		expect(desk.refresh?.atRung).toBe((desk.refresh?.rungs.length ?? 0) - 1);
	});
});
