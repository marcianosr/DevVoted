import { describe, expect, it } from "vitest";

import {
	deepestGateIn,
	runHistory,
	type RunHistoryRow,
} from "./runHistory.model";

const row = (overrides: Partial<RunHistoryRow> = {}): RunHistoryRow => ({
	runId: 1,
	gatesCleared: 4,
	engineStatus: "dead",
	coverage: 14,
	startedAt: new Date("2026-09-11T10:00:00Z"),
	finishedAt: new Date("2026-09-11T12:00:00Z"),
	swatchGates: [0, 1, 2],
	...overrides,
});

describe("runHistory", () => {
	it("drops a climb still under way, which has no closing band to read", () => {
		expect(runHistory([row({ engineStatus: "answering" })])).toHaveLength(0);
		expect(runHistory([row({ engineStatus: "configuring" })])).toHaveLength(0);
	});

	it("keeps runs that ended, won or dead", () => {
		const entries = runHistory([
			row({ runId: 1, engineStatus: "dead" }),
			row({ runId: 2, engineStatus: "won" }),
		]);

		expect(entries.map((entry) => entry.runId)).toEqual([1, 2]);
	});

	it("reads coverage as a share of the slots the run opened, not as raw units", () => {
		const [entry] = runHistory([row({ coverage: 14, gatesCleared: 4 })]);

		expect(entry.coverage).toBeCloseTo(0.56);
	});

	it("bands the reading, so units are never mistaken for a percentage", () => {
		const [entry] = runHistory([row({ coverage: 16, gatesCleared: 4 })]);

		expect(entry.band).toBe("healthy");
	});

	it("bands a genuinely thin run as danger", () => {
		const [entry] = runHistory([row({ coverage: 4, gatesCleared: 4 })]);

		expect(entry.band).toBe("danger");
	});

	it("names the gate that held the run", () => {
		const [entry] = runHistory([row({ gatesCleared: 4 })]);

		expect(entry.heldBy).toBe("Lavender");
	});

	it("names no gate for a victory", () => {
		const [entry] = runHistory([
			row({ engineStatus: "won", gatesCleared: 12 }),
		]);

		expect(entry.won).toBe(true);
		expect(entry.heldBy).toBeNull();
	});

	it("falls back to the start when a run recorded no finish", () => {
		const [entry] = runHistory([row({ finishedAt: null })]);

		expect(entry.endedAt).toEqual(new Date("2026-09-11T10:00:00Z"));
	});

	it("treats a missing swatch roster as none earned", () => {
		const [entry] = runHistory([row({ swatchGates: null })]);

		expect(entry.swatchGates).toEqual([]);
	});
});

describe("deepestGateIn", () => {
	it("reports the furthest gate any run reached", () => {
		const entries = runHistory([
			row({ runId: 1, gatesCleared: 2 }),
			row({ runId: 2, gatesCleared: 9 }),
			row({ runId: 3, gatesCleared: 5 }),
		]);

		expect(deepestGateIn(entries)).toBe(9);
	});

	it("reports zero when nothing has been climbed", () => {
		expect(deepestGateIn([])).toBe(0);
	});
});
