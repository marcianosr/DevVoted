import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
	meetsGateFloor,
} from "~/modules/run/run/domain/rules.model";
import {
	BASE_UNIT,
	GATE_RUNGS,
	KB_PER_PROVEN_SLOT,
	PAYOUT_RATIO_CAP,
	PERFECT_BONUS,
	atLeastBand,
	bandFor,
	bankableUnits,
	coverageGainPercentFor,
	floorAt,
	floorUnitsAt,
	gatePayoutKb,
	healthyAt,
	healthyUnitsAt,
	okAt,
	okDropAt,
	payoutRatioFor,
	meetsBand,
	bandOf,
	perfectBonusFor,
	runCoverageOf,
	scoringSlotsAt,
	surplusPayoutKb,
	surplusUnits,
	unitsToRatio,
} from "./coverageRatio.model";
import { answerPayoutFor, previewContextFor } from "./answerPayout.model";

const EARLY = 2;
const BARE: readonly never[] = [];
const GATES = Array.from({ length: VICTORY_GATE + 1 }, (_, gate) => gate);

const DOUBLER = [CONFIGS.agentsMd];
const TRIPLER = [CONFIGS.agentsMd, CONFIGS.intellisense];
const STACKED = [CONFIGS.agentsMd, CONFIGS.intellisense, CONFIGS.deprecated];

const unitsPerCorrect = (
	configs: readonly Config[],
	answerType: "single" | "multiple"
): number =>
	answerPayoutFor(
		configs,
		previewContextFor({ answeredBefore: 1, answerType }),
		1,
		0
	).earned;

const buildMultiplierOf = (configs: readonly Config[]): number =>
	answerPayoutFor(configs, previewContextFor({ answeredBefore: 1 }), 1, 0)
		.factors?.build ?? 1;


describe("the scoring slots", () => {
	it("opens on five and ends the run on sixty-five", () => {
		expect(scoringSlotsAt(0)).toBe(SLICE_WINDOW);
		expect(scoringSlotsAt(VICTORY_GATE)).toBe(65);
	});

	it("counts every gate so far, not just the one in front", () => {
		expect(scoringSlotsAt(4)).toBe(25);
		expect(scoringSlotsAt(9)).toBe(50);
	});
});

describe("the sliding ruler", () => {
	it("carries one rung per gate", () => {
		expect(GATE_RUNGS).toHaveLength(VICTORY_GATE + 1);
	});

	it("asks three of five at Pallet and nine in ten at the champion", () => {
		expect(healthyAt(0)).toBeCloseTo(0.6);
		expect(okAt(0)).toBeCloseTo(0.4);
		expect(floorAt(0)).toBe(0);
		expect(healthyAt(VICTORY_GATE)).toBeCloseTo(0.9);
	});

	it("never falls back a step", () => {
		const falling = GATES.filter(
			(gate) => gate > 0 && healthyAt(gate) < healthyAt(gate - 1)
		);

		expect(falling).toHaveLength(0);
	});

	it("never asks less of a day than it asked of the day before", () => {
		const stepAt = (gate: number) =>
			healthyUnitsAt(gate) - healthyUnitsAt(gate - 1);
		const shrinking = GATES.filter(
			(gate) => gate > 1 && stepAt(gate) < stepAt(gate - 1)
		);

		expect(shrinking).toHaveLength(0);
	});
});

describe("the bands are cut in answers, not points", () => {
	it("puts OK the gate's own drop under the line", () => {
		expect(healthyAt(4) - okAt(4)).toBeCloseTo(unitsToRatio(okDropAt(4), 4));
	});

	it("sets the floor where HEALTHY stood the day before", () => {
		const off = GATES.filter(
			(gate) => gate > 0 && floorUnitsAt(gate) !== healthyUnitsAt(gate - 1)
		);

		expect(off).toHaveLength(0);
		expect(floorAt(4)).toBeCloseTo(unitsToRatio(healthyUnitsAt(3), 4));
	});

	it("widens OK as the climb goes on, never narrowing it", () => {
		const narrowing = GATES.filter(
			(gate) => gate > 0 && okDropAt(gate) < okDropAt(gate - 1)
		);

		expect(narrowing).toHaveLength(0);
		expect(okDropAt(VICTORY_GATE)).toBeGreaterThan(okDropAt(0));
	});

	it("keeps a single day able to cross OK at every gate", () => {
		const walled = GATES.filter((gate) => okDropAt(gate) >= SLICE_WINDOW);

		expect(walled).toHaveLength(0);
	});

	it("draws no DANGER band at Pallet and one at every gate after", () => {
		const floorless = GATES.filter((gate) => gate > 0 && floorAt(gate) <= 0);

		expect(floorAt(0)).toBe(0);
		expect(floorless).toHaveLength(0);
	});

	it("never lets the lines cross", () => {
		const crossed = GATES.filter(
			(gate) => !(floorAt(gate) < okAt(gate) && okAt(gate) < healthyAt(gate))
		);

		expect(crossed).toHaveLength(0);
	});
});

