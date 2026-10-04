import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	BASE_UNIT,
	GATE_RUNGS,
	HEAD_START_SHARE,
	KB_PER_EXTRA_BAR,
	KB_PER_PROVEN_SLOT,
	MULTIPLE_CREDIT,
	PAYOUT_RATIO_CAP,
	PERFECT_BONUS,
	SINGLE_CREDIT,
	ACCURACY_GAIN_PER_GATE,
	ACCURACY_LOSS_PER_GATE,
	accuracyBonusAfter,
	accuracyMultiplierFor,
	atLeastBand,
	bandFor,
	coverageGainPercentFor,
	floorAt,
	gateOutputOf,
	gatePayoutKb,
	headStartFor,
	healthyAt,
	healthyUnitsAt,
	okAt,
	payoutRatioFor,
	meetsBand,
	bandOf,
	perfectBonusFor,
	runCoverageOf,
	runShareOf,
	scoringSlotsAt,
	surplusPayoutKb,
	surplusUnits,
} from "./coverageRatio.model";
import { answerPayoutFor, previewContextFor } from "./answerPayout.model";
import { clearsAt } from "~/modules/run/gate/domain/gate.model";

const EARLY = 2;
const INDIGO_ELITE = 11;
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

describe("the codebase each gate asks for", () => {
	it("ships five changes at Pallet and ten at the Champion", () => {
		expect(scoringSlotsAt(0)).toBe(5);
		expect(scoringSlotsAt(VICTORY_GATE)).toBe(10);
	});

	it("carries one rung per gate", () => {
		expect(GATE_RUNGS).toHaveLength(VICTORY_GATE + 1);
	});

	it("never shrinks from one gate to the next", () => {
		const shrinking = GATES.filter(
			(gate) => gate > 0 && scoringSlotsAt(gate) < scoringSlotsAt(gate - 1)
		);

		expect(shrinking).toHaveLength(0);
	});

	it("asks only this gate's window, never the gates before it", () => {
		expect(scoringSlotsAt(4)).toBeLessThan(SLICE_WINDOW * 2);
	});
});

describe("the band lines", () => {
	it("draws no DANGER at Pallet and SHAKY up to fifty-two percent", () => {
		expect(floorAt(0)).toBe(0);
		expect(okAt(0)).toBeCloseTo(0.52);
		expect(healthyAt(0)).toBeCloseTo(0.64);
	});

	it("ends DANGER at seventy-six percent at Indigo Elite, with six-point SHAKY and OK bands", () => {
		expect(floorAt(INDIGO_ELITE)).toBeCloseTo(0.76);
		expect(okAt(INDIGO_ELITE)).toBeCloseTo(0.82);
		expect(healthyAt(INDIGO_ELITE)).toBeCloseTo(0.88);
	});

	it("asks ninety percent for HEALTHY at the Champion", () => {
		expect(healthyAt(VICTORY_GATE)).toBeCloseTo(0.9);
	});

	it("draws a DANGER band at every gate after Pallet", () => {
		const floorless = GATES.filter((gate) => gate > 0 && floorAt(gate) <= 0);

		expect(floorless).toHaveLength(0);
	});

	it("never lowers a line as the climb goes on", () => {
		const falling = GATES.filter(
			(gate) =>
				gate > 0 &&
				(floorAt(gate) < floorAt(gate - 1) ||
					okAt(gate) < okAt(gate - 1) ||
					healthyAt(gate) < healthyAt(gate - 1))
		);

		expect(falling).toHaveLength(0);
	});

	it("narrows SHAKY and OK as the climb goes on, never widening them", () => {
		const widthsAt = (gate: number) => ({
			shaky: okAt(gate) - floorAt(gate),
			ok: healthyAt(gate) - okAt(gate),
		});
		const widening = GATES.filter(
			(gate) =>
				gate > 0 &&
				(widthsAt(gate).shaky > widthsAt(gate - 1).shaky + 0.001 ||
					widthsAt(gate).ok > widthsAt(gate - 1).ok + 0.001)
		);

		expect(widening).toHaveLength(0);
	});

	it("never lets the lines cross", () => {
		const crossed = GATES.filter(
			(gate) => !(floorAt(gate) < okAt(gate) && okAt(gate) < healthyAt(gate))
		);

		expect(crossed).toHaveLength(0);
	});

	it("lets a bare build that carried a flawless run reach HEALTHY at the Champion", () => {
		const carried = GATES.slice(0, VICTORY_GATE).reduce(
			(bonus) => accuracyBonusAfter(bonus, singles(SLICE_WINDOW)),
			0
		);
		const perfectBareWindow =
			SLICE_WINDOW *
			BASE_UNIT *
			accuracyMultiplierFor(carried, singles(SLICE_WINDOW));

		expect(
			runCoverageOf(perfectBareWindow, VICTORY_GATE)
		).toBeGreaterThanOrEqual(healthyAt(VICTORY_GATE));
	});

	it("states the HEALTHY line in units of the gate's codebase", () => {
		expect(healthyUnitsAt(INDIGO_ELITE)).toBeCloseTo(0.88 * scoringSlotsAt(INDIGO_ELITE));
	});
});

