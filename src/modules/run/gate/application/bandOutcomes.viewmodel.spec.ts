import { describe, expect, it } from "vitest";

import {
	floorAt,
	healthyAt,
	okAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { GATE_COUNT, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { CoverageLadder } from "~/ui/kanto-theme/CoverageBar.ui";

import {
	answersOwedFor,
	bandOutcomesFor,
	clearingRungFor,
	coverageRungsFor,
	objectivesFor,
	type BandOutcomesFrame,
} from "./bandOutcomes.viewmodel";

const ladderAt = (gate: number): CoverageLadder => ({
	floor: percentOf(floorAt(gate)),
	ok: percentOf(okAt(gate)),
	healthy: percentOf(healthyAt(gate)),
});

const CALIBRATION = ladderAt(0);
const SECOND = ladderAt(1);
const MID = ladderAt(4);

/** An audit that scales every line until OK has no room left under HEALTHY. */
const SQUEEZED: CoverageLadder = { floor: 30, ok: 49.6, healthy: 50 };

const bandsOf = (ladder: CoverageLadder) =>
	coverageRungsFor(ladder).map((rung) => rung.band);

const frameFor = (
	over: Partial<BandOutcomesFrame> = {}
): BandOutcomesFrame => ({
	gateName: "Lavender",
	gate: 4,
	correctThisGate: 0,
	held: 0,
	openingHeld: 0,
	ladder: MID,
	coverageGainPercent: 4,
	peelKb: 64,
	payout: (correct) => correct * 32,
	...over,
});

const clearOf = (frame: BandOutcomesFrame) => objectivesFor(frame).required;
const swatchRowOf = (frame: BandOutcomesFrame) =>
	objectivesFor(frame).optional[0];

describe("the rungs a gate's ladder has room for", () => {
	it("drops OK at the calibration gate, where it collapsed onto the healthy line", () => {
		expect(bandsOf(CALIBRATION)).toEqual(["perfect", "healthy", "shaky"]);
	});

	it("keeps OK wherever the ladder leaves it a point to sit on", () => {
		expect(bandsOf(SECOND)).toContain("ok");
	});

	it("drops DANGER while the floor is still clamped to zero", () => {
		expect(bandsOf(SECOND)).not.toContain("danger");
	});

	it("draws all five once the ladder has room for every one", () => {
		expect(bandsOf(MID)).toEqual([
			"perfect",
			"healthy",
			"ok",
			"shaky",
			"danger",
		]);
	});

	it("drops OK when an audit squeezes it up against the healthy line", () => {
		expect(bandsOf(SQUEEZED)).not.toContain("ok");
	});

	it("runs best first, so the clearing bands are a prefix", () => {
		expect(bandsOf(MID)[0]).toBe("perfect");
		expect(bandsOf(MID).at(-1)).toBe("danger");
	});
});

describe("the lowest landing that still clears", () => {
	it("is OK at a gate that draws one", () => {
		expect(clearingRungFor(MID).band).toBe("ok");
	});

	it("is HEALTHY at the calibration gate, which draws no OK", () => {
		expect(clearingRungFor(CALIBRATION).band).toBe("healthy");
	});

	it("promotes to HEALTHY when an audit squeezes OK out", () => {
		expect(clearingRungFor(SQUEEZED).band).toBe("healthy");
	});

	it("never names a band the table below it does not draw, at any gate", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const ladder = ladderAt(gate);

			expect(bandsOf(ladder)).toContain(clearingRungFor(ladder).band);
		}
	});
});

describe("the answers a window owes", () => {
	it("owes nothing against a line the run already stands on", () => {
		expect(answersOwedFor(42, 42, 4)).toBe(0);
		expect(answersOwedFor(42, 50, 4)).toBe(0);
	});

	it("rounds a part answer up, since half an answer buys nothing", () => {
		expect(answersOwedFor(42, 34, 4)).toBe(2);
		expect(answersOwedFor(42, 33, 4)).toBe(3);
	});

	it("refuses a line five right answers cannot reach", () => {
		expect(answersOwedFor(42, 0, 4)).toBeUndefined();
	});

	it("refuses any line at all for a build that gains nothing", () => {
		expect(answersOwedFor(42, 41, 0)).toBeUndefined();
	});
});