describe("run coverage", () => {
	it("is the units banked over the slots played", () => {
		expect(runCoverageOf(6.8, 4)).toBeCloseTo(0.272);
		expect(runCoverageOf(11.8, 4)).toBeCloseTo(0.472);
	});

	it("caps at one however many units a build earns", () => {
		expect(runCoverageOf(40, 4)).toBe(1);
	});

	it("adds a flat unit per correct answer on a bare build", () => {
		expect(unitsPerCorrect(BARE, "single")).toBe(BASE_UNIT);
	});

	it("pays the build multiplier on every answer alike", () => {
		expect(unitsPerCorrect(DOUBLER, "single")).toBeCloseTo(2);
		expect(unitsPerCorrect(TRIPLER, "single")).toBeCloseTo(3);
	});
});

describe("what a unit moves the bar by", () => {
	it("is a fifth of the bar at the calibration gate, where five slots are open", () => {
		expect(coverageGainPercentFor(BASE_UNIT, 0)).toBeCloseTo(20);
	});

	it("shrinks as the climb opens slots, the unit itself never changing", () => {
		expect(coverageGainPercentFor(BASE_UNIT, 4)).toBeCloseTo(4);
		expect(coverageGainPercentFor(BASE_UNIT, 12)).toBeCloseTo(1.538);
	});

	it("scales with the build, so a tripler moves the bar three times as far", () => {
		expect(coverageGainPercentFor(unitsPerCorrect(TRIPLER, "single"), 4)).toBeCloseTo(12);
	});

	it("is not the unit count itself, which reads a hundred times too high", () => {
		expect(coverageGainPercentFor(3, 4)).not.toBeCloseTo(300);
	});
});

describe("banking at the gate boundary", () => {
	it("clamps the ledger to the slots played", () => {
		expect(bankableUnits(40, 4)).toBe(scoringSlotsAt(4));
		expect(bankableUnits(11.8, 4)).toBeCloseTo(11.8);
	});

	it("never banks a negative", () => {
		expect(bankableUnits(-3, 4)).toBe(0);
	});

	it("pays the overshoot in storage instead of coverage", () => {
		expect(surplusUnits(27.9, 4)).toBeCloseTo(2.9);
		expect(surplusPayoutKb(27.9, 4)).toBe(
			Math.round(2.9 * KB_PER_PROVEN_SLOT)
		);
	});

	it("pays nothing for an unfilled bar", () => {
		expect(surplusUnits(11.8, 4)).toBe(0);
		expect(surplusPayoutKb(11.8, 4)).toBe(0);
	});
});

describe("the bands a run lands in", () => {
	it("names a full bar PERFECT", () => {
		expect(bandFor(1, EARLY).id).toBe("perfect");
	});

	it("names the line HEALTHY and the step under it OK", () => {
		expect(bandFor(healthyAt(4), 4).id).toBe("healthy");
		expect(bandFor(okAt(4), 4).id).toBe("ok");
	});

	it("names the floor SHAKY and anything under it DANGER", () => {
		expect(bandFor(floorAt(4), 4).id).toBe("shaky");
		expect(bandFor(floorAt(4) - 0.01, 4).id).toBe("danger");
	});

	it("lifts a band to a floor without ever lowering one", () => {
		expect(atLeastBand(bandFor(0, 4), "shaky").id).toBe("shaky");
		expect(atLeastBand(bandFor(1, 4), "shaky").id).toBe("perfect");
	});
});

