import { describe, expect, it } from "vitest";

import {
	percentOf,
	runShareOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { standingOf } from "~/modules/run/community/domain/standing.model";

const CLIMBER = {
	gate: 6,
	coverageUnits: 20,
	streak: 7,
	storageKb: 4_300,
	build: { configs: [] },
};

describe("standingOf", () => {
	it("states the gate, streak, storage and build an open run carries", () => {
		expect(standingOf(CLIMBER)).toMatchObject({
			gate: 6,
			streak: 7,
			storageKb: 4_300,
			build: { configs: [] },
		});
	});

	it("turns banked units into the rounded share of the run's demand", () => {
		expect(standingOf(CLIMBER).coveragePercent).toBe(
			Math.round(percentOf(runShareOf(20, 6)))
		);
	});

	it("carries the category the player answers best", () => {
		expect(standingOf(CLIMBER, "css").bestCategory).toBe("css");
	});

	it("names no best category for a player without one", () => {
		expect(standingOf(CLIMBER)).not.toHaveProperty("bestCategory");
	});
});
