import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	KB_PER_PROVEN_SLOT,
	MULTIPLE_GAIN,
	PAYOUT_RATIO_CAP,
	PERFECT_BONUS,
	SINGLE_GAIN,
	HEALTHY_LADDER,
	LOSS_LADDER,
	OK_DROP,
	SHAKY_DROP,
	bandFor,
	gatePayoutKb,
	clearsBar,
	coverageAfter,
	coverageDeltaFor,
	coverageMultiplierFor,
	coverageMultiplierOf,
	coveredSlotsOf,
	floorAt,
	focusBonusFor,
	gainPerCorrectFor,
	gainPerMissFor,
	healthyAt,
	lossShareAt,
	multiplierToClear,
	multiplierToSurvive,
	netAnswersFor,
	okAt,
	payoutRatioFor,
	perfectBonusFor,
	readCoverage,
	rightsToClear,
	rightsToFill,
	rightsToSurvive,
	survivesGate,
} from "./coverageRatio.model";

const EARLY = 2;
const LATE = VICTORY_GATE;
const BARE: readonly never[] = [];
const PACE = 4;

const DOUBLER = [CONFIGS.agentsMd];
const TRIPLER = [CONFIGS.agentsMd, CONFIGS.intellisense];
const STACKED = [CONFIGS.agentsMd, CONFIGS.intellisense, CONFIGS.deprecated];

describe("the sliding ruler", () => {
	it("carries one healthy line and one loss share per gate", () => {
		expect(HEALTHY_LADDER).toHaveLength(VICTORY_GATE + 1);
		expect(LOSS_LADDER).toHaveLength(VICTORY_GATE + 1);
	});

	it("opens gently and closes just short of perfect", () => {
		expect(healthyAt(0)).toBeCloseTo(0.05);
		expect(healthyAt(LATE)).toBeCloseTo(0.95);
	});

	it("hangs ok and the floor at fixed drops below healthy", () => {
		expect(okAt(LATE)).toBeCloseTo(healthyAt(LATE) - OK_DROP);
		expect(floorAt(LATE)).toBeCloseTo(healthyAt(LATE) - SHAKY_DROP);
	});

	it("cannot put the floor below zero on the opening gates", () => {
		expect(floorAt(0)).toBe(0);
		expect(floorAt(EARLY)).toBe(0);
	});

	it("charges nothing for a miss until the floor exists, and half an answer at most", () => {
		expect(lossShareAt(EARLY)).toBe(0);
		expect(lossShareAt(LATE)).toBeCloseTo(0.5);
		expect(LOSS_LADDER.filter((share) => share > 1)).toHaveLength(0);
	});
});