describe("what the gate pays", () => {
	it("pays the proven slots at the going rate", () => {
		expect(gatePayoutKb(healthyAt(4), 4, 12, 0)).toBe(
			Math.round(12 * KB_PER_PROVEN_SLOT)
		);
	});

	it("caps the overshoot so the opening gates cannot print", () => {
		expect(payoutRatioFor(1, 0)).toBe(PAYOUT_RATIO_CAP);
	});

	it("pays a full bar a bonus on top of the cap", () => {
		expect(perfectBonusFor(1)).toBe(PERFECT_BONUS);
		expect(perfectBonusFor(0.99)).toBe(1);
	});
});

describe("the balance this model exists to hold", () => {
	const TRIALS = 2000;
	const seededRolls = (seed: number) => {
		let state = seed;

		return () => {
			state = (state * 1664525 + 1013904223) % 4294967296;
			return state / 4294967296;
		};
	};

	const simulate = (
		configs: readonly Config[],
		accuracy: number,
		multiShare = 0
	) => {
		const roll = seededRolls(
			Math.round(
				buildMultiplierOf(configs) * 7919 +
					accuracy * 100 +
					multiShare * 31
			)
		);
		let wins = 0;
		let deepest = 0;

		for (let trial = 0; trial < TRIALS; trial++) {
			let gate = 0;
			let banked = 0;
			let alive = true;

			while (alive && gate <= VICTORY_GATE) {
				let rights = 0;
				let units = 0;

				for (let poll = 0; poll < SLICE_WINDOW; poll++) {
					if (roll() >= accuracy) continue;
					rights++;
					const multiple = multiShare > 0 && roll() < multiShare;
					units += unitsPerCorrect(configs, multiple ? "multiple" : "single");
				}

				const carried = banked + units;

				if (
					!meetsGateFloor(rights) ||
					bandFor(runCoverageOf(carried, gate), gate).id === "danger"
				) {
					alive = false;
				} else {
					banked = bankableUnits(carried, gate);
					gate++;
				}
			}

			deepest += gate;
			wins += alive ? 1 : 0;
		}

		return { winRate: wins / TRIALS, averageGate: deepest / TRIALS };
	};

	it("walls a bare build at poor accuracy", () => {
		expect(simulate(BARE, 0.6).winRate).toBeLessThan(0.01);
	});

	it("lets skill alone summit, which the per-gate meter never did", () => {
		expect(simulate(BARE, 0.9).winRate).toBeGreaterThan(0.9);
	});

	it("opens the run for the average player who buys a multiplier", () => {
		expect(simulate(DOUBLER, 0.7).winRate).toBeGreaterThan(
			simulate(BARE, 0.7).winRate * 10
		);
	});

	it("stops paying for multiplier once the cap binds", () => {
		const doubled = simulate(DOUBLER, 0.7).winRate;
		const stacked = simulate(STACKED, 0.7).winRate;

		expect(Math.abs(stacked - doubled)).toBeLessThan(0.05);
	});

	it("still asks for accuracy once the multipliers are there", () => {
		expect(simulate(STACKED, 0.9).winRate).toBeGreaterThan(
			simulate(STACKED, 0.7).winRate
		);
	});

	it("cannot be brute forced by stacking alone at poor accuracy", () => {
		expect(simulate(STACKED, 0.6).winRate).toBeLessThan(0.5);
	});

	it("swings a near-walled bare build to winnable on the poll mix alone", () => {
		expect(simulate(BARE, 0.7).winRate).toBeLessThan(0.05);
		expect(simulate(BARE, 0.7, 0.25).winRate).toBeGreaterThan(0.3);
	});

	it("stops paying for poll mix once the cap binds", () => {
		const half = simulate(BARE, 0.75, 0.5).winRate;
		const every = simulate(BARE, 0.75, 1).winRate;

		expect(Math.abs(every - half)).toBeLessThan(0.1);
	});
});

describe(meetsBand, () => {
	it("holds a band against itself", () => {
		expect(meetsBand(bandOf("healthy"), "healthy")).toBe(true);
	});

	it("holds a better band against a lesser promise", () => {
		expect(meetsBand(bandOf("perfect"), "ok")).toBe(true);
	});

	it("refuses a band under the one promised", () => {
		expect(meetsBand(bandOf("ok"), "healthy")).toBe(false);
		expect(meetsBand(bandOf("shaky"), "ok")).toBe(false);
	});

	it("is the predicate the clamp is built on", () => {
		expect(atLeastBand(bandOf("danger"), "shaky")).toEqual(bandOf("shaky"));
		expect(atLeastBand(bandOf("perfect"), "shaky")).toEqual(bandOf("perfect"));
	});
});
