import { describe, expect, it, vi } from "vitest";

import {
	pollNoteFor,
	registryUpgradesFor,
	rollOddsLabel,
} from "~/modules/run/config/application/configChip.viewmodel";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { SkipReason } from "~/modules/run/config/domain/effect.model";

const skipped = (why: SkipReason) => pollNoteFor({ kind: "skipped", why });

describe("pollNoteFor — a config that is doing something", () => {
	it("badges a multiplier as the factor it is applying here", () => {
		expect(
			pollNoteFor({ kind: "online", coverage: { mult: 1.25, add: 0 } })
		).toEqual({ badge: { label: "×1.25 here", color: "viridian" } });
	});

	it("badges a flat adder as the units it is contributing here", () => {
		expect(
			pollNoteFor({ kind: "online", coverage: { mult: 1, add: 0.1 } })
		).toEqual({ badge: { label: "+0.1 here", color: "viridian" } });
	});

	it("states both when a config multiplies and adds on the same answer", () => {
		expect(
			pollNoteFor({ kind: "online", coverage: { mult: 2, add: 0.25 } })
		).toEqual({ badge: { label: "×2 +0.25 here", color: "viridian" } });
	});

	it("badges a throttle in the red it costs", () => {
		expect(
			pollNoteFor({ kind: "online", coverage: { mult: 0.5, add: 0 } })
		).toEqual({ badge: { label: "×0.5 here", color: "cinnabar" } });
	});

	it("says nothing for a config online for a reason other than coverage", () => {
		expect(pollNoteFor({ kind: "online" })).toEqual({});
	});
});

describe("pollNoteFor — a config counting down to something", () => {
	it("counts the answers left before the free upgrade lands", () => {
		expect(pollNoteFor({ kind: "online", bumpIn: 2 })).toEqual({
			badge: { label: "bump in 2", color: "vermillion" },
		});
	});

	it("still says one on the answer that will pay it", () => {
		expect(pollNoteFor({ kind: "online", bumpIn: 1 })).toEqual({
			badge: { label: "bump in 1", color: "vermillion" },
		});
	});

	it("leads with the coverage a counting config would also pay", () => {
		expect(
			pollNoteFor({ kind: "online", coverage: { mult: 2, add: 0 }, bumpIn: 3 })
		).toEqual({ badge: { label: "×2 here", color: "viridian" } });
	});
});

describe("pollNoteFor — a config sitting this poll out", () => {
	it("names the categories a category-bound config waits for", () => {
		expect(
			skipped({ kind: "otherCategories", categories: ["js", "ts"] })
		).toEqual({ detail: "JS or TS only" });
	});

	it("falls back to a bare idle note when no category is named", () => {
		expect(skipped({ kind: "otherCategories", categories: [] })).toEqual({
			detail: "idle this poll",
		});
	});

	it("gives every skip reason its own words", () => {
		const reasons: readonly SkipReason[] = [
			{ kind: "openerOnly" },
			{ kind: "cacheCold" },
			{ kind: "paysAtGateClear" },
			{ kind: "paysOnPeel" },
			{ kind: "billsAtGateClear" },
			{ kind: "inShop" },
			{ kind: "inPrep" },
			{ kind: "noAuditToSuppress" },
			{ kind: "runCapReached" },
			{ kind: "notThisPoll" },
		];
		const words = reasons.map((why) => skipped(why).detail);

		expect(words.filter(Boolean)).toHaveLength(reasons.length);
		expect(new Set(words).size).toBe(reasons.length);
	});
});

describe("pollNoteFor — states with their own treatment", () => {
	it("leaves an audited config alone, since the skipped fold already names it", () => {
		expect(pollNoteFor({ kind: "offline", audit: "429" })).toEqual({});
	});

	it("says nothing when an audit has hidden the category", () => {
		expect(pollNoteFor({ kind: "unknown" })).toEqual({});
	});

	it("says nothing when the poll has no status for the config", () => {
		expect(pollNoteFor(undefined)).toEqual({});
	});
});

describe("rollOddsLabel", () => {
	it("reads a share as one in so many rolls", () => {
		expect(rollOddsLabel(1 / 2)).toBe("1 in 2 rolls");
		expect(rollOddsLabel(1 / 8)).toBe("1 in 8 rolls");
	});

	it("calls a certainty every roll rather than one in one", () => {
		expect(rollOddsLabel(1)).toBe("every roll");
	});
});

describe("registryUpgradesFor (ADR-097)", () => {
	const deal = { price: "32 KB", affordable: true };
	const jump = registryUpgradesFor({ ...CONFIGS.js, level: 3 }, 1, deal);
	const stateOf = (version: number) =>
		jump.rungs.find((rung) => rung.version === version)?.state;

	it("marks the held rung, skips the rungs the roll leapt, and offers the landed one", () => {
		expect(jump.rungs.find((rung) => rung.held)?.version).toBe(1);
		expect(stateOf(1)).toBe("owned");
		expect(stateOf(2)).toBe("future");
		expect(stateOf(3)).toBe("offered");
		expect(stateOf(4)).toBe("future");
	});

	it("prices only the offered rung, at the registry price", () => {
		expect(jump.rungs.map((rung) => rung.price)).toEqual([
			undefined,
			undefined,
			"32 KB",
			undefined,
			undefined,
		]);
	});

	it("totals no press ladder, since the registry sells one rung and nothing after", () => {
		expect(jump.toMax).toBeUndefined();
	});

	it("disables the offer the balance cannot cover and nothing else", () => {
		const broke = registryUpgradesFor({ ...CONFIGS.js, level: 3 }, 1, {
			...deal,
			affordable: false,
		});

		expect(broke.rungs.map((rung) => rung.disabled)).toEqual([
			undefined,
			undefined,
			true,
			undefined,
			undefined,
		]);
	});

	it("routes the buy press to the deal", () => {
		const onBuy = vi.fn();
		const offered = registryUpgradesFor({ ...CONFIGS.js, level: 2 }, 1, {
			...deal,
			onBuy,
		});

		offered.onBuy?.(2);

		expect(onBuy).toHaveBeenCalledTimes(1);
	});
});
