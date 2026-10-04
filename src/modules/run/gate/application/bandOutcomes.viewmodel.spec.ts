import { describe, expect, it } from "vitest";

import {
	coverageGainPercentFor,
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
	bandOutcomesPropsFor,
	BAND_OUTCOMES_NOTE,
	ESCROW_NOTE,
	FREE_MISS_NOTE,
	clearingRungFor,
	coverageRungsFor,
	ladderFor,
	metaFor,
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

const rungOf = (frame: BandOutcomesFrame, band: string) =>
	ladderFor(frame).rungs.find((rung) => rung.band === band);

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

	it("cuts each rung where the next one begins, so the zones share their edges", () => {
		const [perfect, healthy, ok, shaky, danger] = coverageRungsFor(MID);

		expect(perfect).toEqual({ band: "perfect", from: 100, to: 100 });
		expect(healthy.to).toBe(100);
		expect(ok.to).toBe(healthy.from);
		expect(shaky.to).toBe(ok.from);
		expect(danger).toEqual({ band: "danger", from: 0, to: shaky.from });
	});
});

describe("the lowest landing that still clears", () => {
	it("is OK at a gate that draws one", () => {
		expect(clearingRungFor(MID, 4).band).toBe("ok");
	});

	it("is OK at the calibration gate too, since ADR-094 gave it room", () => {
		expect(clearingRungFor(CALIBRATION, 0).band).toBe("ok");
	});

	it("is HEALTHY at the Champion, where OK does not win", () => {
		expect(clearingRungFor(ladderAt(VICTORY_GATE), VICTORY_GATE).band).toBe(
			"healthy"
		);
	});

	it("promotes to HEALTHY when an audit squeezes OK out", () => {
		expect(clearingRungFor(SQUEEZED, 4).band).toBe("healthy");
	});

	it("never names a band the table below it does not draw, at any gate", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const ladder = ladderAt(gate);

			expect(bandsOf(ladder)).toContain(clearingRungFor(ladder, gate).band);
		}
	});
});

describe("the answers a window owes", () => {
	it("owes nothing against a line the run already stands on", () => {
		expect(answersOwedFor(42, 42, 4, 0)).toBe(0);
		expect(answersOwedFor(42, 50, 4, 0)).toBe(0);
	});

	it("rounds a part answer up, since half an answer buys nothing", () => {
		expect(answersOwedFor(42, 34, 4, 0)).toBe(2);
		expect(answersOwedFor(42, 31, 4, 0)).toBe(3);
	});

	it("counts the carried accuracy multiplier, so two right land Pewter's OK on a run carrying ×1.4", () => {
		const pewterUnit = coverageGainPercentFor(1, 1);

		expect(answersOwedFor(SECOND.ok, 0, pewterUnit, 0.4)).toBe(2);
		expect(answersOwedFor(SECOND.ok, 0, pewterUnit, 0)).toBe(3);
	});

	it("refuses a line five right answers cannot reach", () => {
		expect(answersOwedFor(42, 0, 4, 0)).toBeUndefined();
	});

	it("refuses any line at all for a build that gains nothing", () => {
		expect(answersOwedFor(42, 41, 0, 0)).toBeUndefined();
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
		const okFrom = clearingRungFor(MID, 4).from;

		expect(leadTextOf(clearOf(frameFor()).statement)).toBe(
			`Finish at OK (${okFrom}%) or better`
		);
		expect(clearOf(frameFor()).statement).toContainEqual({
			figure: `${okFrom}%`,
			band: "ok",
		});
	});

	it("names the gate that clearing opens, then the KB beside it", () => {
		expect(leadTextOf(clearOf(frameFor()).earns)).toMatch(
			/^earns the advance to Celadon and \+.+ KB or more$/
		);
	});

	it("quotes the figure the ladder's own rung quotes, so the two cannot drift", () => {
		const frame = frameFor();
		const rung = rungOf(frame, "ok");

		expect(rung?.pays).toBeDefined();
		expect(leadTextOf(clearOf(frame).earns)).toContain(rung?.pays);
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
		expect(summit).toMatch(/^earns \+.+ KB or more$/);
	});
});

describe("the objective that earns the swatch", () => {
	it("asks for a full bar, which is what stamps it (ADR-170)", () => {
		expect(leadTextOf(swatchRowOf(frameFor()).statement)).toBe(
			"Reach 100% coverage"
		);
	});

	it("badges the full bar in the band it reaches", () => {
		expect(swatchRowOf(frameFor()).statement).toContainEqual({
			figure: "100%",
			band: "perfect",
		});
	});

	it("reads the same 100% at every gate, whatever its codebase", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			expect(
				leadTextOf(
					swatchRowOf(frameFor({ gate, ladder: ladderAt(gate) })).statement
				)
			).toBe("Reach 100% coverage");
		}
	});

	it("never asks for a coverage band, which is a different test entirely", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const statement = leadTextOf(
				swatchRowOf(frameFor({ gate, ladder: ladderAt(gate) })).statement
			);

			expect(statement).not.toContain("PERFECT");
		}
	});

	it("pays the KB a full bar pays, quoted off the ladder's PERFECT rung", () => {
		const frame = frameFor();

		expect(swatchRowOf(frame).earns).toContainEqual({
			figure: rungOf(frame, "perfect")?.pays,
			band: "perfect",
		});
		expect(leadTextOf(swatchRowOf(frame).earns)).toBe(
			`earns Lavender swatch and ${rungOf(frame, "perfect")?.pays}`
		);
	});

	it("marks the reward with the gate's own swatch", () => {
		expect(swatchRowOf(frameFor()).earns).toContainEqual({
			swatch: GATE_SWATCHES[4],
			label: "Lavender swatch",
		});
	});
});