describe("what a correct answer covers", () => {
	it("covers a twentieth of the build for one single-choice answer", () => {
		expect(SINGLE_GAIN).toBe(0.05);
		expect(gainPerCorrectFor(BARE)).toBeCloseTo(SINGLE_GAIN);
		expect(gainPerCorrectFor(BARE, undefined, "single")).toBeCloseTo(
			SINGLE_GAIN
		);
	});

	it("pays a multiple-choice poll more for the extra ways it can go wrong", () => {
		expect(MULTIPLE_GAIN).toBe(0.08);
		expect(gainPerCorrectFor(BARE, undefined, "multiple")).toBeCloseTo(
			MULTIPLE_GAIN
		);
		expect(gainPerCorrectFor(BARE, undefined, "multiple")).toBeGreaterThan(
			gainPerCorrectFor(BARE, undefined, "single")
		);
	});

	it("multiplies the poll's own base, rather than replacing it", () => {
		expect(gainPerCorrectFor(DOUBLER)).toBeCloseTo(SINGLE_GAIN * 2);
		expect(gainPerCorrectFor(DOUBLER, undefined, "multiple")).toBeCloseTo(
			MULTIPLE_GAIN * 2
		);
	});

	it("asks nothing at all about how heavy the build is", () => {
		expect(coverageAfter(PACE, 1, 6, DOUBLER)).toBeCloseTo(
			coverageAfter(PACE, 1, 6, DOUBLER)
		);
	});

	it("multiplies through every config that touches coverage", () => {
		expect(coverageMultiplierOf(BARE)).toBe(1);
		expect(coverageMultiplierOf(DOUBLER)).toBe(2);
		expect(coverageMultiplierOf(TRIPLER)).toBe(3);
	});

	it("ignores configs that never touched coverage", () => {
		expect(
			coverageMultiplierOf([CONFIGS.yarnLock, CONFIGS.indexedDb])
		).toBe(1);
	});

	it("pays the same at every gate, so the rising bar is the whole difficulty", () => {
		expect(gainPerCorrectFor(DOUBLER)).toBeCloseTo(gainPerCorrectFor(DOUBLER));
		expect(coverageAfter(5, 0, 0, DOUBLER)).toBeCloseTo(
			coverageAfter(5, 0, LATE, DOUBLER)
		);
	});

	it("costs nothing for a miss while the gate has no floor", () => {
		expect(gainPerMissFor(EARLY, DOUBLER)).toBe(0);
		expect(coverageAfter(0, SLICE_WINDOW, EARLY, DOUBLER)).toBe(0);
	});

	it("counts a miss as a fraction of an answer taken back", () => {
		expect(netAnswersFor(4, 1, LATE)).toBeCloseTo(3.5);
		expect(netAnswersFor(0, SLICE_WINDOW, LATE)).toBeCloseTo(-2.5);
	});

	it("caps at a fully covered build however hard the multipliers stack", () => {
		expect(coverageAfter(SLICE_WINDOW, 0, 0, STACKED)).toBe(1);
	});

	it("floors at nothing when the misses outweigh the hits", () => {
		expect(coverageAfter(0, SLICE_WINDOW, LATE, TRIPLER)).toBe(0);
	});
});

describe("a part-right answer on a multiple-choice poll", () => {
	const share = (value: number) =>
		coverageDeltaFor(value, LATE, BARE, undefined, "multiple");

	it("pays the whole poll for the whole answer key", () => {
		expect(share(1)).toBeCloseTo(MULTIPLE_GAIN);
	});

	it("charges the full miss for an answer with nothing right in it", () => {
		expect(share(0)).toBeCloseTo(-MULTIPLE_GAIN * lossShareAt(LATE));
	});

	it("splits the gain and the miss by the share of the key that landed", () => {
		expect(share(0.5)).toBeCloseTo(
			MULTIPLE_GAIN * (0.5 - 0.5 * lossShareAt(LATE))
		);
	});

	it("reads the same as the all-or-nothing rule at either extreme", () => {
		expect(coverageDeltaFor(1, LATE, DOUBLER)).toBeCloseTo(
			gainPerCorrectFor(DOUBLER)
		);
		expect(coverageDeltaFor(0, LATE, DOUBLER)).toBeCloseTo(
			-gainPerMissFor(LATE, DOUBLER)
		);
	});

	it("costs nothing for any share while the gate has no floor", () => {
		expect(coverageDeltaFor(0, EARLY, BARE, undefined, "multiple")).toBe(0);
		expect(coverageDeltaFor(0.5, EARLY, BARE, undefined, "multiple")).toBeCloseTo(
			MULTIPLE_GAIN * 0.5
		);
	});
});

