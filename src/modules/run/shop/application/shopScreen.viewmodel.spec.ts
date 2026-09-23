import { describe, expect, it, vi } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { upgradeChipFor } from "~/modules/run/shop/application/shopScreen.viewmodel";

describe("upgradeChipFor (ADR-053, ADR-097)", () => {
	const deal = { priceKb: 32, affordable: true, onInstall: vi.fn() };
	const chip = upgradeChipFor({ ...CONFIGS.js, level: 3 }, 1, deal);

	it("wears the version on offer, not the one held", () => {
		expect(chip.version).toBe(3);
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
