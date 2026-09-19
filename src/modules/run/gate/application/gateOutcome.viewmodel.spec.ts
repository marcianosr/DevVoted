import { describe, expect, it } from "vitest";

import {
	type GateAnswer,
	type GateOutcomeFrame,
	closedBarFor,
	gateOutcomePropsFor,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

const GATE_0_LADDER = { floor: 0, ok: 20, healthy: 20 };
const GATE_4_LADDER = { floor: 5, ok: 15, healthy: 25 };

describe("closedBarFor", () => {
	it("leaves a genuine clear's reading untouched", () => {
		expect(closedBarFor("cleared", GATE_4_LADDER, 30).held).toBe(30);
		expect(closedBarFor("cleared", GATE_0_LADDER, 100).held).toBe(100);
	});

	it("never lifts a flawless opening gate onto its healthy line", () => {
		expect(closedBarFor("cleared", GATE_0_LADDER, 100).held).not.toBe(
			GATE_0_LADDER.healthy
		);
	});

	it("holds a missed gate inside the band its verdict names", () => {
		expect(closedBarFor("held", GATE_4_LADDER, 30).held).toBeLessThan(
			GATE_4_LADDER.ok
		);
		expect(closedBarFor("fatal", GATE_4_LADDER, 30).held).toBeLessThan(
			GATE_4_LADDER.floor
		);
	});
});

const GATE = 4;

const answerAt = (outcome: VerdictOutcome): GateAnswer => ({
	category: "js",
	question: "Which method returns the last element of an array?",
	outcome,
	coverage: 5,
	answerType: "single",
	options: ["at(-1)", "pop()"],
	picked: ["at(-1)"],
	correct: ["at(-1)"],
});

const frameOf = (
	swatchGates: readonly number[],
	held: number
): GateOutcomeFrame => ({
	gate: GATE,
	answers: Array.from({ length: 5 }, () => answerAt("correct")),
	swatchGates,
	balanceBeforeKb: 64,
	configs: [],
	bar: { ...GATE_4_LADDER, held },
	payoutKb: 32,
	bonusKb: 0,
	faucetKb: 0,
	billKb: 0,
});

const CLEARED = 30;
const SHORT = 10;

describe("gateOutcomePropsFor and the swatch", () => {
	it("hands the swatch to a flawless window even where the gate only holds", () => {
		const header = gateOutcomePropsFor(frameOf([GATE], SHORT)).header;

		expect(header.earned).toBe(true);
		expect(header.chips).toContainEqual(
			expect.objectContaining({ label: "swatch earned" })
		);
	});

	it("withholds the swatch from a clear the window did not earn", () => {
		const header = gateOutcomePropsFor(frameOf([], CLEARED)).header;

		expect(header.earned).toBe(false);
		expect(header.chips).not.toContainEqual(
			expect.objectContaining({ label: "swatch earned" })
		);
	});

	it("never says 'earned' in a headline that only reports the clear", () => {
		expect(gateOutcomePropsFor(frameOf([], CLEARED)).header.title).toBe(
			"Lavender cleared"
		);
		expect(gateOutcomePropsFor(frameOf([GATE], SHORT)).header.title).toBe(
			"Lavender holds"
		);
	});

	it("fills only the gates the run played clean on the track", () => {
		const { swatches } = gateOutcomePropsFor(
			frameOf([1, GATE], CLEARED)
		).header;

		expect(swatches.map((fill) => fill.state)).toEqual([
			"undiscovered",
			"discovered",
			"undiscovered",
			"undiscovered",
			"discovered",
			"current",
			...Array.from({ length: 7 }, () => "undiscovered"),
		]);
	});
});