describe("the one thing a gate requires", () => {
	it("badges the band the gate actually draws, not a fixed OK", () => {
		expect(
			clearOf(frameFor({ gate: 0, ladder: CALIBRATION })).statement.figure
		).toBe("HEALTHY");
	});

	it("states the line rather than listing it beside the optional prizes", () => {
		const required = clearOf(frameFor());

		expect(required.lead).toBe("to clear the gate");
		expect(required.statement).toMatchObject({
			lead: "Finish at",
			trail: "or better",
		});
	});

	it("prices itself in the answers the window still owes", () => {
		expect(clearOf(frameFor({ held: 34, openingHeld: 34 })).explain).toContain(
			`or 2 of the ${SLICE_WINDOW} right`
		);
	});

	it("drops the price once the line is already in hand", () => {
		const required = clearOf(frameFor({ held: 50, openingHeld: 50 }));

		expect(required.met).toBe(true);
		expect(required.explain).toContain("already holds");
	});

	it("quotes the window's own price, not what is left of it part way through", () => {
		const opening = clearOf(frameFor({ held: 34, openingHeld: 34 }));
		const midway = clearOf(frameFor({ held: 38, openingHeld: 34 }));

		expect(midway.explain).toBe(opening.explain);
	});

	it("says so where five right answers cannot reach the line", () => {
		expect(clearOf(frameFor({ held: 0, openingHeld: 0 })).explain).toContain(
			`which ${SLICE_WINDOW} of ${SLICE_WINDOW} right no longer reaches`
		);
	});

	it("ticks off the same rounded rung the table cuts its ranges on", () => {
		expect(clearOf(frameFor({ held: 42, openingHeld: 42 })).met).toBe(true);
	});

	it("names what staying under the line shuts, and the summit's lack of one", () => {
		expect(clearOf(frameFor({ gate: 4 })).explain).toContain(
			"Anything under it and Rainbow stays shut."
		);
		expect(clearOf(frameFor({ gate: 12 })).explain).toContain(
			"Anything under it and the climb ends here."
		);
	});
});

describe("what a gate offers but does not ask for", () => {
	it("keeps the swatch off the required line", () => {
		const { optional, optionalLead } = objectivesFor(frameFor({ gate: 0 }));

		expect(optionalLead).toBe("also on the table, not required");
		expect(optional.map((prize) => prize.name)).toEqual([
			"Earn the Lavender swatch",
		]);
	});

	it("asks for the whole window however the coverage lands", () => {
		expect(swatchRowOf(frameFor()).requirements[0].figure).toBe("5 of 5");
	});

	it("ticks only on a flawless window", () => {
		expect(swatchRowOf(frameFor({ correctThisGate: 4 })).met).toBe(false);
		expect(swatchRowOf(frameFor({ correctThisGate: 5 })).met).toBe(true);
	});
});

describe("the band table", () => {
	it("lists exactly the rungs the ladder draws", () => {
		expect(bandOutcomesFor(frameFor()).map((row) => row.band)).toEqual(
			bandsOf(MID)
		);
	});

	/**
	 * The gain used to arrive as a unit count read as a percentage, a hundred
	 * times too high, so every line divided down to one answer and the two
	 * clearing bands quoted the same KB.
	 */
	it("never pays a thin clear what it pays a healthy one", () => {
		const paid = bandOutcomesFor(frameFor({ coverageGainPercent: 12 }));
		const kbOf = (band: string) =>
			Number(paid.find((row) => row.band === band)?.pays.match(/(\d+)/)?.[1]);

		expect(kbOf("healthy")).toBeGreaterThan(kbOf("ok"));
		expect(kbOf("perfect")).toBeGreaterThan(kbOf("ok"));
		expect(kbOf("perfect")).toBeGreaterThanOrEqual(kbOf("healthy"));
	});

	it("ends the run under the floor rather than quoting it a figure", () => {
		expect(bandOutcomesFor(frameFor()).at(-1)?.pays).toBe("the run ends");
	});
});
