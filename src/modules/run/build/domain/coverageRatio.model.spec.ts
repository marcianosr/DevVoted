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
	clearsBar,
	coverageAfter,
	coverageMultiplierFor,
	coverageGainPercentFor,
	coverageMultiplierOf,
	floorAt,
	floorUnitsAt,
	focusBonusFor,
	gainPerCorrectFor,
	gatePayoutKb,
	healthyAt,
	healthyUnitsAt,
	isRunUnwinnable,
	maxReachableFrom,
	multiplierToClear,
	multiplierToSurvive,
	okAt,
	okDropAt,
	payoutRatioFor,
	meetsBand,
	bandOf,
	perfectBonusFor,
	readCoverage,
	rightsToClear,
	rightsToFill,
	rightsToSurvive,
	runCoverageOf,
	scoringSlotsAt,
	surplusPayoutKb,
	surplusUnits,
	survivesGate,
	unitsToRatio,
} from "./coverageRatio.model";

const EARLY = 2;
const LATE = VICTORY_GATE;
const BARE: readonly never[] = [];
const PACE = 4;
const GATES = Array.from({ length: VICTORY_GATE + 1 }, (_, gate) => gate);

const DOUBLER = [CONFIGS.agentsMd];
const TRIPLER = [CONFIGS.agentsMd, CONFIGS.intellisense];
const STACKED = [CONFIGS.agentsMd, CONFIGS.intellisense, CONFIGS.deprecated];

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

	/**
	 * The reason the bands cannot be fixed percentage points. A whole day moves
	 * the run score 5/65 at the champion; a band wider than five answers could
	 * not be crossed in a day, so the last gates could not change a run's
	 * standing at all.
	 */
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
		expect(gainPerCorrectFor(BARE)).toBe(BASE_UNIT);
	});

	it("pays the build multiplier on every answer alike", () => {
		expect(gainPerCorrectFor(DOUBLER)).toBeCloseTo(2);
		expect(gainPerCorrectFor(TRIPLER)).toBeCloseTo(3);
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
		expect(coverageGainPercentFor(gainPerCorrectFor(TRIPLER), 4)).toBeCloseTo(12);
	});

	it("is not the unit count itself, which reads a hundred times too high", () => {
		expect(coverageGainPercentFor(3, 4)).not.toBeCloseTo(300);
	});
});

