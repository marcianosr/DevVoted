import { describe, expect, it } from "vitest";

import {
	percentOf,
	runShareOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { standingOf } from "~/modules/run/community/domain/standing.model";
import { baseGateLadderAt } from "~/modules/run/gate/domain/gate.model";

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

	it("reads no closed gate for a run that has closed none", () => {
		expect(standingOf(CLIMBER)).not.toHaveProperty("lastClose");
	});

	it("reads the last closed gate at the coverage it reached, past a full bar", () => {
		const ladder = { floor: 0, ok: 52, healthy: 64 };

		expect(
			standingOf({
				...CLIMBER,
				lastClose: {
					gate: 0,
					band: "perfect",
					cleared: true,
					held: 100,
					reached: 130,
					ladder,
				},
			}).lastClose
		).toEqual({ gate: 0, band: "perfect", held: 130, ladder });
	});

	it("reads an old close without reach or ladder at its held coverage on the base ladder", () => {
		expect(
			standingOf({
				...CLIMBER,
				lastClose: { gate: 2, band: "ok", cleared: true, held: 60 },
			}).lastClose
		).toEqual({ gate: 2, band: "ok", held: 60, ladder: baseGateLadderAt(2) });
	});
});