describe("the panel never names the gate's codebase", () => {
	const linesOf = (frame: BandOutcomesFrame) => {
		const props = bandOutcomesPropsFor(frame);

		return [
			props.meta,
			...(props.objectives?.objectives ?? []).flatMap((objective) => [
				objective.statement,
				objective.earns,
			]),
		]
			.map(leadTextOf)
			.concat(
				props.ladder.rungs.map((rung) => rung.pays),
				props.note ?? ""
			)
			.join(" ");
	};

	it("speaks in coverage and points at every gate, never in changes", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			expect(
				linesOf(
					frameFor({
						gate,
						swatch: GATE_SWATCHES[gate],
						ladder: ladderAt(gate),
						coverageGainPercent: coverageGainPercentFor(1, gate),
						held: 30,
					})
				)
			).not.toMatch(/\bchanges?\b/i);
		}
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

	it("states no count of right answers, only the clear and the swatch", () => {
		expect(objectivesFor(frameFor()).objectives).toHaveLength(2);
	});
});

describe("the ladder", () => {
	it("lists exactly the rungs the gate draws, worst first", () => {
		expect(ladderFor(frameFor()).rungs.map((rung) => rung.band)).toEqual(
			[...bandsOf(MID)].reverse()
		);
	});

	it("carries the reading the pin stands on", () => {
		expect(ladderFor(frameFor({ held: 50 })).held).toBe(50);
	});

	it("never pays a thin clear what it pays a healthy one", () => {
		const frame = frameFor({ coverageGainPercent: 15 });
		const kbOf = (band: string) =>
			Number(rungOf(frame, band)?.pays.match(/(\d+)/)?.[1]);

		expect(kbOf("healthy")).toBeGreaterThan(kbOf("ok"));
		expect(kbOf("perfect")).toBeGreaterThan(kbOf("ok"));
		expect(kbOf("perfect")).toBeGreaterThanOrEqual(kbOf("healthy"));
	});

	it("quotes PERFECT with the bonus a full bar adds (ADR-075)", () => {
		const frame = frameFor({
			payout: (correct, band) => correct * 32 + (band === "perfect" ? 80 : 0),
		});

		expect(rungOf(frame, "perfect")?.pays).toBe("+240 KB");
	});

	it("ends the run under the floor rather than quoting it a figure", () => {
		expect(ladderFor(frameFor()).rungs[0].pays).toBe("the run ends");
	});
});

describe("the panel's heading", () => {
	it("names the gate and badges its number", () => {
		expect(leadTextOf(metaFor(frameFor()))).toBe("Lavender · gate 4");
		expect(metaFor(frameFor())).toContainEqual({ figure: "4" });
	});
});

describe("the prep table warns before the window, not after it", () => {
	it("names the rollback while the build holds an escrowing config", () => {
		const props = bandOutcomesPropsFor(frameFor({ escrows: true }));

		expect(props.note).toContain(ESCROW_NOTE);
	});

	it("says nothing about transactions a build cannot open", () => {
		const props = bandOutcomesPropsFor(frameFor());

		expect(props.note).toBe(BAND_OUTCOMES_NOTE);
	});

	it("owes nothing at a gate that peels nothing, instead of a peel it never takes", () => {
		const props = bandOutcomesPropsFor(frameFor({ peelKb: 0 }));

		expect(props.note).toBe(FREE_MISS_NOTE);
		expect(props.note).not.toContain("owe a peel");
	});

	it("still names the rollback at a gate that peels nothing", () => {
		const props = bandOutcomesPropsFor(frameFor({ peelKb: 0, escrows: true }));

		expect(props.note).toBe(`${FREE_MISS_NOTE} ${ESCROW_NOTE}`);
	});
});

describe("the SHAKY row reads what the gate takes on a miss", () => {
	const shakyRow = (frame: BandOutcomesFrame) => rungOf(frame, "shaky");

	it("quotes the peel as a negative figure where the gate takes one", () => {
		expect(shakyRow(frameFor())?.pays).toBe("gate held · −64 KB peel");
	});

	it("says no peel at Pallet, which takes none (ADR-057), never a zero figure", () => {
		expect(
			shakyRow(frameFor({ gate: 0, ladder: CALIBRATION, peelKb: 0 }))?.pays
		).toBe("gate held · no peel");
	});
});

describe("the Champion's OK row reads a miss", () => {
	const champion = frameFor({
		swatch: GATE_SWATCHES[VICTORY_GATE],
		gate: VICTORY_GATE,
		ladder: ladderAt(VICTORY_GATE),
	});

	it("quotes the peel on OK, since only HEALTHY or better wins", () => {
		expect(rungOf(champion, "ok")?.pays).toBe("gate held · −64 KB peel");
	});

	it("asks for HEALTHY or better in the clear objective", () => {
		const healthyFrom = clearingRungFor(
			ladderAt(VICTORY_GATE),
			VICTORY_GATE
		).from;

		expect(leadTextOf(clearOf(champion).statement)).toBe(
			`Finish at HEALTHY (${healthyFrom}%) or better`
		);
	});
});

describe("the DANGER row reads the catch standing behind it", () => {
	const dangerRow = (frame: BandOutcomesFrame) => rungOf(frame, "danger");

	it("says the run ends when nothing stands between it and the floor", () => {
		expect(dangerRow(frameFor())?.pays).toBe("the run ends");
	});

	it("says the gate is caught and owes a peel while Try/Catch is held", () => {
		expect(dangerRow(frameFor({ catchesFatal: true }))?.pays).toBe(
			"caught · peel instead"
		);
	});
});