describe("the headroom a single gate has", () => {
	/**
	 * The law the whole model turns on: entering gate g on coverage c, a gate
	 * earning M units an answer moves the score (M - c) / (g + 1). It decays,
	 * which is why the bands have to decay with it.
	 */
	const headroom = (
		banked: number,
		gate: number,
		configs: readonly Config[]
	): number =>
		coverageAfter(SLICE_WINDOW, gate, configs, banked) -
		runCoverageOf(banked, gate);

	it("matches (M - c) / (g + 1) on a bare build", () => {
		const gate = 4;
		const banked = 6.8;
		const entering = banked / (SLICE_WINDOW * gate);

		expect(entering).toBeCloseTo(0.34);
		expect(
			coverageAfter(SLICE_WINDOW, gate, BARE, banked) - entering
		).toBeCloseTo((BASE_UNIT - entering) / (gate + 1));
	});

	it("shrinks as the run lengthens", () => {
		expect(headroom(2, 1, BARE)).toBeGreaterThan(headroom(20, 9, BARE));
	});

	it("is what a multiplier buys: the same five answers move it further", () => {
		expect(headroom(6.8, 4, DOUBLER)).toBeGreaterThan(
			headroom(6.8, 4, BARE)
		);
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

describe("what a run still has in front of it", () => {
	it("counts every remaining poll at the build's rate", () => {
		expect(maxReachableFrom(60, VICTORY_GATE, BASE_UNIT)).toBeCloseTo(1);
	});

	it("calls a late run dead when its ceiling sits under the summit floor", () => {
		expect(isRunUnwinnable(30, 11, BASE_UNIT)).toBe(true);
	});

	it("spares the same run once a multiplier is on it", () => {
		expect(isRunUnwinnable(30, 11, 4)).toBe(false);
	});
});

describe("reading a gate", () => {
	it("cannot close on anyone while the floor is zero", () => {
		expect(survivesGate(0, 0)).toBe(true);
	});

	it("carries the slots it proved alongside the percentage", () => {
		const check = readCoverage(12, 0.5, 8);

		expect(check.coveredSlots).toBeCloseTo(6);
		expect(check.healthyOwed).toBeCloseTo(healthyAt(8) - 0.5);
	});

	it("clears on the line and survives on the floor", () => {
		expect(clearsBar(healthyAt(6), 6)).toBe(true);
		expect(survivesGate(floorAt(6), 6)).toBe(true);
		expect(clearsBar(okAt(6), 6)).toBe(false);
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

describe("the solvers the prep screen quotes", () => {
	it("says how many right answers clear a gate from where the run stands", () => {
		expect(rightsToClear(4, SLICE_WINDOW, BARE, 10)).toBeUndefined();
		expect(rightsToClear(4, SLICE_WINDOW, DOUBLER, 10)).toBe(3);
	});

	it("says how many keep it alive", () => {
		expect(rightsToSurvive(4, SLICE_WINDOW, BARE, 10)).toBe(2);
	});

	it("says when the bar can still be filled", () => {
		expect(rightsToFill(0, SLICE_WINDOW, BARE, 0)).toBe(SLICE_WINDOW);
		expect(rightsToFill(4, SLICE_WINDOW, BARE, 6.8)).toBeUndefined();
	});

	it("says what multiplier the gate in front is asking for", () => {
		expect(multiplierToSurvive(4, PACE, 10)).toBeCloseTo(0.5);
		expect(multiplierToClear(9, PACE, 20)).toBeCloseTo(5);
	});

	it("gives up when no multiplier can carry a gate with no right answers", () => {
		expect(multiplierToClear(LATE, 0, 0)).toBeUndefined();
	});
});

describe("focus", () => {
	it("pays its quarter only on its own category", () => {
		expect(coverageMultiplierFor([CONFIGS.js], "js")).toBeCloseTo(1.25);
		expect(coverageMultiplierFor([CONFIGS.js], "css")).toBeCloseTo(1);
	});

	it("reads as a bonus over whatever the build already pays", () => {
		expect(focusBonusFor([CONFIGS.js, CONFIGS.agentsMd], "js")).toBeCloseTo(
			1.25
		);
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

	/**
	 * Carries the ledger across gates, which is the whole point of the model:
	 * a gate is judged on the run behind it, not on its own five answers.
	 */
	const simulate = (
		configs: readonly Config[],
		accuracy: number,
		multiShare = 0
	) => {
		const roll = seededRolls(
			Math.round(
				coverageMultiplierOf(configs) * 7919 +
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
					// Short-circuits at multiShare 0 so an all-singles run keeps its roll stream.
					const multiple = multiShare > 0 && roll() < multiShare;
					units += gainPerCorrectFor(
						configs,
						undefined,
						multiple ? "multiple" : "single"
					);
				}

				const carried = banked + units;

				if (
					!meetsGateFloor(rights) ||
					!survivesGate(runCoverageOf(carried, gate), gate)
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

	/**
	 * Not quite zero since ADR-094 eased the late floor to yesterday's line:
	 * about one run in a thousand squeaks through on the poll order alone.
	 */
	it("walls a bare build at poor accuracy", () => {
		expect(simulate(BARE, 0.6).winRate).toBeLessThan(0.01);
	});

	/**
	 * The reversal ADR-073 Decision 3 chose against. A run-wide score cannot wall
	 * a bare build, because a player answering everything correctly earns one
	 * unit a slot and one unit a slot is 100%. Skill now substitutes for a build.
	 */
	it("lets skill alone summit, which the per-gate meter never did", () => {
		expect(simulate(BARE, 0.9).winRate).toBeGreaterThan(0.9);
	});

	it("opens the run for the average player who buys a multiplier", () => {
		expect(simulate(DOUBLER, 0.7).winRate).toBeGreaterThan(
			simulate(BARE, 0.7).winRate * 10
		);
	});

	/**
	 * The cap's bill. Coverage tops out at 100%, so the ladder can never ask for
	 * more than line / accuracy, which is about 1.4x at 70%. Every multiplier
	 * past that buys nothing, and x2, x3 and x6 land within noise of each other.
	 * This is the shape the memo calls "a percentage bar cannot be the
	 * difficulty dial", and it is asserted here so it cannot change in silence.
	 */
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

	/**
	 * The multiple-choice bonus is the largest difficulty dial in the model and
	 * the player does not hold it: the seed deals the mix. A bare build at 70%
	 * summits about 4% of all-singles runs and better than a third of runs once
	 * a quarter of the window asks for a set. Recorded so it cannot widen unseen.
	 */
	it("swings a near-walled bare build to winnable on the poll mix alone", () => {
		expect(simulate(BARE, 0.7).winRate).toBeLessThan(0.05);
		expect(simulate(BARE, 0.7, 0.25).winRate).toBeGreaterThan(0.3);
	});

	/**
	 * The same 100% cap that flattens the multiplier ladder flattens this one:
	 * past roughly half the window, the extra credit overflows into KB instead
	 * of coverage, so an all-multiple run is no safer than a half-multiple one.
	 */
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
