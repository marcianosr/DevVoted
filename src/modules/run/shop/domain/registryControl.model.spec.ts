import { describe, expect, it } from "vitest";

import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	ABANDON_FROM_GATE,
	CASCADE_GATE,
	isServiceUnlocked,
	isSoldInShop,
	openingGateOf,
	REGISTRY_CONTROL_LIST,
	REGISTRY_CONTROLS,
	servicesUnlockedBy,
	unlockCaptionOf,
	type RegistryControlScope,
} from "~/modules/run/shop/domain/registryControl.model";

const ROW_CAPTION_LIMIT = 40;

const idsInScope = (scope: RegistryControlScope): readonly string[] =>
	REGISTRY_CONTROL_LIST.filter((control) => control.scope === scope).map(
		(control) => control.id
	);

describe("REGISTRY_CONTROLS", () => {
	it("puts the tag, Boot Cache and Docker Image in the run scope and the rest in the registry scope", () => {
		expect(idsInScope("run")).toEqual(["pin", "bootCache", "dockerImage"]);
		expect(idsInScope("registry")).toEqual([
			"rebuild",
			"extend",
			"hotReload",
			"returnPolicy",
			"abandon",
		]);
	});

	it("sells the registry services and the tag in the shop, the other two on the archive", () => {
		expect(
			REGISTRY_CONTROL_LIST.filter(isSoldInShop).map((control) => control.id)
		).toEqual([
			"rebuild",
			"extend",
			"hotReload",
			"returnPolicy",
			"abandon",
			"pin",
		]);
		expect(REGISTRY_CONTROLS.bootCache.soldIn).toBe("archive");
		expect(REGISTRY_CONTROLS.dockerImage.soldIn).toBe("archive");
	});

	it("lists the registry services before the run services, which is the Dex's order", () => {
		const scopes = REGISTRY_CONTROL_LIST.map((control) => control.scope);

		expect(scopes.indexOf("run")).toBe(scopes.lastIndexOf("registry") + 1);
	});

	it("opens every shop service on the first shop, except Extend and the tag", () => {
		expect(openingGateOf(REGISTRY_CONTROLS.rebuild)).toBe(0);
		expect(openingGateOf(REGISTRY_CONTROLS.hotReload)).toBe(0);
		expect(openingGateOf(REGISTRY_CONTROLS.returnPolicy)).toBe(0);
		expect(openingGateOf(REGISTRY_CONTROLS.abandon)).toBe(0);
		expect(openingGateOf(REGISTRY_CONTROLS.extend)).toBe(2);
		expect(openingGateOf(REGISTRY_CONTROLS.pin)).toBe(3);
	});

	it("hands Rebuild to every account as a starter, with no line to earn it", () => {
		expect(REGISTRY_CONTROLS.rebuild.unlock.kind).toBe("starter");
		expect(unlockCaptionOf(REGISTRY_CONTROLS.rebuild)).toBeUndefined();
		expect(isServiceUnlocked(REGISTRY_CONTROLS.rebuild, [])).toBe(true);
	});

	it("earns Extend by reaching Cascade, which is the gate the caption names", () => {
		expect(gateSwatchAt(CASCADE_GATE)?.gateName).toBe("Cascade");
		expect(REGISTRY_CONTROLS.extend.unlock).toMatchObject({
			kind: "earned",
			objective: { metric: `reached-gate:${CASCADE_GATE}`, target: 1 },
		});
		expect(unlockCaptionOf(REGISTRY_CONTROLS.extend)).toBe("Reach Cascade");
	});

	it("earns the git tag by reaching the gate that first sells it", () => {
		expect(REGISTRY_CONTROLS.pin.unlock).toMatchObject({
			objective: {
				metric: `reached-gate:${REGISTRY_CONTROLS.pin.opensAfterGates}`,
			},
		});
		expect(unlockCaptionOf(REGISTRY_CONTROLS.pin)).toBe("Reach gate 4");
	});

	it("earns kill -9 by clearing gate 5, which is standing at gate 6", () => {
		expect(ABANDON_FROM_GATE).toBe(6);
		expect(REGISTRY_CONTROLS.abandon.unlock).toMatchObject({
			objective: { metric: "reached-gate:6", target: 1 },
		});
		expect(unlockCaptionOf(REGISTRY_CONTROLS.abandon)).toBe("Clear gate 5");
	});

	it("earns Hot Reload and Return Policy off counters the ledger already keeps", () => {
		expect(REGISTRY_CONTROLS.hotReload.unlock).toMatchObject({
			objective: { metric: "rebuilds", target: 5 },
		});
		expect(REGISTRY_CONTROLS.returnPolicy.unlock).toMatchObject({
			objective: { metric: "configs-sold", target: 5 },
		});
	});

	it("earns Boot Cache and Docker Image off one-shot run-end counters", () => {
		expect(REGISTRY_CONTROLS.bootCache.unlock).toMatchObject({
			objective: { metric: "banked-256-one-run", target: 1 },
		});
		expect(unlockCaptionOf(REGISTRY_CONTROLS.bootCache)).toBe(
			"Bank 256 KB in one run"
		);
		expect(REGISTRY_CONTROLS.dockerImage.unlock).toMatchObject({
			objective: { metric: "finished-holding-a-dealt-config", target: 1 },
		});
	});

	it("keeps every caption short enough for the slot a price takes", () => {
		for (const control of REGISTRY_CONTROL_LIST) {
			const caption = unlockCaptionOf(control);
			if (caption !== undefined)
				expect(caption.length).toBeLessThanOrEqual(ROW_CAPTION_LIMIT);
		}
	});

	it("reads an earned service off the account's grant ledger", () => {
		expect(isServiceUnlocked(REGISTRY_CONTROLS.extend, [])).toBe(false);
		expect(isServiceUnlocked(REGISTRY_CONTROLS.extend, ["extend"])).toBe(true);
	});
});

describe("servicesUnlockedBy", () => {
	it("grants the service whose gate the counts say was reached, with its metric", () => {
		expect(
			servicesUnlockedBy([{ metric: "reached-gate:2", count: 1 }])
		).toEqual([{ serviceId: "extend", viaMetric: "reached-gate:2" }]);
	});

	it("grants nothing off counts that reach no service's target", () => {
		expect(
			servicesUnlockedBy([
				{ metric: "reached-gate:1", count: 3 },
				{ metric: "gates-cleared", count: 40 },
				{ metric: "rebuilds", count: 4 },
			])
		).toEqual([]);
	});

	it("grants Hot Reload on the fifth rebuild and kill -9 on reaching gate 6", () => {
		expect(
			servicesUnlockedBy([
				{ metric: "rebuilds", count: 5 },
				{ metric: "reached-gate:6", count: 1 },
			]).map((grant) => grant.serviceId)
		).toEqual(["hotReload", "abandon"]);
	});

	it("grants Boot Cache the moment its one-shot counter exists", () => {
		expect(
			servicesUnlockedBy([{ metric: "banked-256-one-run", count: 1 }])
		).toEqual([{ serviceId: "bootCache", viaMetric: "banked-256-one-run" }]);
	});

	it("never grants a starter service, which has no row to write", () => {
		const granted = servicesUnlockedBy([
			{ metric: "reached-gate:2", count: 1 },
			{ metric: "reached-gate:4", count: 1 },
		]).map((grant) => grant.serviceId);

		expect(granted).toEqual(["extend", "pin"]);
	});
});
