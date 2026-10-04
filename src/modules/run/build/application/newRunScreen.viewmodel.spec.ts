import { describe, expect, it, vi } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	CONFIG_GROUP_LABELS,
	EMPTY_WARM_BOOT_DRAFT,
	type HandCard,
	bootedPanelFor,
	CARRIED_NOTE,
	draftPickOf,
	newRunFooterFor,
	newRunGroupsFor,
	newRunHeaderFor,
	newRunFilterFor,
	newRunRegistryFor,
	type WarmBootDeal,
	warmBootPanelFor,
	warmBootSpendOf,
	WARM_BOOT_NOTE,
} from "~/modules/run/build/application/newRunScreen.viewmodel";

const noop = () => {};

const dealt = (...configs: readonly Config[]): readonly HandCard[] =>
	configs.map((config) => ({
		config,
		held: false,
		fits: true,
		onPress: noop,
	}));

const MIXED = dealt(
	CONFIGS.ts,
	CONFIGS.unitTests,
	CONFIGS.linter,
	CONFIGS.codeCoverage,
	CONFIGS.strict,
	CONFIGS.dependabot
);

describe("newRunHeaderFor", () => {
	it("reads New run over a line of subtext", () => {
		const header = newRunHeaderFor(320);

		expect(header.title).toBe("New run");
		expect(header.subtitle).toBe("Shades of your career await!");
	});
});

describe("newRunGroupsFor", () => {
	it("reads the groups in their teaching order, not in the order dealt", () => {
		expect(newRunGroupsFor(MIXED).map((group) => group.id)).toEqual([
			"coverage",
			"storage",
			"answerHelp",
			"risk",
			"misc",
		]);
	});

	it("shows each hand card's install press while the card is folded", () => {
		const offers = newRunGroupsFor(MIXED).flatMap((group) => group.offers);

		expect(offers.every((offer) => offer.installWhenFolded === true)).toBe(
			true
		);
	});

	it("leaves out a group the hand has nothing for", () => {
		const groups = newRunGroupsFor(dealt(CONFIGS.ts, CONFIGS.unitTests));

		expect(groups.map((group) => group.id)).toEqual(["coverage", "storage"]);
	});

	it("names each group for the player rather than by its key", () => {
		expect(newRunGroupsFor(MIXED).map((group) => group.label)).toEqual([
			CONFIG_GROUP_LABELS.coverage,
			CONFIG_GROUP_LABELS.storage,
			CONFIG_GROUP_LABELS.answerHelp,
			CONFIG_GROUP_LABELS.risk,
			CONFIG_GROUP_LABELS.misc,
		]);
	});

	it("deals every card exactly once across the groups", () => {
		const names = newRunGroupsFor(MIXED).flatMap((group) =>
			group.offers.map((offer) => offer.name)
		);

		expect(names).toHaveLength(MIXED.length);
		expect(new Set(names).size).toBe(MIXED.length);
	});

	it("carries the press each card was dealt with", async () => {
		const onPress = vi.fn();
		const groups = newRunGroupsFor([
			{ config: CONFIGS.ts, held: false, fits: true, onPress },
		]);

		groups[0].offers[0].install?.onPress?.();
		expect(onPress).toHaveBeenCalled();
	});
});

describe("newRunRegistryFor", () => {
	it("offers the whole hand when no group is picked", () => {
		const registry = newRunRegistryFor(newRunGroupsFor(MIXED));

		expect(registry.offers).toHaveLength(MIXED.length);
		expect(registry.groups).toHaveLength(5);
	});

	it("cuts the offers and the groups to the picked one together", () => {
		const registry = newRunRegistryFor(newRunGroupsFor(MIXED), "storage");

		expect(registry.groups).toHaveLength(1);
		expect(registry.offers).toHaveLength(1);
		expect(registry.offers[0].name).toBe(CONFIGS.unitTests.label);
	});

	it("prices the deal free, since a new run bills nothing", () => {
		expect(newRunRegistryFor(newRunGroupsFor(MIXED)).slotPrice).toBe("free");
	});
});

