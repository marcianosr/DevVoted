import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	CONFIG_UNLOCKS,
	type EarnedConfigUnlock,
} from "~/modules/run/config/domain/configUnlock.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	accountGrantsOf,
	objectiveGrantsFor,
} from "~/modules/run/run/domain/accountGrant.model";
import {
	answerWith,
	clearGate,
	failGate,
	started,
} from "~/modules/run/run/domain/run.factory";
import { createRun } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

const isEarned = (
	entry: [string, (typeof CONFIG_UNLOCKS)[string]]
): entry is [string, EarnedConfigUnlock] => entry[1].kind === "earned";

const earnedUnlock = (): [string, EarnedConfigUnlock] => {
	const entry = Object.entries(CONFIG_UNLOCKS).find(isEarned);
	if (!entry) throw new Error("no earned unlock in the roster");
	return entry;
};

describe("objectiveGrantsFor", () => {
	it("grants the config whose target the counts crossed, with its provenance", () => {
		const [configId, unlock] = earnedUnlock();
		const { metric, target } = unlock.objective;

		expect(
			objectiveGrantsFor([{ metric, count: target }]).configs
		).toContainEqual({ configId, viaMetric: metric });
	});

	it("grants a service off the same counts", () => {
		const grants = objectiveGrantsFor([{ metric: "rebuilds", count: 5 }]);

		expect(grants.services).toContainEqual({
			serviceId: "hotReload",
			viaMetric: "rebuilds",
		});
	});

	it("grants nothing while every count sits below its target", () => {
		expect(objectiveGrantsFor([{ metric: "rebuilds", count: 1 }])).toEqual({
			configs: [],
			services: [],
		});
	});
});

describe("accountGrantsOf", () => {
	const opening = started(["js"]);

	it("stamps a full gate's swatch and asks for titles on the close", () => {
		const cleared = clearGate(opening);
		const grants = accountGrantsOf(opening, cleared);

		expect(grants.swatchIds).toEqual([swatchForGate(0)?.id]);
		expect(grants.titlesDue).toBe(true);
	});

	it("stamps no swatch for a hold, but still asks for titles at the close", () => {
		const held = failGate(opening);
		const grants = accountGrantsOf(opening, held);

		expect(grants.swatchIds).toEqual([]);
		expect(grants.titlesDue).toBe(true);
	});

	it("asks for nothing while the window is still open", () => {
		const answered = answerWith(opening, true);

		expect(accountGrantsOf(opening, answered)).toMatchObject({
			swatchIds: [],
			firstInstalledConfigIds: [],
			pinnedGate: null,
			titlesDue: false,
		});
	});

	it("names the config the action put into the build as a first install", () => {
		const configuring = createRun([], [CONFIGS.js, CONFIGS.css]);
		const installed = runReducer(configuring, {
			type: "install",
			configId: "js",
		});

		expect(
			accountGrantsOf(configuring, installed).firstInstalledConfigIds
		).toEqual(["js"]);
	});

	it("raises the watermark only when the peak beat the previous one", () => {
		const before = { ...opening, peakStorageKb: 300 };

		expect(
			accountGrantsOf(before, { ...before, peakStorageKb: 400 })
				.storageWatermarkKb
		).toBe(400);
		expect(
			accountGrantsOf(before, { ...before, peakStorageKb: 300 })
				.storageWatermarkKb
		).toBeNull();
	});

	it("reports a fresh pin and ignores one that was already planted", () => {
		const planted = { ...opening, pinPlantedAtGate: 4 };

		expect(accountGrantsOf(opening, planted).pinnedGate).toBe(4);
		expect(accountGrantsOf(planted, planted).pinnedGate).toBeNull();
	});

	it("asks for titles when the run ends, whatever closed it", () => {
		const dead = { ...opening, status: "dead" as const };

		expect(accountGrantsOf(opening, dead).titlesDue).toBe(true);
		expect(SLICE_WINDOW).toBeGreaterThan(0);
	});
});
