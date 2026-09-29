import { describe, expect, it, vi } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	CONFIG_GROUP_LABELS,
	type HandCard,
	newRunGroupsFor,
	newRunHelpFor,
	newRunRegistryFor,
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
	CONFIGS.eslint,
	CONFIGS.codeCoverage,
	CONFIGS.strict,
	CONFIGS.dependabot
);

const handlers = { onPick: noop, onHide: noop };

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

describe("newRunHelpFor", () => {
	it("counts every group, so a cut list never rewrites the chips", () => {
		const groups = newRunGroupsFor(MIXED);
		const help = newRunHelpFor(groups, "storage", handlers);

		expect(help?.chips).toHaveLength(groups.length);
		expect(help?.pickedId).toBe("storage");
	});

	it("counts the cards each group holds", () => {
		const help = newRunHelpFor(newRunGroupsFor(MIXED), undefined, handlers);

		expect(help?.chips.find((chip) => chip.id === "coverage")?.count).toBe(2);
		expect(help?.chips.find((chip) => chip.id === "risk")?.count).toBe(1);
	});

	it("offers nothing to choose between when the hand is all one group", () => {
		const groups = newRunGroupsFor(dealt(CONFIGS.ts, CONFIGS.js));

		expect(newRunHelpFor(groups, undefined, handlers)).toBeUndefined();
	});
});