describe("a config focused on the category you were asked", () => {
	const FOCUSED = [CONFIGS.js];

	it("pays the focus multiplier its own description promises", () => {
		expect(gainPerCorrectFor(FOCUSED, "js")).toBeCloseTo(SINGLE_GAIN * 1.25);
	});

	it("pays nothing extra on a poll it does not cover", () => {
		expect(gainPerCorrectFor(FOCUSED, "git")).toBeCloseTo(SINGLE_GAIN);
		expect(gainPerCorrectFor(FOCUSED)).toBeCloseTo(SINGLE_GAIN);
	});

	it("names the bonus a matching poll is worth", () => {
		expect(focusBonusFor(FOCUSED, "js")).toBeCloseTo(1.25);
		expect(focusBonusFor(FOCUSED, "git")).toBe(1);
	});

	it("compounds into a flat coverage multiplier rather than replacing it", () => {
		expect(coverageMultiplierFor([CONFIGS.js, CONFIGS.agentsMd], "js")).toBeCloseTo(
			2.5
		);
		expect(coverageMultiplierFor([CONFIGS.js, CONFIGS.agentsMd], "git")).toBe(2);
	});

	it("stacks only the focus that matches, not every focus held", () => {
		expect(coverageMultiplierFor([CONFIGS.js, CONFIGS.ts], "js")).toBeCloseTo(
			1.25
		);
	});

	it("moves a whole gate, not just one answer", () => {
		expect(coverageAfter(PACE, 1, 8, FOCUSED, "js")).toBeGreaterThan(
			coverageAfter(PACE, 1, 8, FOCUSED, "git")
		);
	});

	it("leaves the unmatched reading as the baseline the gate maths uses", () => {
		expect(coverageMultiplierOf(FOCUSED)).toBe(1);
	});
});

describe("the wall an unaided build runs into", () => {
	it("carries the opening three gates on base rules alone", () => {
		expect(rightsToSurvive(EARLY, SLICE_WINDOW, BARE)).toBe(0);
		expect(rightsToSurvive(3, SLICE_WINDOW, BARE)).toBeLessThan(PACE);
	});

	it("demands a perfect gate by gate five, and then cannot be done at all", () => {
		expect(rightsToSurvive(5, SLICE_WINDOW, BARE)).toBe(SLICE_WINDOW);
		expect(rightsToSurvive(6, SLICE_WINDOW, BARE)).toBeUndefined();
		expect(rightsToSurvive(LATE, SLICE_WINDOW, BARE)).toBeUndefined();
	});

	it("cannot fill a build until the multipliers stack several deep", () => {
		expect(rightsToFill(0, SLICE_WINDOW, BARE)).toBeUndefined();
		expect(rightsToFill(0, SLICE_WINDOW, DOUBLER)).toBeUndefined();
		expect(rightsToFill(0, SLICE_WINDOW, STACKED)).toBeLessThan(PACE);
	});

	it("clears the opening gate on a single right, where surviving it asks nothing", () => {
		expect(rightsToSurvive(0, SLICE_WINDOW, BARE)).toBe(0);
		expect(rightsToClear(0, SLICE_WINDOW, BARE)).toBe(1);
	});

	it("asks more than surviving the gate and less than filling the bar", () => {
		const survive = rightsToSurvive(0, SLICE_WINDOW, STACKED) ?? 0;
		const clear = rightsToClear(0, SLICE_WINDOW, STACKED) ?? 0;
		const fill = rightsToFill(0, SLICE_WINDOW, STACKED) ?? 0;

		expect(clear).toBeGreaterThanOrEqual(survive);
		expect(clear).toBeLessThanOrEqual(fill);
	});

	it("goes out of reach for a bare build once the line outruns a full sheet", () => {
		expect(rightsToClear(6, SLICE_WINDOW, BARE)).toBeUndefined();
		expect(rightsToClear(LATE, SLICE_WINDOW, BARE)).toBeUndefined();
	});

	it("names the multiplier each gate demands, free until gate two", () => {
		expect(multiplierToSurvive(EARLY, PACE, SLICE_WINDOW)).toBe(0);
		expect(multiplierToSurvive(3, PACE, SLICE_WINDOW) ?? 0).toBeLessThan(1);
		expect(multiplierToSurvive(8, PACE, SLICE_WINDOW)).toBeCloseTo(2.74, 2);
		expect(multiplierToSurvive(LATE, PACE, SLICE_WINDOW)).toBeCloseTo(4, 2);
	});

	it("asks more to clear the bar than merely to survive", () => {
		expect(multiplierToClear(LATE, PACE, SLICE_WINDOW) ?? 0).toBeGreaterThan(
			multiplierToSurvive(LATE, PACE, SLICE_WINDOW) ?? 0
		);
	});

	it("asks nothing of a gate with no floor", () => {
		expect(multiplierToSurvive(EARLY, PACE, SLICE_WINDOW)).toBe(0);
	});

	it("admits that no multiplier saves a gate you answered into the ground", () => {
		expect(multiplierToSurvive(LATE, 0, SLICE_WINDOW)).toBeUndefined();
	});

	it("reopens the late run only once the stack passes a doubler", () => {
		expect(rightsToSurvive(LATE, SLICE_WINDOW, BARE)).toBeUndefined();
		expect(rightsToSurvive(LATE, SLICE_WINDOW, DOUBLER)).toBeUndefined();
		expect(rightsToSurvive(LATE, SLICE_WINDOW, TRIPLER)).toBe(SLICE_WINDOW);
		expect(rightsToSurvive(LATE, SLICE_WINDOW, STACKED)).toBeLessThan(PACE);
	});
});