const singles = (count: number) => ({
	earned: count * SINGLE_CREDIT,
	available: SLICE_WINDOW * SINGLE_CREDIT,
});

const GAIN_PER_RIGHT = ACCURACY_GAIN_PER_GATE / SLICE_WINDOW;
const LOSS_PER_MISS = ACCURACY_LOSS_PER_GATE / SLICE_WINDOW;

describe(accuracyBonusAfter, () => {
	it("grows a fresh run's bonus by the whole gain on a perfect window", () => {
		expect(accuracyBonusAfter(0, singles(5))).toBeCloseTo(
			ACCURACY_GAIN_PER_GATE
		);
	});

	it("adds a fifth of the gain per right single and takes a fifth of the loss per miss", () => {
		expect(accuracyBonusAfter(0.4, singles(3))).toBeCloseTo(
			0.4 + 3 * GAIN_PER_RIGHT - 2 * LOSS_PER_MISS
		);
	});

	it("takes the whole loss from a carried bonus on a window with no right answers", () => {
		expect(accuracyBonusAfter(0.4, singles(0))).toBeCloseTo(
			0.4 - ACCURACY_LOSS_PER_GATE
		);
	});

	it("loses half as fast as it gains, so a miss costs less than a right answer earns", () => {
		expect(LOSS_PER_MISS).toBeCloseTo(GAIN_PER_RIGHT / 2);
	});

	it("never takes the bonus below zero", () => {
		expect(accuracyBonusAfter(0, singles(0))).toBe(0);
		expect(accuracyBonusAfter(ACCURACY_LOSS_PER_GATE / 2, singles(0))).toBe(0);
	});

	it("leaves the bonus where it stood when nothing was available, as when every poll was skipped", () => {
		expect(accuracyBonusAfter(0.4, { earned: 0, available: 0 })).toBe(0.4);
	});

	it("reads a mixed window by what it earned of what it offered", () => {
		const share = 5 / 7;

		expect(accuracyBonusAfter(0, { earned: 5, available: 7 })).toBeCloseTo(
			ACCURACY_GAIN_PER_GATE * share - ACCURACY_LOSS_PER_GATE * (1 - share)
		);
	});

	it("needs a whole run of perfect gates to come near doubling", () => {
		const carried = GATES.reduce(
			(bonus) => accuracyBonusAfter(bonus, singles(SLICE_WINDOW)),
			0
		);

		expect(1 + carried).toBeCloseTo(1 + GATES.length * ACCURACY_GAIN_PER_GATE);
		expect(1 + carried).toBeLessThan(2.1);
	});
});

