import { describe, expect, it } from "vitest";

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
const THUNDER = 3;
const LAVENDER = 4;
const ELITE = 11;
const CHAMPION = 12;

describe("scoringRowsFor", () => {
	it("lists every gate reached, the next one and the summit, sealing the two ahead", () => {
		const rows = scoringRowsFor(LAVENDER);

		expect(rows.map((row) => row.gate)).toEqual([0, 1, 2, 3, 4, 5, 12]);
		expect(rows.map((row) => row.name)).toEqual([
			"Pallet",
			"Boulder",
			"Cascade",
			"Thunder",
			"Lavender",
			"Rainbow",
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

	it("states slots, one unit's worth and the line for every gate reached", () => {
		const [pallet, boulder, , , lavender] = scoringRowsFor(LAVENDER);

		expect([pallet.slots, boulder.slots, lavender.slots]).toEqual([
			"5",
			"10",
			"25",
		]);
		expect([pallet.unit, boulder.unit, lavender.unit]).toEqual([
			"+20%",
			"+10%",
			"+4%",
		]);
		expect([pallet.healthy, boulder.healthy, lavender.healthy]).toEqual([
			"60%",
			"60%",
			"62%",
		]);
	});

	it("carries no figure at all on a sealed row", () => {
		const sealed = scoringRowsFor(LAVENDER).filter(
			(row) => row.locked === true
		);

		expect(sealed).toHaveLength(2);
		for (const row of sealed) {
			expect(row.slots).toBeUndefined();
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

	it("skips no gate at Elite, where the next gate is the summit", () => {
		const rows = scoringRowsFor(ELITE);

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
	it("states the codebase and what one unit pays there", () => {
		expect(leadTextOf(scoringMetaFor(LAVENDER))).toBe("25 slots 1 unit +4%");
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
		expect(leadTextOf(lineStatementFor(THUNDER))).toBe(
			"The line rises. HEALTHY asks 60% at Thunder and more at the gates after."
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

			expect(text).not.toContain("90%");
			for (let later = gate + 1; later <= CHAMPION; later += 1) {
				expect(text).not.toContain(gateSwatchAt(later).gateName);
			}
		}
	});
});

describe("scoringFor", () => {
	const scoring = scoringFor(LAVENDER);

	it("states the growth of the codebase with the five badged", () => {
		expect(leadTextOf(scoring.statements[0])).toBe(
			"The codebase grows. Every gate adds 5 slots, so a unit moves the bar less."
		);
		expect(scoring.statements[0]).toContainEqual({ figure: "5" });
	});

	it("hints what a poll pays in units, the credit badged", () => {
		expect(leadTextOf(scoring.hint)).toBe(
			"units per poll · all right pays 2 · configs add on top"
		);
		expect(scoring.hint).toContainEqual({ figure: "2" });
	});

	it("carries two prices and the sealed table", () => {
		expect(scoring.prices).toHaveLength(2);
		expect(scoring.rows).toHaveLength(7);
	});
});
