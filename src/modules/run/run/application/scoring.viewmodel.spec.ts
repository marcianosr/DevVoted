import { describe, expect, it } from "vitest";

import {
	healthyAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { leadTextOf } from "~/ui/kanto-theme/Lead.ui";

import {
	lineStatementFor,
	pricesFor,
	scoringFor,
	scoringMetaFor,
	scoringRowsFor,
} from "./scoring.viewmodel";

const PALLET = 0;
const VERMILION = 3;
const LAVENDER = 4;
const INDIGO_ELITE = 11;
const CHAMPION = 12;
const CHAMPION_HEALTHY = `${percentOf(healthyAt(CHAMPION))}%`;

describe("scoringRowsFor", () => {
	it("lists every gate reached, the next one and the summit, sealing the two ahead", () => {
		const rows = scoringRowsFor(LAVENDER);

		expect(rows.map((row) => row.gate)).toEqual([0, 1, 2, 3, 4, 5, 12]);
		expect(rows.map((row) => row.name)).toEqual([
			"Pallet",
			"Pewter",
			"Cerulean",
			"Vermilion",
			"Lavender",
			"Celadon",
			"Champion",
		]);
		expect(rows.map((row) => row.locked)).toEqual([
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			true,
			true,
		]);
		expect(rows.map((row) => row.current)).toEqual([
			undefined,
			undefined,
			undefined,
			undefined,
			true,
			undefined,
			undefined,
		]);
	});

	it("states what a right single adds and the line for every gate reached", () => {
		const [pallet, pewter, , , lavender] = scoringRowsFor(LAVENDER);

		expect([pallet.unit, pewter.unit, lavender.unit]).toEqual([
			"+20%",
			"+20%",
			"+14.3%",
		]);
		expect([pallet.healthy, pewter.healthy, lavender.healthy]).toEqual([
			"64%",
			"66%",
			"73%",
		]);
	});

	it("carries no figure at all on a sealed row", () => {
		const sealed = scoringRowsFor(LAVENDER).filter(
			(row) => row.locked === true
		);

		expect(sealed).toHaveLength(2);
		for (const row of sealed) {
			expect(row.unit).toBeUndefined();
			expect(row.healthy).toBeUndefined();
		}
	});

	it("seals everything but Pallet at the calibration gate", () => {
		const rows = scoringRowsFor(PALLET);

		expect(rows.map((row) => row.gate)).toEqual([0, 1, 12]);
		expect(rows.map((row) => row.locked)).toEqual([undefined, true, true]);
		expect(rows[0].current).toBe(true);
	});

	it("skips no gate at Indigo Elite, where the next gate is the summit", () => {
		const rows = scoringRowsFor(INDIGO_ELITE);

		expect(rows).toHaveLength(13);
		expect(rows.filter((row) => row.locked === true)).toHaveLength(1);
		expect(rows.at(-1)?.locked).toBe(true);
	});

	it("seals nothing at the summit and marks it current", () => {
		const rows = scoringRowsFor(CHAMPION);

		expect(rows).toHaveLength(13);
		expect(rows.every((row) => row.locked !== true)).toBe(true);
		expect(rows.at(-1)?.current).toBe(true);
	});
});

describe("scoringMetaFor", () => {
	it("lists what a single and a multiple add and what accuracy can multiply, one line each", () => {
		expect(scoringMetaFor(LAVENDER, 0).map(leadTextOf)).toEqual([
			"single +14.3%",
			"multiple up to +28.6%",
			"accuracy up to ×1.08",
		]);
	});

	it("badges the points as gains and the multiplier as a figure", () => {
		const [single, multiple, accuracy] = scoringMetaFor(LAVENDER, 0);

		expect(single).toContainEqual({ figure: "+14.3%", gain: true });
		expect(multiple).toContainEqual({ figure: "+28.6%", gain: true });
		expect(accuracy).toContainEqual({ figure: "×1.08" });
	});
});

describe("pricesFor", () => {
	const [single, multiple] = pricesFor();

	it("prices a single answer as nothing or one unit", () => {
		expect(single.label).toBe("single answer");
		expect(single.steps.map((step) => step.figure)).toEqual(["0", "1"]);
		expect(single.steps.map((step) => step.tone)).toEqual(["none", "full"]);
	});

	it("prices a multiple answer by quarter shares of two units", () => {
		expect(multiple.label).toBe("multiple answers");
		expect(multiple.steps.map((step) => step.figure)).toEqual([
			"0",
			"0.5",
			"1",
			"1.5",
			"2",
		]);
		expect(multiple.steps.map((step) => step.tone)).toEqual([
			"none",
			"partial",
			"partial",
			"partial",
			"full",
		]);
	});
});

describe("lineStatementFor", () => {
	it("says the line rises without quoting the gates ahead", () => {
		expect(leadTextOf(lineStatementFor(VERMILION))).toBe(
			"The line rises. HEALTHY asks 71% at Vermilion and more at the gates after."
		);
	});

	it("tops out at the summit", () => {
		expect(leadTextOf(lineStatementFor(CHAMPION))).toBe(
			"The line goes no higher. HEALTHY asks 90% at Champion, the last gate."
		);
	});

	it("names no figure and no gate past the one being prepped", () => {
		for (let gate = PALLET; gate < CHAMPION; gate += 1) {
			const text = leadTextOf(lineStatementFor(gate));

			expect(text).not.toContain(CHAMPION_HEALTHY);
			for (let later = gate + 1; later <= CHAMPION; later += 1) {
				expect(text).not.toContain(gateSwatchAt(later).gateName);
			}
		}
	});
});

describe("scoringFor", () => {
	const scoring = scoringFor(LAVENDER, 0);

	it("states the multiplier curve in a sentence, its steps apart from it", () => {
		expect(leadTextOf(scoring.curve.statement)).toBe(
			"Right answers multiply what the window covered, and the multiplier carries to the next gate. A miss takes a little back. A multiple counts as two."
		);
	});

	it("steps the whole curve, one multiplier per count of right answers", () => {
		expect(scoring.curve.steps).toEqual([
			{ right: "0", multiplier: "×1" },
			{ right: "1", multiplier: "×1" },
			{ right: "2", multiplier: "×1.01" },
			{ right: "3", multiplier: "×1.03" },
			{ right: "4", multiplier: "×1.06" },
			{ right: "5", multiplier: "×1.08" },
		]);
	});

	it("states the line after the curve", () => {
		expect(scoring.statements).toHaveLength(1);
		expect(leadTextOf(scoring.statements[0])).toBe(
			leadTextOf(lineStatementFor(LAVENDER))
		);
	});

	it("carries two prices and the sealed table", () => {
		expect(scoring.prices).toHaveLength(2);
		expect(scoring.rows).toHaveLength(7);
	});

	it("never names the gate's codebase on any line it states, at any gate", () => {
		for (let gate = PALLET; gate <= CHAMPION; gate += 1) {
			const stated = scoringFor(gate, 0);
			const text = [
				...stated.meta,
				stated.curve.statement,
				...stated.statements,
			]
				.map(leadTextOf)
				.join(" ");

			expect(text).not.toMatch(/\bchanges?\b/i);
		}
	});
});
