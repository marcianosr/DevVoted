import { describe, expect, it } from "vitest";

import {
	accuracyTrackOf,
	landedAccuracyTrackFor,
} from "~/modules/run/run/application/accuracyTrack.viewmodel";

describe("accuracyTrackOf", () => {
	it("spans a quarter from ×1.00 at the first gate, ticked every ×0.05", () => {
		const track = accuracyTrackOf({ live: 1.016, best: 1.08, carried: 0 });

		expect(track.ticks.map((tick) => tick.label)).toEqual([
			"×1.00",
			"×1.05",
			"×1.10",
			"×1.15",
			"×1.20",
			undefined,
		]);
		expect(track.ticks.map((tick) => tick.share)).toEqual([
			0, 0.2, 0.4, 0.6, 0.8, 1,
		]);
	});

	it("fills to the live bonus and hatches on to the gate's cap", () => {
		const track = accuracyTrackOf({ live: 1.13, best: 1.18, carried: 0.1 });

		expect(track.bonus).toBeCloseTo(0.12);
		expect(track.cap).toBeCloseTo(0.32);
	});

	it("moves the window with the bonus the run carries", () => {
		const track = accuracyTrackOf({ live: 1.9, best: 1.95, carried: 0.87 });

		expect(track.ticks[0]?.label).toBe("×1.85");
		expect(track.ticks.at(-2)?.label).toBe("×2.05");
	});

	it("reads the live bonus as its figure and names the cap for a screen reader", () => {
		const track = accuracyTrackOf({ live: 1.13, best: 1.18, carried: 0.1 });

		expect(track.figure).toBe("×1.13");
		expect(track.label).toBe("Accuracy ×1.13, this gate up to ×1.18");
	});

	it("names no cap once the bonus has met it", () => {
		expect(accuracyTrackOf({ live: 1.08, best: 1.08, carried: 0 }).label).toBe(
			"Accuracy ×1.08"
		);
	});
});

describe("landedAccuracyTrackFor", () => {
	it("fills to the multiplier the gate closed on, with nothing hatched", () => {
		const track = landedAccuracyTrackFor(1.13);

		expect(track.figure).toBe("×1.13");
		expect(track.bonus).toBeCloseTo(track.cap);
	});
});
