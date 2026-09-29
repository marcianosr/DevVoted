import { describe, expect, it } from "vitest";

import {
	floorAt,
	healthyAt,
	okAt,
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";
import type { CoverageLadder } from "~/ui/kanto-theme/CoverageBar.ui";
import { leadTextOf } from "~/ui/kanto-theme/Lead.ui";

import {
	codebaseFor,
	owedLineFor,
	payRowsFor,
	type PollPaysFrame,
	pollPaysPropsFor,
	slotsOpenLabelOf,
	standingLineFor,
	strictnessFor,
	strictnessRowsFor,
} from "./pollPays.viewmodel";

const PALLET = 0;
const BOULDER = 1;
const CASCADE = 2;
const LAVENDER = 4;
const CHAMPION = 12;

const ladderAt = (gate: number): CoverageLadder => ({
	floor: roundToOneDecimal(percentOf(floorAt(gate))),
	ok: roundToOneDecimal(percentOf(okAt(gate))),
	healthy: roundToOneDecimal(percentOf(healthyAt(gate))),
});

const frameAt = (
	gate: number,
	unitsHeld: number,
	configs: readonly Config[] = []
): PollPaysFrame => ({
	gate,
	unitsHeld,
	configs,
	ladder: ladderAt(gate),
	held: roundToOneDecimal(percentOf(runCoverageOf(unitsHeld, gate))),
});

const BAR = { ...ladderAt(CASCADE), held: 53.3 };

describe("slotsOpenLabelOf", () => {
	it("counts every slot the run has opened", () => {
		expect(slotsOpenLabelOf(CASCADE)).toBe("15 slots open");
		expect(slotsOpenLabelOf(CHAMPION)).toBe("65 slots open");
	});
});

describe("codebaseFor", () => {
	it("fills the squares left to right across the pool, coloured by the gate that opened them", () => {
		const { gates, label } = codebaseFor(8, CASCADE);

		expect(gates.map((gate) => gate.swatch.gateName)).toEqual([
			"Pallet",
			"Boulder",
			"Cascade",
		]);
		expect(gates.map((gate) => gate.covered)).toEqual([5, 3, 0]);
		expect(gates.map((gate) => gate.current)).toEqual([
			undefined,
			undefined,
			true,
		]);
		expect(label).toBe("8 of 15 slots covered");
	});

	it("draws only whole units as squares and leaves the fraction to the sentence", () => {
		const { gates, label } = codebaseFor(7.35, CASCADE);

		expect(gates[BOULDER].covered).toBe(2);
		expect(label).toBe("7 of 15 slots covered");
	});

	it("opens the calibration gate as five dashed squares and nothing else", () => {
		const { gates } = codebaseFor(0, PALLET);

		expect(gates).toHaveLength(1);
		expect(gates[0]).toMatchObject({ covered: 0, slots: 5, current: true });
	});

	it("covers every square, today's five included, when the bar is full", () => {
		const { gates } = codebaseFor(40, LAVENDER);

		expect(gates.every((gate) => gate.covered === 5)).toBe(true);
	});
});

describe("standingLineFor", () => {
	it("reads the plain scored sentence at the calibration gate", () => {
		expect(leadTextOf(standingLineFor(frameAt(PALLET, 0)))).toBe(
			"You have scored 0 units across 5 slots, which is 0.0% coverage."
		);
	});

	it("states the growth and reads the same units against yesterday's slots and today's", () => {
		expect(leadTextOf(standingLineFor(frameAt(CASCADE, 8)))).toBe(
			"The codebase grew from 10 to 15 slots. The same 8 units read 80.0% at Boulder and 53.3% here. Nothing was lost."
		);
	});

	it("states the fraction the squares could not draw", () => {
		expect(leadTextOf(standingLineFor(frameAt(CASCADE, 7.35)))).toContain(
			"7.35 units"
		);
	});

	it("reads a full bar yesterday as a full bar, never over it", () => {
		expect(leadTextOf(standingLineFor(frameAt(BOULDER, 5)))).toContain(
			"100.0% at Pallet"
		);
	});

	it("falls back to the plain sentence when nothing was banked to re-base", () => {
		expect(leadTextOf(standingLineFor(frameAt(LAVENDER, 0)))).toBe(
			"You have scored 0 units across 25 slots, which is 0.0% coverage."
		);
	});
});

describe("owedLineFor", () => {
	it("says nothing while the run already stands on the clearing band", () => {
		expect(owedLineFor(frameAt(CASCADE, 8))).toBeUndefined();
	});

	it("prices the distance to the clearing band in units", () => {
		expect(leadTextOf(owedLineFor(frameAt(CASCADE, 7)) ?? [])).toBe(
			"+1 unit reaches OK."
		);
	});

	it("says nothing over a full bar", () => {
		expect(owedLineFor(frameAt(LAVENDER, 40))).toBeUndefined();
	});
});

describe("payRowsFor", () => {
	it("prices a bare single and a bare multiple, the multiple doubling", () => {
		expect(payRowsFor([], CASCADE)).toEqual([
			{ answer: "single answer", units: "1 unit", share: "+6.67%" },
			{ answer: "multiple answers", units: "2 units", share: "+13.33%" },
		]);
	});

	it("adds a row per focus config, named after it, between the two", () => {
		const rows = payRowsFor([CONFIGS.ts], CASCADE);

		expect(rows).toHaveLength(3);
		expect(rows[1]).toEqual({
			answer: "single answer",
			via: ".ts ×1.25",
			units: "1.25 units",
			share: "+8.33%",
		});
	});

	it("doubles the credit before the multipliers and rides the adds once", () => {
		const rows = payRowsFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], PALLET);

		expect(rows[0]).toMatchObject({ units: "2.1 units", share: "+42%" });
		expect(rows.at(-1)).toMatchObject({ units: "4.1 units", share: "+82%" });
	});

	it("quotes the share off the gate's own slots", () => {
		expect(payRowsFor([], CHAMPION)[0].share).toBe("+1.54%");
	});
});