describe(accuracyMultiplierFor, () => {
	it("multiplies a perfect first window by one plus the gain", () => {
		expect(accuracyMultiplierFor(0, singles(SLICE_WINDOW))).toBeCloseTo(
			1 + ACCURACY_GAIN_PER_GATE
		);
	});

	it("leaves a fresh run's window with no right answers at one", () => {
		expect(accuracyMultiplierFor(0, singles(0))).toBe(1);
	});

	it("counts the window it closes on top of the carried bonus", () => {
		expect(accuracyMultiplierFor(0.4, singles(SLICE_WINDOW))).toBeCloseTo(
			1.4 + ACCURACY_GAIN_PER_GATE
		);
	});
});

describe(gateOutputOf, () => {
	it("multiplies the summed poll output by the carried accuracy", () => {
		expect(gateOutputOf(12, 0.4, singles(SLICE_WINDOW))).toBeCloseTo(
			12 * (1.4 + ACCURACY_GAIN_PER_GATE)
		);
	});

	it("pays a fresh window with no right answers only what its polls produced", () => {
		expect(gateOutputOf(0.3, 0, singles(0))).toBeCloseTo(0.3);
	});

	it("lets a build amplify accuracy without ever replacing it", () => {
		const doubledTwoRight = gateOutputOf(
			2 * unitsPerCorrect(DOUBLER, "single"),
			0,
			singles(2)
		);
		const bareTwoRight = gateOutputOf(
			2 * unitsPerCorrect(BARE, "single"),
			0,
			singles(2)
		);

		expect(doubledTwoRight / bareTwoRight).toBeCloseTo(2);
	});
});

describe("run coverage", () => {
	it("is the gate's output over the gate's codebase", () => {
		expect(runCoverageOf(3, 4)).toBeCloseTo(3 / scoringSlotsAt(4));
	});

	it("caps at one however much a build outputs", () => {
		expect(runCoverageOf(40, 4)).toBe(1);
	});

	it("adds a flat unit per correct answer on a bare build", () => {
		expect(unitsPerCorrect(BARE, "single")).toBe(BASE_UNIT);
	});

	it("pays the build multiplier on every answer alike", () => {
		expect(unitsPerCorrect(DOUBLER, "single")).toBeCloseTo(2);
		expect(unitsPerCorrect(TRIPLER, "single")).toBeCloseTo(2.5);
	});
});

describe(runShareOf, () => {
	it("reads a run's lifetime units over every gate's codebase it played", () => {
		const playedThroughLavender = [0, 1, 2, 3, 4]
			.map(scoringSlotsAt)
			.reduce((sum, slots) => sum + slots, 0);

		expect(runShareOf(11, 4)).toBeCloseTo(11 / playedThroughLavender);
	});

	it("caps at one however much the run earned", () => {
		expect(runShareOf(999, 4)).toBe(1);
	});
});

describe("what a unit moves the bar by", () => {
	it("is a fifth of the bar at Pallet, where the gate ships five changes", () => {
		expect(coverageGainPercentFor(BASE_UNIT, 0)).toBeCloseTo(20);
	});

	it("fills Pallet's bar for a bare build only on a flawless window, since a fresh run carries no bonus", () => {
		const bareWindow = (right: number) =>
			gateOutputOf(right * BASE_UNIT, 0, singles(right));

		expect(bandFor(runCoverageOf(bareWindow(3), 0), 0).id).toBe("ok");
		expect(bandFor(runCoverageOf(bareWindow(4), 0), 0).id).toBe("healthy");
		expect(bandFor(runCoverageOf(bareWindow(5), 0), 0).id).toBe("perfect");
	});

	it("shrinks as the codebase grows, the unit itself never changing", () => {
		expect(coverageGainPercentFor(BASE_UNIT, VICTORY_GATE)).toBeCloseTo(10);
	});

	it("scales with the build, so AGENTS.md and Intellisense move the bar 2.5 times as far", () => {
		expect(
			coverageGainPercentFor(unitsPerCorrect(TRIPLER, "single"), 4)
		).toBeCloseTo(2.5 * coverageGainPercentFor(BASE_UNIT, 4));
	});
});