describe("newRunFilterFor", () => {
	it("leads with every group, counting the whole deal", () => {
		const filter = newRunFilterFor(newRunGroupsFor(MIXED), undefined, noop);

		expect(filter?.items[0]).toEqual({
			value: "all",
			label: "All",
			count: MIXED.length,
		});
		expect(filter?.value).toBe("all");
	});

	it("counts every group, so a cut list never rewrites the filter", () => {
		const groups = newRunGroupsFor(MIXED);
		const filter = newRunFilterFor(groups, "storage", noop);

		expect(filter?.items).toHaveLength(groups.length + 1);
		expect(filter?.value).toBe("storage");
	});

	it("counts the cards each group holds", () => {
		const filter = newRunFilterFor(newRunGroupsFor(MIXED), undefined, noop);

		expect(filter?.items.find((item) => item.value === "coverage")?.count).toBe(2);
		expect(filter?.items.find((item) => item.value === "risk")?.count).toBe(1);
	});

	it("picks no group when every group is selected", () => {
		const onPick = vi.fn();
		newRunFilterFor(newRunGroupsFor(MIXED), "storage", onPick)?.onSelect("all");

		expect(onPick).toHaveBeenCalledWith(undefined);
	});

	it("offers nothing to choose between when the hand is all one group", () => {
		const groups = newRunGroupsFor(dealt(CONFIGS.ts, CONFIGS.js));

		expect(newRunFilterFor(groups, undefined, noop)).toBeUndefined();
	});
});

