import { describe, expect, it, vi } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { sellRefund } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { nextUpgradeCostOf } from "~/modules/run/config/application/configChip.viewmodel";
import { sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import {
	buildChipFor,
	incidentDeskFor,
	shopHeaderFor,
	upgradeChipFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import { kbLabel } from "~/shared/lib/storage";
import { kantoIncidentDeal } from "~/test/kantoIncidentDesk.factory";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
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

	it("points at the rolled upgrade's price, which the registry never priced before", () => {
		const onPoint = vi.fn();
		const pointed = upgradeChipFor({ ...CONFIGS.js, level: 3 }, 1, {
			...deal,
			onPoint,
		});

		pointed.onQuote?.("upgrade");

		expect(onPoint).toHaveBeenCalledWith({
			label: "after upgrade",
			deltaKb: -32,
		});
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
	const alone = (config: Config) => ({ installed: [config], deal });

	it("sells an installed config its own next version", () => {
		const chip = buildChipFor(CONFIGS.mooresLaw, alone(CONFIGS.mooresLaw));
		const offered = chip.upgrades?.rungs.find(
			(rung) => rung.state === "offered"
		);

		expect(offered?.version).toBe(2);
		expect(offered?.price).toBe("64 KB");
	});

	it("offers nothing on a config that has no version ladder", () => {
		expect(
			buildChipFor(CONFIGS.agentsMd, alone(CONFIGS.agentsMd)).upgrades
		).toBeUndefined();
	});

	it("offers nothing on a config already at its ceiling", () => {
		const capped = { ...CONFIGS.telemetry, level: 2 };

		expect(buildChipFor(capped, alone(capped)).upgrades).toBeUndefined();
	});

	it("carries no panel at all where no deal is on the table", () => {
		expect(
			buildChipFor(CONFIGS.mooresLaw, { installed: [CONFIGS.mooresLaw] })
				.upgrades
		).toBeUndefined();
	});
});

describe("buildChipFor, quoting the refund the run actually pays", () => {
	const refundOf = (chip: ConfigChipProps) => chip.info?.sellPrice;

	it("quotes half the draft cost for a build with nothing discounting it", () => {
		const chip = buildChipFor(CONFIGS.codeCoverage, {
			installed: [CONFIGS.codeCoverage],
		});

		expect(refundOf(chip)).toBe(kbLabel(sellRefund(CONFIGS.codeCoverage)));
	});

	it("halves the quote again where Freemium discounts what a draft costs", () => {
		const installed = [CONFIGS.codeCoverage, CONFIGS.freemium];
		const chip = buildChipFor(CONFIGS.codeCoverage, { installed });

		expect(sellRefundIn(installed, CONFIGS.codeCoverage)).toBe(
			sellRefund(CONFIGS.codeCoverage) / 2
		);
		expect(refundOf(chip)).toBe(
			kbLabel(sellRefundIn(installed, CONFIGS.codeCoverage))
		);
	});

	it("quotes nothing at all where WTFPL means nothing sells back", () => {
		const installed = [CONFIGS.codeCoverage, CONFIGS.wtfpl];

		expect(sellRefundIn(installed, CONFIGS.codeCoverage)).toBe(0);
		expect(refundOf(buildChipFor(CONFIGS.codeCoverage, { installed }))).toBe(
			undefined
		);
	});

	it("points at no refund it does not quote", () => {
		const onPoint = vi.fn();
		const chip = buildChipFor(CONFIGS.codeCoverage, {
			installed: [CONFIGS.codeCoverage, CONFIGS.wtfpl],
			onPoint,
		});

		chip.onQuote?.("uninstall");

		expect(onPoint).toHaveBeenCalledWith();
	});

	it("points at the refund as a gain, and the upgrade as a spend", () => {
		const onPoint = vi.fn();
		const chip = buildChipFor(CONFIGS.mooresLaw, {
			installed: [CONFIGS.mooresLaw],
			onPoint,
		});

		chip.onQuote?.("uninstall");
		chip.onQuote?.("upgrade");

		expect(onPoint).toHaveBeenNthCalledWith(1, {
			label: "after uninstall",
			deltaKb: sellRefund(CONFIGS.mooresLaw),
		});
		expect(onPoint).toHaveBeenNthCalledWith(2, {
			label: "after upgrade",
			deltaKb: -nextUpgradeCostOf(CONFIGS.mooresLaw),
		});
	});
});

describe("shopHeaderFor, previewing what a price would leave", () => {
	const CLEARED = 3;
	const BALANCE_KB = 410;
	const spending = (deltaKb: number) => ({
		label: "after install",
		deltaKb: -deltaKb,
	});

	it("leaves the balance alone when nothing is pointed at", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB);

		expect(header.funds?.kb).toBe(BALANCE_KB);
		expect(header.funds?.preview).toBeUndefined();
	});

	it("states what the pointed offer would leave behind", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB, [], spending(32));

		expect(header.funds?.preview).toEqual({
			label: "after install",
			figure: "378 KB",
			color: "vermillion",
		});
	});

	it("keeps the balance itself unchanged, so the preview cannot be mistaken for it", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB, [], spending(32));

		expect(header.funds?.kb).toBe(BALANCE_KB);
	});

	it("states no after for an offer the balance cannot cover", () => {
		const header = shopHeaderFor(CLEARED, 16, [], spending(64));

		expect(header.funds?.preview).toBeUndefined();
	});

	it("still states the after for an offer that spends the balance exactly", () => {
		const header = shopHeaderFor(CLEARED, 64, [], spending(64));

		expect(header.funds?.preview?.figure).toBe("0 B");
	});

	it("counts a refund up rather than down, and tints it as a gain", () => {
		const header = shopHeaderFor(CLEARED, BALANCE_KB, [], {
			label: "after uninstall",
			deltaKb: 32,
		});

		expect(header.funds?.preview).toEqual({
			label: "after uninstall",
			figure: "442 KB",
			color: "viridian",
		});
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