describe("the gate boundary", () => {
	it("pays the overshoot in storage instead of coverage", () => {
		const over = scoringSlotsAt(4) + 2.5;

		expect(surplusUnits(over, 4)).toBeCloseTo(2.5);
	});

	it("pays each full bar past the demand the same KB at every gate", () => {
		const twoBarsOver = (gate: number) => scoringSlotsAt(gate) * 3;

		expect(surplusPayoutKb(twoBarsOver(0), 0)).toBe(2 * KB_PER_EXTRA_BAR);
		expect(surplusPayoutKb(twoBarsOver(VICTORY_GATE), VICTORY_GATE)).toBe(
			2 * KB_PER_EXTRA_BAR
		);
	});

	it("pays nothing for an unfilled bar", () => {
		expect(surplusUnits(1, 4)).toBe(0);
		expect(surplusPayoutKb(1, 4)).toBe(0);
	});

	it("opens the next gate with a tenth of the overshoot", () => {
		expect(headStartFor(scoringSlotsAt(4) + 5, 4)).toBeCloseTo(
			5 * HEAD_START_SHARE
		);
	});

	it("opens the next gate empty after a close under a full bar", () => {
		expect(headStartFor(1, 4)).toBe(0);
	});

	it("never carries more than the next gate's floor, so a head start alone cannot clear it", () => {
		const huge = scoringSlotsAt(4) * 100;

		expect(headStartFor(huge, 4)).toBeCloseTo(floorAt(5) * scoringSlotsAt(5));
		expect(bandFor(runCoverageOf(headStartFor(huge, 4), 5), 5).id).toBe(
			"shaky"
		);
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
		expect(gatePayoutKb(healthyAt(4), 4, 12)).toBe(
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
	const HOLDS_BEFORE_THE_RUN_ENDS = 2;
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
			let headStart = 0;
			let accuracyBonus = 0;
			let holds = 0;
			let alive = true;

			while (alive && gate <= VICTORY_GATE) {
				let units = 0;
				const tally = { earned: 0, available: 0 };

				for (let poll = 0; poll < SLICE_WINDOW; poll++) {
					const multiple = multiShare > 0 && roll() < multiShare;
					const credit = multiple ? MULTIPLE_CREDIT : SINGLE_CREDIT;
					tally.available += credit;
					if (roll() >= accuracy) continue;
					tally.earned += credit;
					units += unitsPerCorrect(configs, multiple ? "multiple" : "single");
				}

				const output = headStart + gateOutputOf(units, accuracyBonus, tally);
				const band = bandFor(runCoverageOf(output, gate), gate).id;

				if (band === "danger" && gate > 0) {
					alive = false;
				} else if (!clearsAt(band, gate)) {
					holds++;
					alive = holds <= HOLDS_BEFORE_THE_RUN_ENDS;
				} else {
					headStart = headStartFor(output, gate);
					accuracyBonus = accuracyBonusAfter(accuracyBonus, tally);
					holds = 0;
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

	it("lets skill alone summit some of the time", () => {
		expect(simulate(BARE, 0.9).winRate).toBeGreaterThan(0.3);
	});

	it("makes a summit likely for a knowledgeable player who buys a multiplier", () => {
		expect(simulate(DOUBLER, 0.8).winRate).toBeGreaterThan(0.7);
	});

	it("opens the run for the average player who buys a multiplier", () => {
		expect(simulate(DOUBLER, 0.7).winRate).toBeGreaterThan(
			simulate(BARE, 0.7).winRate * 10
		);
	});

	it("still asks for accuracy once the multipliers are there", () => {
		expect(simulate(STACKED, 0.9).winRate).toBeGreaterThan(
			simulate(STACKED, 0.7).winRate
		);
	});

	it("rewards the poll mix, since a multiple pays double output", () => {
		expect(simulate(BARE, 0.8, 0.5).winRate).toBeGreaterThan(
			simulate(BARE, 0.8).winRate
		);
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