describe("pollPaysPropsFor", () => {
	it("assembles the panel and carries the bar it was handed", () => {
		const props = pollPaysPropsFor(frameAt(CASCADE, 8, [CONFIGS.ts]), BAR);

		expect(props.slotsOpen).toBe("15 slots open");
		expect(props.bar).toBe(BAR);
		expect(props.owed).toBeUndefined();
		expect(props.rows).toHaveLength(3);
	});

	it("names what is owed while the run stands under the band", () => {
		const props = pollPaysPropsFor(frameAt(CASCADE, 7), BAR);

		expect(props.owed).toBeDefined();
	});
});

describe("strictnessRowsFor", () => {
	it("lists the first two gates, the current one and the summit", () => {
		const rows = strictnessRowsFor(LAVENDER);

		expect(rows.map((row) => row.gate)).toEqual([
			"Pallet",
			"Boulder",
			"Lavender",
			"Champion",
		]);
		expect(rows.map((row) => row.slots)).toEqual(["5", "10", "25", "65"]);
		expect(rows.map((row) => row.unit)).toEqual([
			"+20%",
			"+10%",
			"+4%",
			"+1.54%",
		]);
		expect(rows.map((row) => row.healthy)).toEqual([
			"60%",
			"60%",
			"62%",
			"90%",
		]);
		expect(rows.map((row) => row.current)).toEqual([
			undefined,
			undefined,
			true,
			undefined,
		]);
	});

	it("draws no row twice when the current gate is already listed", () => {
		expect(strictnessRowsFor(PALLET)).toHaveLength(3);
		expect(strictnessRowsFor(PALLET)[0].current).toBe(true);
		expect(strictnessRowsFor(BOULDER)).toHaveLength(3);
		expect(strictnessRowsFor(CHAMPION)).toHaveLength(3);
		expect(strictnessRowsFor(CHAMPION).at(-1)?.current).toBe(true);
	});
});

describe("strictnessFor", () => {
	const strictness = strictnessFor(LAVENDER);

	it("summarises today's gate for the shut fold", () => {
		expect(strictness.summary).toBe("Lavender · 25 slots · one unit is +4%");
	});

	it("states the growth of the codebase", () => {
		expect(leadTextOf(strictness.statements[0])).toBe(
			"The codebase grows. Each gate opens 5 more slots, so one unit moves the bar less."
		);
	});

	it("reads the line off the table: flat through Thunder, then climbing to the Champion", () => {
		expect(leadTextOf(strictness.statements[1])).toBe(
			"The line rises. HEALTHY asks 60% from Pallet to Thunder, then climbs to 90% at Champion."
		);
	});

	it("names the gate from which a window must pay more than a unit an answer", () => {
		expect(leadTextOf(strictness.note)).toBe(
			"Your units stay banked; a new gate only adds slots to cover. From Seafoam on, HEALTHY asks more than one unit an answer, so multiple-answer polls and coverage configs carry the climb."
		);
	});
});
