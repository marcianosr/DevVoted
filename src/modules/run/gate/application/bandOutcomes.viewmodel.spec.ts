import { describe, expect, it } from "vitest";

import {
	floorAt,
	healthyAt,
	okAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import type { CoverageLadder } from "~/ui/kanto-theme/CoverageBar.ui";
import { leadTextOf } from "~/ui/kanto-theme/Lead.ui";

import {
	answersOwedFor,
	bandOutcomesFor,
	bandOutcomesPropsFor,
	BAND_OUTCOMES_NOTE,
	ESCROW_NOTE,
	FREE_MISS_NOTE,
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

const SQUEEZED: CoverageLadder = { floor: 30, ok: 49.6, healthy: 50 };

const bandsOf = (ladder: CoverageLadder) =>
	coverageRungsFor(ladder).map((rung) => rung.band);

const frameFor = (
	over: Partial<BandOutcomesFrame> = {}
): BandOutcomesFrame => ({
	swatch: GATE_SWATCHES[4],
	gate: 4,
	held: 0,
	ladder: MID,
	coverageGainPercent: 4,
	peelKb: 64,
	payout: (correct) => correct * 32,
	...over,
});

const clearOf = (frame: BandOutcomesFrame) =>
	objectivesFor(frame).objectives[0];
const swatchRowOf = (frame: BandOutcomesFrame) =>
	objectivesFor(frame).objectives[1];

describe("the rungs a gate's ladder has room for", () => {
	it("draws four rungs at the calibration gate, which has no floor to fall under", () => {
		expect(bandsOf(CALIBRATION)).toEqual(["perfect", "healthy", "ok", "shaky"]);
	});

	it("draws all five at every gate after it", () => {
		for (let gate = 1; gate < GATE_COUNT; gate++) {
			expect(bandsOf(ladderAt(gate))).toHaveLength(5);
		}
		expect(bandsOf(SECOND)).toContain("danger");
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

	it("is OK at the calibration gate too, since ADR-094 gave it room", () => {
		expect(clearingRungFor(CALIBRATION).band).toBe("ok");
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

describe("the objective that clears the gate", () => {
	it("badges the band the gate actually draws, not a fixed OK", () => {
		expect(
			clearOf(frameFor({ gate: 0, ladder: CALIBRATION })).statement
		).toContainEqual({ band: "ok" });
		expect(clearOf(frameFor({ ladder: SQUEEZED })).statement).toContainEqual({
			band: "healthy",
		});
	});

	it("states the demand as a band, and nothing about what the band is for", () => {
		expect(leadTextOf(clearOf(frameFor()).statement)).toBe(
			"Finish at OK or better"
		);
	});

	it("names the gate that clearing opens", () => {
		expect(leadTextOf(clearOf(frameFor()).earns)).toContain(
			"advance to Rainbow"
		);
	});

	it("quotes the figure its own table row quotes, so the two cannot drift", () => {
		const frame = frameFor();
		const row = bandOutcomesFor(frame).find((outcome) => outcome.band === "ok");

		expect(row?.pays).toBeDefined();
		expect(leadTextOf(clearOf(frame).earns)).toContain(row?.pays);
	});

	it("prices the figure in the band that pays it", () => {
		expect(clearOf(frameFor()).earns).toContainEqual(
			expect.objectContaining({ band: "ok" })
		);
	});

	it("promises no gate after the summit, because there is not one", () => {
		const summit = leadTextOf(
			clearOf(
				frameFor({ gate: VICTORY_GATE, swatch: GATE_SWATCHES[VICTORY_GATE] })
			).earns
		);

		expect(summit).not.toContain("advance to");
		expect(summit).toContain("or more");
	});
});

describe("the objective that earns the swatch", () => {
	it("asks for a flawless window, which is what stamps a gate (ADR-080)", () => {
		expect(leadTextOf(swatchRowOf(frameFor()).statement)).toBe(
			"Answer all 5 right"
		);
	});

	it("never asks for a coverage band, which is a different test entirely", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const statement = leadTextOf(
				swatchRowOf(frameFor({ gate, ladder: ladderAt(gate) })).statement
			);

			expect(statement).not.toContain("PERFECT");
		}
	});

	it("marks the reward with the gate's own swatch", () => {
		expect(swatchRowOf(frameFor()).earns).toContainEqual({
			swatch: GATE_SWATCHES[4],
			label: "Lavender swatch",
		});
	});
});

describe("what the column no longer states", () => {
	it("says nothing about an audit at any gate", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const stated = objectivesFor(frameFor({ gate, ladder: ladderAt(gate) }))
				.objectives.flatMap((objective) => [
					leadTextOf(objective.statement),
					leadTextOf(objective.earns),
				])
				.join(" ");

			expect(stated).not.toContain("audit");
		}
	});

	it("states two objectives and no section labels around them", () => {
		expect(objectivesFor(frameFor()).objectives).toHaveLength(2);
		expect(objectivesFor(frameFor())).toEqual({
			objectives: expect.any(Array),
		});
	});
});

describe("the band table", () => {
	it("lists exactly the rungs the ladder draws", () => {
		expect(bandOutcomesFor(frameFor()).map((row) => row.band)).toEqual(
			bandsOf(MID)
		);
	});

	it("never pays a thin clear what it pays a healthy one", () => {
		const paid = bandOutcomesFor(frameFor({ coverageGainPercent: 15 }));
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

describe("the prep table warns before the window, not after it", () => {
	it("names the rollback while the build holds an escrowing config", () => {
		const props = bandOutcomesPropsFor(frameFor({ escrows: true }), "ok");

		expect(props.note).toContain(ESCROW_NOTE);
	});

	it("says nothing about transactions a build cannot open", () => {
		const props = bandOutcomesPropsFor(frameFor(), "ok");

		expect(props.note).toBe(BAND_OUTCOMES_NOTE);
	});

	it("owes nothing at a gate that peels nothing, instead of a peel it never takes", () => {
		const props = bandOutcomesPropsFor(frameFor({ peelKb: 0 }), "ok");

		expect(props.note).toBe(FREE_MISS_NOTE);
		expect(props.note).not.toContain("owe a peel");
	});

	it("still names the rollback at a gate that peels nothing", () => {
		const props = bandOutcomesPropsFor(
			frameFor({ peelKb: 0, escrows: true }),
			"ok"
		);

		expect(props.note).toBe(`${FREE_MISS_NOTE} ${ESCROW_NOTE}`);
	});
});

describe("the SHAKY row reads what the gate takes on a miss", () => {
	const shakyRow = (frame: BandOutcomesFrame) =>
		bandOutcomesFor(frame).find((row) => row.band === "shaky");

	it("quotes the peel as a negative figure where the gate takes one", () => {
		expect(shakyRow(frameFor())?.pays).toBe("−64 KB peel");
	});

	it("says no peel at Pallet, which takes none (ADR-057), never a zero figure", () => {
		expect(
			shakyRow(frameFor({ gate: 0, ladder: CALIBRATION, peelKb: 0 }))?.pays
		).toBe("no peel");
	});
});

describe("the DANGER row reads the catch standing behind it", () => {
	const dangerRow = (frame: BandOutcomesFrame) =>
		bandOutcomesFor(frame).find((row) => row.band === "danger");

	it("says the run ends when nothing stands between it and the floor", () => {
		expect(dangerRow(frameFor())?.pays).toBe("the run ends");
	});

	it("says the gate is caught and owes a peel while Try/Catch is held", () => {
		expect(dangerRow(frameFor({ catchesFatal: true }))?.pays).toBe(
			"caught · peel instead"
		);
	});
});
