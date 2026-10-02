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

	it("states what a right single adds and the line for every gate reached", () => {
		const [pallet, boulder, , , lavender] = scoringRowsFor(LAVENDER);

		expect([pallet.unit, boulder.unit, lavender.unit]).toEqual([
			"+11.1%",
			"+11.1%",
			"+11.1%",
		]);
		expect([pallet.healthy, boulder.healthy, lavender.healthy]).toEqual([
			"40%",
			"44%",
			"55%",
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
	it("states what a single and a multiple add and what accuracy can multiply", () => {
		expect(leadTextOf(scoringMetaFor(LAVENDER))).toBe(
			"single +11.1% · multiple up to +22.2% · accuracy up to ×2"
		);
	});

	it("badges the points as gains and the multiplier as a figure", () => {
		expect(scoringMetaFor(LAVENDER)).toContainEqual({
			figure: "+11.1%",
			gain: true,
		});
		expect(scoringMetaFor(LAVENDER)).toContainEqual({
			figure: "+22.2%",
			gain: true,
		});
		expect(scoringMetaFor(LAVENDER)).toContainEqual({ figure: "×2" });
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
			"The line rises. HEALTHY asks 51% at Thunder and more at the gates after."
		);
	});

	it("tops out at the summit", () => {
		expect(leadTextOf(lineStatementFor(CHAMPION))).toBe(
			"The line goes no higher. HEALTHY asks 84% at Champion, the last gate."
		);
	});

	it("names no figure and no gate past the one being prepped", () => {
		for (let gate = PALLET; gate < CHAMPION; gate += 1) {
			const text = leadTextOf(lineStatementFor(gate));

			expect(text).not.toContain("84%");
			for (let later = gate + 1; later <= CHAMPION; later += 1) {
				expect(text).not.toContain(gateSwatchAt(later).gateName);
			}
		}
	});
});

describe("scoringFor", () => {
	const scoring = scoringFor(LAVENDER);

	it("states two things: the multiplier curve, then the line", () => {
		expect(scoring.statements).toHaveLength(2);
	});

	it("states the whole multiplier curve, each step badged", () => {
		expect(leadTextOf(scoring.statements[0])).toBe(
			"Right answers multiply what the window covered: 0 ×1 1 ×1.15 2 ×1.32 3 ×1.52 4 ×1.74 5 ×2. A multiple counts as two."
		);
		expect(scoring.statements[0]).toContainEqual({ figure: "3 ×1.52" });
		expect(scoring.statements[0]).toContainEqual({ figure: "5 ×2" });
	});

	it("states the line last", () => {
		expect(leadTextOf(scoring.statements[1])).toBe(
			leadTextOf(lineStatementFor(LAVENDER))
		);
	});

	it("hints what a poll pays in credit, the multiple's credit badged", () => {
		expect(leadTextOf(scoring.hint)).toBe(
			"credit per poll · a multiple counts 2 · configs add on top"
		);
		expect(scoring.hint).toContainEqual({ figure: "2" });
	});

	it("carries two prices and the sealed table", () => {
		expect(scoring.prices).toHaveLength(2);
		expect(scoring.rows).toHaveLength(7);
	});

	it("never names the gate's codebase on any line it states, at any gate", () => {
		for (let gate = PALLET; gate <= CHAMPION; gate += 1) {
			const stated = scoringFor(gate);
			const text = [stated.meta, stated.hint, ...stated.statements]
				.map(leadTextOf)
				.join(" ");

			expect(text).not.toMatch(/\bchanges?\b/i);
		}
	});
});