describe("the warm boot panel (ADR-153)", () => {
	const EVERYTHING = ["bootCache", "extend", "pin"];

	const dealFor = (over: Partial<WarmBootDeal> = {}): WarmBootDeal => ({
		archiveKb: 512,
		unlockedServiceIds: EVERYTHING,
		draft: EMPTY_WARM_BOOT_DRAFT,
		onPickRung: noop,
		onToggleService: noop,
		...over,
	});

	const panelOf = (over: Partial<WarmBootDeal> = {}) => {
		const panel = warmBootPanelFor(dealFor(over));
		if (panel === undefined) throw new Error("no warm boot panel drawn");
		return panel;
	};

	const rowsOf = (over: Partial<WarmBootDeal> = {}) => panelOf(over).rows;

	const checkedOf = (over: Partial<WarmBootDeal> = {}) =>
		rowsOf(over)
			.filter((row) => row.pick?.checked === true)
			.map((row) => row.id);

	it("lists the three rungs first, then every carried service, each with a pick", () => {
		expect(rowsOf().map((row) => row.id)).toEqual([
			"bootCache-0",
			"bootCache-1",
			"bootCache-2",
			"extend",
			"pin",
		]);
		expect(rowsOf().every((row) => row.pick !== undefined)).toBe(true);
	});

	it("titles a rung by the storage it banks and prices it by the archive it costs", () => {
		const rung = rowsOf()[1];

		expect(rung.title).toBe("Boot Cache · 128 KB");
		expect(rung.locked !== true && rung.carried !== false && rung.price).toBe(
			"256 KB"
		);
	});

	it("keeps one rung at a time: picking another moves the tick", () => {
		expect(checkedOf({ draft: { rung: 1, serviceIds: [] } })).toEqual([
			"bootCache-1",
		]);
	});

	it("clears a rung when its own pick is pressed again", () => {
		const onPickRung = vi.fn();
		rowsOf({ draft: { rung: 1, serviceIds: [] }, onPickRung })[1].pick?.onToggle();

		expect(onPickRung).toHaveBeenCalledWith(null);
	});

	it("refuses a row the archive left after the draft cannot cover, and disables its pick", () => {
		const rows = rowsOf({ archiveKb: 100 });
		const rung = rows[0];

		expect(rung.refusal).toBe("28 KB short");
		expect(rung.pick?.disabled).toBe(true);
		expect(rows[3].refusal).toBeUndefined();
	});

	it("measures a rung against the archive with the picked rung handed back, so switching rungs is never refused by the pick itself", () => {
		const rows = rowsOf({ archiveKb: 300, draft: { rung: 1, serviceIds: [] } });

		expect(rows[0].refusal).toBeUndefined();
		expect(rows[2].refusal).toBe("212 KB short");
		expect(rows[3].refusal).toBe("20 KB short");
	});

	it("never refuses a row already picked", () => {
		const rows = rowsOf({ archiveKb: 130, draft: { rung: 0, serviceIds: [] } });

		expect(rows[0].refusal).toBeUndefined();
		expect(rows[0].pick?.disabled).toBe(false);
	});

	it("leaves a locked service out, listing only what the player can carry", () => {
		expect(
			rowsOf({ unlockedServiceIds: ["extend"] }).map((row) => row.id)
		).toEqual(["extend"]);
	});

	it("draws no panel when nothing is unlocked", () => {
		expect(warmBootPanelFor(dealFor({ unlockedServiceIds: [] }))).toBeUndefined();
	});

	it("heads with the archive alone, then with the balance after the draft", () => {
		expect(panelOf().meta).toBe("512 KB archived");
		expect(
			panelOf({ draft: { rung: 1, serviceIds: ["pin"] } }).meta
		).toBe("512 KB archived · 128 KB after");
	});

	it("turns the draft into the pick the server takes", () => {
		expect(draftPickOf({ rung: 2, serviceIds: ["extend"] })).toEqual({
			bootCacheRung: 2,
			serviceIds: ["extend"],
		});
		expect(draftPickOf(EMPTY_WARM_BOOT_DRAFT)).toEqual({ serviceIds: [] });
	});

	it("states what a draft spends, and nothing for an empty one", () => {
		expect(warmBootSpendOf({ rung: 1, serviceIds: ["pin"] })).toBe("384 KB");
		expect(warmBootSpendOf(EMPTY_WARM_BOOT_DRAFT)).toBeUndefined();
	});

	it("reads back a booted run without picks, stating what was spent", () => {
		const panel = bootedPanelFor(
			{ storageKb: 128, serviceIds: ["pin"], archiveBytes: 393216 },
			128
		);

		expect(panel.rows.map((row) => row.title)).toEqual([
			"Boot Cache · 128 KB banked",
			"git tag",
		]);
		expect(panel.rows.every((row) => row.pick === undefined)).toBe(true);
		expect(panel.meta).toBe("spent 384 KB · 128 KB archived");
	});

	it("says a carried service is bought in the run's own shop", () => {
		const panel = bootedPanelFor(
			{ storageKb: 0, serviceIds: ["extend", "pin"], archiveBytes: 196608 },
			0
		);

		expect(panel.note).toBe(CARRIED_NOTE);
	});

	it("quotes no archive price on a carried service, because the shop sells it", () => {
		const panel = bootedPanelFor(
			{ storageKb: 0, serviceIds: ["extend", "pin"], archiveBytes: 196608 },
			0
		);

		expect(panel.rows.some((row) => "price" in row)).toBe(false);
	});

	it("adds no note to a boot that only banked storage", () => {
		expect(
			bootedPanelFor({ storageKb: 64, serviceIds: [], archiveBytes: 131072 }, 0)
				.note
		).toBeUndefined();
	});

	it("tells the player before the start that a carried service is sold in the run", () => {
		expect(WARM_BOOT_NOTE).toContain("this run's shop");
	});

	it("lists no rung row for a boot that carried services only", () => {
		expect(
			bootedPanelFor(
				{ storageKb: 0, serviceIds: ["extend"], archiveBytes: 65536 },
				0
			).rows.map((row) => row.id)
		).toEqual(["extend"]);
	});
});

describe("newRunFooterFor with a spend (ADR-153)", () => {
	it("keeps the gate-prep label and appends what the press spends, in the commit tone", () => {
		const footer = newRunFooterFor(noop, undefined, undefined, "384 KB");

		expect(footer.action.label).toBe("Pallet gate prep · 384 KB archive");
		expect(footer.action.tone).toBe("commit");
	});

	it("stays a plain press with nothing to spend", () => {
		const footer = newRunFooterFor(noop);

		expect(footer.action.label).toBe("Pallet gate prep");
		expect(footer.action.tone).toBeUndefined();
	});
});