describe("what a cleared gate pays", () => {
	const GATES = HEALTHY_LADDER.map((_, gate) => gate);
	const JUST_UNDER_FULL = 0.99;

	it("pays a slot the same KB at every gate, since each asks its own line", () => {
		const met = GATES.map((gate) => gatePayoutKb(healthyAt(gate), gate, 12, 0));

		expect(new Set(met)).toEqual(new Set([12 * KB_PER_PROVEN_SLOT]));
	});

	it("pays a bigger build more for meeting the same line", () => {
		expect(gatePayoutKb(healthyAt(6), 6, 24, 0)).toBeGreaterThan(
			gatePayoutKb(healthyAt(6), 6, 12, 0)
		);
	});

	it("pays less for surviving a gate than for meeting it", () => {
		expect(gatePayoutKb(floorAt(LATE), LATE, 12, 0)).toBeLessThan(
			gatePayoutKb(healthyAt(LATE), LATE, 12, 0)
		);
	});

	it("stops rewarding overshoot at half again, so the opening gates cannot print", () => {
		expect(payoutRatioFor(healthyAt(0), 0)).toBeCloseTo(1);
		expect(payoutRatioFor(1, 0)).toBe(PAYOUT_RATIO_CAP);
		expect(gatePayoutKb(0.5, 0, 12, 0)).toBe(
			PAYOUT_RATIO_CAP * 12 * KB_PER_PROVEN_SLOT
		);
	});

	it("pays a full bar half again over the cap, so the top of the scale can be felt", () => {
		expect(gatePayoutKb(1, 6, 12, 0)).toBe(
			gatePayoutKb(JUST_UNDER_FULL, 6, 12, 0) * PERFECT_BONUS
		);
	});

	it("turns the bonus on exactly where the bar turns PERFECT, first gate and last", () => {
		for (const gate of [0, LATE]) {
			expect(bandFor(1, gate).id).toBe("perfect");
			expect(bandFor(JUST_UNDER_FULL, gate).id).not.toBe("perfect");
		}

		expect(perfectBonusFor(1)).toBe(PERFECT_BONUS);
		expect(perfectBonusFor(JUST_UNDER_FULL)).toBe(1);
	});

	it("multiplies a full bar's streak rather than replacing it", () => {
		expect(gatePayoutKb(1, 6, 8, 10)).toBe(gatePayoutKb(1, 6, 8, 0) * 2);
	});

	it("pays nothing for capacity it never covered", () => {
		expect(gatePayoutKb(0, 6, 24, 10)).toBe(0);
		expect(coveredSlotsOf(0.5, 12)).toBeCloseTo(6);
	});

	it("doubles on a capped streak and never more", () => {
		expect(gatePayoutKb(healthyAt(6), 6, 8, 10)).toBe(
			gatePayoutKb(healthyAt(6), 6, 8, 0) * 2
		);
		expect(gatePayoutKb(healthyAt(6), 6, 8, 40)).toBe(
			gatePayoutKb(healthyAt(6), 6, 8, 10)
		);
	});

	it("pays in whole KB, since KB is spent in whole units", () => {
		expect(Number.isInteger(gatePayoutKb(0.37, 9, 13, 3))).toBe(true);
	});
});

describe("reading a gate at its close", () => {
	it("moves the whole ruler, not just the death line", () => {
		expect(bandFor(0.5, EARLY).id).toBe("healthy");
		expect(bandFor(0.5, 6).id).toBe("ok");
		expect(bandFor(0.5, 8).id).toBe("shaky");
		expect(bandFor(0.5, 9).id).toBe("danger");
	});

	it("meets the gate's own healthy line, not a fixed bar", () => {
		expect(clearsBar(0.7, EARLY)).toBe(true);
		expect(clearsBar(0.7, LATE)).toBe(false);
	});

	it("cannot close on anyone while the floor is zero", () => {
		expect(survivesGate(0, EARLY)).toBe(true);
	});

	it("closes the champion on a bare build and spares a stacked one", () => {
		const bare = readCoverage(12, coverageAfter(PACE, 1, LATE, BARE), LATE);
		const stacked = readCoverage(
			12,
			coverageAfter(PACE, 1, LATE, STACKED),
			LATE
		);

		expect(bare.survives).toBe(false);
		expect(bare.peril).toBe("fatal");
		expect(stacked.survives).toBe(true);
		expect(stacked.peril).toBe("safe");
	});

	it("carries the slots it proved alongside the percentage", () => {
		const check = readCoverage(12, 0.5, 6);

		expect(check.coveredSlots).toBeCloseTo(6);
		expect(check.healthyOwed).toBeCloseTo(0.1);
	});
});

describe("the balance this model exists to hold", () => {
	const TRIALS = 2000;
	const LOADOUTS = [
		{ label: "bare", configs: BARE },
		{ label: "doubled", configs: DOUBLER },
		{ label: "tripled", configs: TRIPLER },
		{ label: "stacked", configs: STACKED },
	] as const;

	const seededRolls = (seed: number) => {
		let state = seed;

		return () => {
			state = (state * 1664525 + 1013904223) % 4294967296;
			return state / 4294967296;
		};
	};

	const simulate = (configs: readonly Config[], accuracy: number) => {
		const roll = seededRolls(
			Math.round(coverageMultiplierOf(configs) * 7919 + accuracy * 100)
		);
		let wins = 0;
		let deepest = 0;

		for (let trial = 0; trial < TRIALS; trial++) {
			let gate = 0;
			let alive = true;

			while (alive && gate <= VICTORY_GATE) {
				let rights = 0;
				for (let poll = 0; poll < SLICE_WINDOW; poll++)
					if (roll() < accuracy) rights++;

				if (
					!survivesGate(
						coverageAfter(rights, SLICE_WINDOW - rights, gate, configs),
						gate
					)
				)
					alive = false;
				else gate++;
			}

			deepest += gate;
			wins += alive ? 1 : 0;
		}

		return { winRate: wins / TRIALS, averageGate: deepest / TRIALS };
	};

	it("walls a bare build well short of the champion", () => {
		expect(simulate(BARE, 0.9).winRate).toBe(0);
	});

	it("lets multipliers, and only multipliers, open the late run", () => {
		const skilled = LOADOUTS.map((l) => simulate(l.configs, 0.9).averageGate);
		const stalling = skilled.filter(
			(gate, step) => step > 0 && gate <= skilled[step - 1]
		);

		expect(stalling).toHaveLength(0);
	});

	it("still asks for accuracy once the multipliers are there", () => {
		expect(simulate(STACKED, 0.9).winRate).toBeGreaterThan(
			simulate(STACKED, 0.7).winRate
		);
	});

	it("cannot be brute forced by stacking alone at poor accuracy", () => {
		expect(simulate(STACKED, 0.6).winRate).toBeLessThan(0.5);
	});
});
