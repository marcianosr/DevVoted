import { describe, expect, it } from "vitest";

import {
	type Config,
	draftCost,
	slotsOf,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	type AuditId,
	auditsForGate,
} from "~/modules/run/gate/domain/audit.model";
import {
	failPeelQuotaFor,
	gateLadderFor,
} from "~/modules/run/gate/domain/gate.model";
import { commitBand } from "~/modules/run/run/domain/sla.model";
import {
	hasRoomFor,
	spaceForBuild,
} from "~/modules/run/build/domain/build.model";
import {
	BASE_SLOTS,
	ESCROW_COMMIT_MULTIPLIER,
	FAUCET_CAP_KB,
	GATE_COUNT,
	SLICE_WINDOW,
	STREAK_UNIT_STEP,
	VICTORY_GATE,
	roundToOneDecimal,
	streakMultiplier,
	INCIDENT_SURVIVAL_KB,
} from "~/modules/run/run/domain/rules.model";
import {
	BASE_UNIT,
	MULTIPLE_CREDIT,
	healthyAt,
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";

const BASE_GAIN = BASE_UNIT;
import {
	createRun,
	type RunState,
	type LockedIncident,
	scheduleOf,
	withLockedGate,
	type HeldAuditBand,
} from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	audited,
	clearGate,
	failGate,
	handed,
	payPeel,
	poll,
	pool,
	started,
} from "~/modules/run/run/domain/run.factory";

/** A flawless window fills the bar and its four streak steps spill into storage. */
const FLAWLESS_OVERFLOW_KB = 13;

describe("what one answer is worth at the opening gate", () => {
	it("moves the meter by the flat base, not by a fraction of the gate", () => {
		const state = answerWith(started([]), true);

		expect(state.window.unitsEarned).toBe(BASE_UNIT);
	});

	it("asks three of five at the calibration gate, and two clears it thin", () => {
		const state = started([]);
		const ladder = gateLadderFor(state.build.configs, 0, scheduleOf(state));

		expect(ladder.healthy).toBe(percentOf(healthyAt(0)));
		expect(ladder.healthy).toBe(60);
		expect(ladder.ok).toBe(40);
		expect(ladder.floor).toBe(0);
	});
});

describe("the gate holds until its last answer has been read", () => {
	const scoreOnly = (state: RunState, correct: boolean): RunState => {
		const current = state.polls[state.currentIndex];
		const option = current.options.find(
			(candidate) => candidate.correct === correct
		);
		if (!option) throw new Error("no matching option");
		return runReducer(state, { type: "answer", optionIds: [option.id] });
	};

	/** Four right and one wrong, which a bare build pays 4.2 units for. */
	const filledWindow = (): RunState =>
		[true, true, false, true, true].reduce(scoreOnly, started([]));

	const heldPercent = (state: RunState): number =>
		roundToOneDecimal(
			percentOf(
				runCoverageOf(
					state.bankedUnits + state.window.unitsEarned,
					state.gatesCleared
				)
			)
		);

	it("stays in the gate that asked the fifth poll", () => {
		const state = filledWindow();

		expect(state.gatesCleared).toBe(0);
		expect(state.status).toBe("answering");
	});

	it("reads the last answer against the slots of the gate that asked it", () => {
		expect(heldPercent(filledWindow())).toBe(84);
	});

	it("rebases the same units onto the next gate only once the gate closes", () => {
		const closed = runReducer(filledWindow(), { type: "close-gate" });

		expect(closed.gatesCleared).toBe(1);
		expect(closed.bankedUnits).toBe(4.2);
		expect(heldPercent(closed)).toBe(42);
	});

	it("refuses a sixth answer into a window that is already full", () => {
		const full = filledWindow();

		expect(scoreOnly(full, true)).toBe(full);
	});

	it("closes nothing while the gate still has polls left", () => {
		const opening = scoreOnly(started([]), true);

		expect(runReducer(opening, { type: "close-gate" })).toBe(opening);
	});
});

describe("gates and rewards", () => {
	it("clears a gate into the reward screen and grants storage", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(
			32 * streakMultiplier(SLICE_WINDOW) + FLAWLESS_OVERFLOW_KB
		);
	});

	it("pays the flat Unit Tests payout on top of the gate reward", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.storage).toBe(93);
	});

	it("resets the shop's sale tally on a gate clear", () => {
		let state: RunState = { ...started(["js"]), soldThisShop: 2 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.soldThisShop).toBe(0);
	});

	it("clears the rebased mark the moment an answer lands", () => {
		const state = answerWith(
			{ ...started(["js"]), rebasedThisGate: true },
			true
		);
		expect(state.rebasedThisGate).toBeUndefined();
	});

	it("pays the cleared gate by its window, not the ceiling", () => {
		let state = started(["js"]);
		state = answerWith(state, false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.gateRewardKb).toBe(36);
		expect(state.storage).toBe(36);
	});

	it("takes several rewards (upgrade + slot + draft) and stays until finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");

		state = {
			...state,
			coverageByCategory: { js: 100 },
			coverage: 100,
			storage: 500,
		};
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.build.configs[0].level).toBe(2);
		expect(state.status).toBe("rewarding");

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.build.configs.map((config) => config.id)).toContain(pick.id);
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
	});

	it("gates a Focus upgrade on category coverage AND its storage price", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(61);

		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.build.configs[0].level ?? 1).toBe(1);

		const earned = { ...state, coverageByCategory: { js: 100 } };
		expect(runReducer(earned, { type: "upgrade", configId: "js" })).toBe(
			earned
		);

		const funded = { ...earned, storage: upgradeStorageCost(1) };
		const upgraded = runReducer(funded, { type: "upgrade", configId: "js" });
		expect(upgraded.build.configs[0].level).toBe(2);
		expect(upgraded.storage).toBe(0);
	});

	it("upgrades Unit Tests for storage — the next level costs 32KB × level", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(93);

		state = runReducer(state, { type: "upgrade", configId: "unit-tests" });
		const unit = state.build.configs.find((c) => c.id === "unit-tests")!;
		expect(unit.level).toBe(2);
		expect(state.storage).toBe(29);

		const broke = runReducer(state, {
			type: "upgrade",
			configId: "unit-tests",
		});
		expect(broke).toBe(state);
	});

	it("flags newly drafted configs and clears the flag on finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = {
			...state,
			storage: 500,
			coverage: 100,
		};

		// Not `draftOptions[0]`: the seeded roll reshuffles every time the roster
		// grows, and the first offer is regularly too heavy or too dear to draft.
		const pick = [...state.draftOptions]
			.sort((left, right) => slotsOf(left) - slotsOf(right))
			.find(
				(config) =>
					draftCost(config) <= state.storage &&
					hasRoomFor(state.build, slotsOf(config))
			);
		if (pick === undefined) throw new Error("no draftable offer");
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.draftedThisGate).toEqual([pick.id]);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.draftedThisGate).toEqual([]);
	});
});

/**
 * ADR-046's rule survives ADR-098's rewrite of where room comes from: the run
 * still never gets room for free. It just comes from installing rather than
 * buying, and the price is the standing bill rather than a counter charge.
 */
describe("room comes from the build, never from the climb (ADR-098)", () => {
	it("widens on no answer, however much coverage it earns", () => {
		let state = { ...started(["js"]), coverage: 1000 };
		state = answerWith(state, true);
		expect(spaceForBuild(state.build)).toBe(BASE_SLOTS);
	});

	it("stays the width it opened on however many gates it clears", () => {
		let state = started(["js"], 6 * SLICE_WINDOW);
		const widthAfterEachClear: number[] = [];
		for (let gate = 0; gate < 4; gate++) {
			state = clearGate(state);
			widthAfterEachClear.push(spaceForBuild(state.build));
			state = runReducer(state, { type: "finish-reward" });
		}

		expect(widthAfterEachClear).toEqual([4, 4, 4, 4]);
	});

	it("keeps the rung a fifth weight rented through a clear on an empty balance", () => {
		const base = started(["js"], 6 * SLICE_WINDOW);
		const broke: RunState = {
			...base,
			gatesCleared: 1,
			storage: 0,
			build: {
				...base.build,
				configs: [...base.build.configs, CONFIGS.strict],
			},
		};
		const state = clearGate(broke);

		expect(spaceForBuild(state.build)).toBe(6);
		expect(state.upkeepBilledKb).toBe(16);
		expect(state.storage).toBeGreaterThan(0);
		expect(state.spaceDroppedTo).toBeUndefined();
	});
});

describe("the floor rule at the close (ADR-094)", () => {
	const healthyHistory = (): RunState => ({
		...started(["js"]),
		gatesCleared: 4,
		bankedUnits: 20,
	});
	const oneRightOfFive = (state: RunState): RunState =>
		[true, false, false, false, false].reduce(answerWith, state);

	it("holds a gate that carried a HEALTHY meter in on one right answer, and says why", () => {
		const held = oneRightOfFive(healthyHistory());

		expect(held.status).toBe("awaiting-strip");
		expect(held.heldBy).toBe("floor");
		expect(held.log.at(-1)).toContain("Gate 4 failed: 1 of 5 right, 2 needed");
	});

	it("names the floor for a blank window and the band when the meter itself fell short", () => {
		expect(failGate({ ...started(["js"]), gatesCleared: 4 }).heldBy).toBe(
			"floor"
		);
		expect(
			[true, true, false, false, false].reduce(answerWith, {
				...started(["js"]),
				gatesCleared: 4,
				bankedUnits: 11,
			}).heldBy
		).toBe("band");
	});

	it("forgets the reason on the clear that follows", () => {
		const retried = runReducer(payPeel(oneRightOfFive(healthyHistory())), {
			type: "finish-reward",
		});

		expect(retried.heldBy).toBeUndefined();
		expect(clearGate({ ...retried, heldBy: "floor" }).heldBy).toBeUndefined();
	});
});

describe("the gate's window meter (ADR-035)", () => {
	it("fails a perfect window whose meter sits under the gate's own demand", () => {
		const state = clearGate({
			...started(["js"]),
			gatesCleared: 6,
			coverage: 500,
		});
		expect(state.status).toBe("awaiting-strip");
		expect(state.gatesCleared).toBe(6);
		expect(state.log.at(-1)).toContain("Gate 6 failed");
	});

	it("resets the meter for the retry, keeping its answers for the review", () => {
		let state = clearGate({ ...started(["js"]), gatesCleared: 2 });
		expect(state.answeredThisGate).toHaveLength(SLICE_WINDOW);
		state = payPeel(state);
		expect(state.window.unitsEarned).toBe(0);
		expect(state.window.answered).toBe(0);
		state = runReducer(state, { type: "finish-reward" });
		expect(state.answeredThisGate).toEqual([]);
	});

	it("keeps the career coverage earned inside a failed attempt", () => {
		let state = { ...started(["js"]), gatesCleared: 2 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.coverage).toBeGreaterThan(0);
	});

	it("costs nothing to miss at any gate: the slot is the cost, not a bleed", () => {
		let opening = started(["js"]);
		opening = answerWith(opening, true);
		const held = opening.window.unitsEarned;
		opening = answerWith(opening, false);
		expect(opening.window.unitsEarned).toBe(held);

		let late: RunState = { ...started(["js"]), gatesCleared: 3 };
		late = answerWith(late, true);
		const earned = late.window.unitsEarned;
		late = answerWith(late, false);
		expect(late.window.unitsEarned).toBe(earned);
	});

	it("floors the meter at zero however many misses land on it", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 3 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.window.unitsEarned).toBe(0);
	});

	it("never advances a build that answers nothing — it peels until the run ends", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 1 };
		for (let attempt = 0; attempt < 10 && state.status !== "dead"; attempt++)
			state = runReducer(payPeel(failGate(state)), { type: "finish-reward" });
		expect(state.status).toBe("dead");
		expect(state.gatesCleared).toBe(1);
	});

	it("never ends a run at the Pallet gate — a miss there costs nothing (ADR-057)", () => {
		let state = started(["js"]);
		for (let attempt = 0; attempt < 10; attempt++)
			state = runReducer(payPeel(failGate(state)), { type: "finish-reward" });
		expect(state.status).not.toBe("dead");
		expect(state.gatesCleared).toBe(0);
		expect(state.build.configs).toHaveLength(4);
	});

	it("grades each attempt against its own gate's rung of the ladder", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(percentOf(healthyAt(0))).toBe(60);
	});
});

describe("enhancement configs on one build", () => {
	it("pays nothing for the opening answer with Cold Start, then ×1.5", () => {
		let state = started(["cold-start"]);
		state = answerWith(state, true);
		expect(state.coverage).toBe(0);
		state = answerWith(state, true);
		expect(state.coverage).toBeCloseTo(BASE_UNIT * 1.5 + STREAK_UNIT_STEP);
	});

	// Regression Test is not in `handed`, and that fixture's order is indexed
	// into elsewhere, so the build is set directly rather than installed.
	const regressionBuild = (missedBefore: boolean): RunState => {
		const base = started([]);
		const [first, ...rest] = base.polls;
		return {
			...base,
			build: { ...base.build, configs: [CONFIGS.regressionTest] },
			// The flag rides the poll, attached when the sequence is read, so the
			// engine never learns how the miss was recorded.
			polls: [{ ...first, missedBefore }, ...rest],
		};
	};

	it("doubles a poll the account has missed before with Regression Test", () => {
		expect(answerWith(regressionBuild(true), true).coverage).toBe(
			BASE_UNIT * 2
		);
	});

	it("pays a poll the account has never missed at the ordinary rate", () => {
		expect(answerWith(regressionBuild(false), true).coverage).toBe(BASE_UNIT);
	});

	it("stops the IndexedDB faucet at the per-run cap", () => {
		let state = started(["indexed-db"]);
		state = { ...state, faucetEarnedKb: FAUCET_CAP_KB - 4 };
		state = answerWith(state, true);
		expect(state.storage).toBe(4);
		expect(state.faucetEarnedKb).toBe(FAUCET_CAP_KB);
		state = answerWith(state, true);
		expect(state.storage).toBe(4);
	});
});

describe("the swatch rides the window, not the clear (ADR-080)", () => {
	it("stamps the gate whose five polls all landed", () => {
		expect(clearGate(started(["js"])).swatchGatesEarned).toEqual([0]);
	});

	it("stamps nothing for a gate that cleared carrying a miss", () => {
		let state = answerWith(started(["js"]), false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);

		expect(state.status).toBe("rewarding");
		expect(state.swatchGatesEarned).toEqual([]);
	});

	it("collects a stamp per flawless gate, and keeps the earlier ones", () => {
		const first = clearGate(started(["js"], SLICE_WINDOW * 2));
		const second = clearGate(runReducer(first, { type: "finish-reward" }));

		expect(second.swatchGatesEarned).toEqual([0, 1]);
	});
});

describe("the summit", () => {
	it("wins by clearing every gate — playing the mirror wrong on purpose", () => {
		const base = started(["jsx"], GATE_COUNT * SLICE_WINDOW);
		let state: RunState = {
			...base,
			build: {
				...base.build,
				configs: [
					...base.build.configs,
					CONFIGS.agentsMd,
					CONFIGS.intellisense,
					CONFIGS.abTest,
					CONFIGS.codeCoverage,
				],
			},
		};
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const mirrored = auditsForGate(gate, scheduleOf(state)).some(
				(audit) => audit.id === "mirrored"
			);
			for (let i = 0; i < SLICE_WINDOW; i++)
				state = answerWith(state, !mirrored);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}
		expect(state.status).toBe("won");
		expect(state.clearedGate).toBe(VICTORY_GATE);
		expect(state.gatesCleared).toBe(GATE_COUNT);
	});
});

describe("Dependabot's counter", () => {
	const withBot = (): RunState => {
		const base = started(["js"], GATE_COUNT * SLICE_WINDOW);
		return {
			...base,
			build: {
				...base.build,
				configs: [...base.build.configs, CONFIGS.dependabot],
			},
		};
	};

	it("advances one per correct answer and fires on the fifth", () => {
		let state = withBot();
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.autoUpgradeProgress).toBe(4);
		expect(state.autoUpgradedConfigId).toBeUndefined();

		state = answerWith(state, true);
		expect(state.autoUpgradeProgress).toBe(0);
		expect(state.autoUpgradedConfigId).toBeDefined();
		expect(state.autoUpgradedByConfigId).toBe(CONFIGS.dependabot.id);
		expect(state.build.configs.some((config) => (config.level ?? 1) > 1)).toBe(
			true
		);
	});

	it("starts the count over on a wrong answer, so four right then one wrong pays nothing", () => {
		let state = withBot();
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		state = answerWith(state, false);

		expect(state.autoUpgradeProgress).toBe(0);
		expect(state.autoUpgradedConfigId).toBeUndefined();
		expect(
			state.build.configs.every((config) => (config.level ?? 1) === 1)
		).toBe(true);
	});

	it("leaves the count at zero for a build with no Dependabot", () => {
		let state = started(["js"]);
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.autoUpgradeProgress).toBe(0);
	});

	it("starts the count over when a gate fails, even on a correct final answer", () => {
		const base = { ...withBot(), gatesCleared: 8 };
		const short: RunState = {
			...base,
			autoUpgradeProgress: 3,
			bankedUnits: 30,
			window: { ...base.window, answered: SLICE_WINDOW - 1, unitsEarned: 0 },
		};

		const failed = answerWith(short, true);

		expect(failed.status).toBe("awaiting-strip");
		expect(failed.autoUpgradeProgress).toBe(0);
	});
});

describe("depth and width are independent (ADR-019)", () => {
	it("advances the gate on a clear the opening four slots paid for", () => {
		const state = clearGate(started(["js"]));

		expect(state.status).toBe("rewarding");
		expect(state.gatesCleared).toBe(1);
		expect(state.clearedGate).toBe(0);
		expect(state.storage).toBe(61);
	});

	it("names the badge the clear earned in the log", () => {
		expect(clearGate(started(["js"])).log.at(-1)).toContain(
			"Pallet Swatch earned"
		);
	});

	it("keeps climbing regardless of how much width has auto-widened", () => {
		let state = started(["js"], 3 * SLICE_WINDOW);
		for (let gate = 0; gate < 3; gate++) {
			state = clearGate(state);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}

		expect(state.gatesCleared).toBe(3);
		expect(spaceForBuild(state.build)).toBeGreaterThanOrEqual(BASE_SLOTS);
	});

	it("pays a deeper gate more, so replaying shallow ones is never the ramp", () => {
		let state = clearGate(started(["js"], 2 * SLICE_WINDOW));
		const firstGate = state.gateRewardKb;
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);

		expect(state.gateRewardKb).toBeGreaterThan(firstGate ?? 0);
	});
});

describe("streak", () => {
	it("counts consecutive correct answers and resets on a wrong one", () => {
		let state = started(["js"]);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(state.streak).toBe(2);
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
	});

	it("resets on a gate clear — it tracks the window, not the run", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.answered).toBe(0);
		expect(state.streak).toBe(0);
	});

	it("pays a flat step to every correct answer after the window's first", () => {
		let state = started([]);
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(BASE_GAIN);
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBeCloseTo(
			BASE_GAIN + STREAK_UNIT_STEP
		);
		expect(state.coverage).toBeCloseTo(BASE_GAIN * 2 + STREAK_UNIT_STEP);
	});

	it("holds the streak (and its bonus) on a partial multi-answer pick", () => {
		const multi: RunPoll = {
			id: "multi",
			category: "react",
			question: "Pick the correct ones",
			answerType: "multiple",
			options: [
				{ id: "m-a", label: "A", correct: true },
				{ id: "m-b", label: "B", correct: true },
				{ id: "m-c", label: "C", correct: false },
			],
		};
		let state: RunState = {
			...createRun([poll("a", true), poll("b", true), multi], handed),
			status: "answering",
		};
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = runReducer(state, { type: "answer", optionIds: ["m-a"] });
		expect(state.answeredThisGate.at(-1)?.outcome).toBe("partial");
		expect(state.streak).toBe(2);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBeCloseTo(
			BASE_UNIT * 0.5 * MULTIPLE_CREDIT + STREAK_UNIT_STEP
		);
	});

	it("earns no coverage and zeroes the streak on a wrong answer", () => {
		let state = started([]);
		state = answerWith(state, true);
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0);
	});
});

describe("the gate's grip on an answer", () => {
	const baseAt = (gatesCleared: number, correct: boolean): number | undefined =>
		answerWith(
			{ ...started([]), gatesCleared, streak: 0 },
			correct
		).answeredThisGate.at(-1)?.coverageBreakdown?.base;

	it("pays the same base at every gate", () => {
		for (const gate of [0, 1, 2, VICTORY_GATE])
			expect(baseAt(gate, true)).toBe(BASE_GAIN);
	});

	it("pays a miss nothing at every gate: the slot is the cost", () => {
		for (const gate of [0, 2, 3, 4, VICTORY_GATE])
			expect(baseAt(gate, false)).toBe(0);
	});
});

describe("answer judging", () => {
	const multiPoll = (): RunPoll => ({
		id: "m",
		category: "ts",
		question: "Which are TS utility types?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "Partial", correct: true },
			{ id: "b", label: "Pick", correct: true },
			{ id: "c", label: "Banjo", correct: false },
		],
	});
	const answering = (): RunState => ({
		...createRun([multiPoll(), ...pool(5)], handed),
		status: "answering",
	});

	it("marks multiple-choice correct only for the exact correct set", () => {
		expect(
			runReducer(answering(), { type: "answer", optionIds: ["a", "b"] }).window
				.correct
		).toBe(1);
	});

	it("marks a subset of the correct set wrong", () => {
		expect(
			runReducer(answering(), { type: "answer", optionIds: ["a"] }).window
				.correct
		).toBe(0);
	});

	it("marks the correct set plus a wrong option wrong", () => {
		expect(
			runReducer(answering(), {
				type: "answer",
				optionIds: ["a", "b", "c"],
			}).window.correct
		).toBe(0);
	});

	const outcomeOf = (optionIds: string[]) =>
		runReducer(answering(), { type: "answer", optionIds }).answeredThisGate[0]
			.outcome;

	it("records the exact correct set as a correct outcome", () => {
		expect(outcomeOf(["a", "b"])).toBe("correct");
	});

	it("records a subset of the correct set as partial", () => {
		expect(outcomeOf(["a"])).toBe("partial");
	});

	it("records the correct set plus a wrong option as partial", () => {
		expect(outcomeOf(["a", "b", "c"])).toBe("partial");
	});

	it("records only-wrong picks as a wrong outcome, never partial", () => {
		expect(outcomeOf(["c"])).toBe("wrong");
	});

	it("pays half a multiple-choice set a whole unit: half a share at double credit", () => {
		const partial = runReducer(answering(), {
			type: "answer",
			optionIds: ["a"],
		});
		const halfAtDouble = BASE_UNIT * 0.5 * MULTIPLE_CREDIT;
		expect(partial.coverage).toBe(halfAtDouble);
		expect(partial.answeredThisGate[0].coverageEarned).toBe(halfAtDouble);
	});

	it("records a wrong answer as costing nothing, the slot being the cost", () => {
		const start = { ...answering(), gatesCleared: 4 };
		const missed = runReducer(start, { type: "answer", optionIds: ["c"] });

		expect(missed.answeredThisGate[0].coverageLost).toBeUndefined();
	});

	it("charges a partial answer no loss, half the set still being half right", () => {
		const partial = runReducer(answering(), {
			type: "answer",
			optionIds: ["a"],
		});

		expect(partial.answeredThisGate[0].coverageLost).toBeUndefined();
	});

	it("pays a fully answered multiple-choice poll double what a single pays", () => {
		const singlePoll: RunPoll = {
			id: "s",
			category: "ts",
			question: "Which is a TS utility type?",
			answerType: "single",
			options: [
				{ id: "s-a", label: "Partial", correct: true },
				{ id: "s-b", label: "Banjo", correct: false },
				{ id: "s-c", label: "Kazooie", correct: false },
			],
		};
		const single = runReducer(
			{ ...createRun([singlePoll, ...pool(5)], handed), status: "answering" },
			{ type: "answer", optionIds: ["s-a"] }
		);
		const multiple = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "b"],
		});
		expect(multiple.answeredThisGate[0].coverageEarned ?? 0).toBe(
			(single.answeredThisGate[0].coverageEarned ?? 0) * MULTIPLE_CREDIT
		);
	});

	const fourKeyPoll = (): RunPoll => ({
		id: "four",
		category: "react",
		question: "Pick every hook",
		answerType: "multiple",
		options: [
			{ id: "k1", label: "useState", correct: true },
			{ id: "k2", label: "useEffect", correct: true },
			{ id: "k3", label: "useMemo", correct: true },
			{ id: "k4", label: "useRef", correct: true },
			{ id: "x1", label: "useBanjo", correct: false },
		],
	});

	const CREDIT_LADDER: readonly {
		readonly caught: string;
		readonly optionIds: string[];
		readonly units: number;
	}[] = [
		{ caught: "none of the key", optionIds: ["x1"], units: 0 },
		{ caught: "a quarter of the key", optionIds: ["k1"], units: 0.5 },
		{ caught: "half the key", optionIds: ["k1", "k2"], units: 1 },
		{
			caught: "three quarters of the key",
			optionIds: ["k1", "k2", "k3"],
			units: 1.5,
		},
		{
			caught: "the exact key",
			optionIds: ["k1", "k2", "k3", "k4"],
			units: 2,
		},
	];

	it.each(CREDIT_LADDER)(
		"pays $units units for catching $caught",
		({ optionIds, units }) => {
			const answered = runReducer(
				{
					...createRun([fourKeyPoll(), ...pool(5)], handed),
					status: "answering",
				},
				{ type: "answer", optionIds }
			);

			expect(answered.answeredThisGate[0].coverageEarned ?? 0).toBe(units);
		}
	);

	it("cancels a correct pick with a wrong one — nothing earned, and it reads as a miss", () => {
		const cancelled = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "c"],
		});
		expect(cancelled.coverage).toBe(0);
		expect(cancelled.answeredThisGate[0].coverageEarned).toBe(0);
		expect(cancelled.answeredThisGate[0].outcome).toBe("wrong");
	});

	const shapedPoll = (
		answerType: RunPoll["answerType"],
		correctIds: readonly string[]
	): RunPoll => ({
		id: "shaped",
		category: "ts",
		question: "Which Kanto badge does Blaine hand out?",
		answerType,
		options: ["a", "b", "c"].map((id) => ({
			id,
			label: id,
			correct: correctIds.includes(id),
		})),
	});
	const answerShaped = (
		answerType: RunPoll["answerType"],
		correctIds: readonly string[],
		optionIds: string[]
	) =>
		runReducer(
			{
				...createRun([shapedPoll(answerType, correctIds), ...pool(5)], handed),
				status: "answering",
			},
			{ type: "answer", optionIds }
		);

	it("accepts any one of several correct options on a single-answer poll", () => {
		expect(answerShaped("single", ["a", "b"], ["b"]).window.correct).toBe(1);
	});

	it("demands the exact single option on a one-correct multiple poll — a wrong pick cancels the right one", () => {
		expect(answerShaped("multiple", ["a"], ["a"]).window.correct).toBe(1);
		const overPicked = answerShaped("multiple", ["a"], ["a", "b"]);
		expect(overPicked.window.correct).toBe(0);
		expect(overPicked.answeredThisGate[0].outcome).toBe("wrong");
	});

	it("can never be answered correctly when a poll has zero correct options", () => {
		expect(answerShaped("single", [], ["a"]).window.correct).toBe(0);
		expect(answerShaped("single", [], ["a"]).answeredThisGate[0].outcome).toBe(
			"wrong"
		);
	});

	it("records a missed single-answer poll as wrong, never partial", () => {
		const singleMiss = runReducer(started(["js"]), {
			type: "answer",
			optionIds: ["kazooie-0-b"],
		});
		expect(singleMiss.answeredThisGate[0].outcome).toBe("wrong");
	});

	it("ignores an empty answer", () => {
		const before = answering();
		expect(runReducer(before, { type: "answer", optionIds: [] })).toBe(before);
	});
});

describe("coverage scoring", () => {
	it("holds career coverage flat on a wrong answer at every gate", () => {
		const opening = answerWith(started(["js"]), true);
		expect(opening.coverage).toBe(BASE_GAIN);
		expect(answerWith(opening, false).coverage).toBe(BASE_GAIN);

		const late = answerWith({ ...started(["js"]), gatesCleared: 4 }, true);
		expect(answerWith(late, false).coverage).toBe(late.coverage);
	});

	it("never drags coverage below zero", () => {
		const wrongOnEmpty = answerWith(started(["js"]), false);
		expect(wrongOnEmpty.coverage).toBe(0);
		expect(wrongOnEmpty.coverageByCategory.react ?? 0).toBe(0);
	});

	it("costs nothing to be wrong in a category with no coverage yet", () => {
		const jsRich: RunState = {
			...started(["js"]),
			coverage: 1,
			coverageByCategory: { js: 1 },
		};
		const wrongInUntouched = answerWith(jsRich, false);
		expect(wrongInUntouched.coverage).toBe(1);
		expect(wrongInUntouched.coverageByCategory.js).toBe(1);
		expect(wrongInUntouched.coverageByCategory.react ?? 0).toBe(0);
	});

	it("keeps the total equal to the sum of the categories after a loss", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.coverage).toBe(
			Object.values(thenWrong.coverageByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			)
		);
	});

	it("moves the gate meter and the career total in step (ADR-035)", () => {
		const afterOneCorrect = answerWith(
			{ ...started(["js"]), gatesCleared: 4 },
			true
		);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.window.unitsEarned).toBe(thenWrong.coverage);
		expect(thenWrong.coverage).toBe(afterOneCorrect.coverage);
	});
});

describe(".prettierrc", () => {
	const fourKeyPoll = (): RunPoll => ({
		id: "m4",
		category: "ts",
		question: "Which are TS utility types?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "Partial", correct: true },
			{ id: "b", label: "Pick", correct: true },
			{ id: "c", label: "Omit", correct: true },
			{ id: "d", label: "Readonly", correct: true },
			{ id: "e", label: "Banjo", correct: false },
			{ id: "f", label: "Kazooie", correct: false },
		],
	});

	const formatting = (): RunState => {
		const base = createRun([fourKeyPoll(), ...pool(5)], handed);
		return {
			...base,
			status: "answering",
			build: {
				...base.build,
				configs: [CONFIGS.prettierrc],
			},
		};
	};

	const paidFor = (optionIds: string[]): number | undefined =>
		runReducer(formatting(), { type: "answer", optionIds }).answeredThisGate[0]
			?.coverageEarned;

	it("pays a quarter-caught set a whole unit instead of half of one", () => {
		expect(paidFor(["a"])).toBe(1);
	});

	it("pays a three-quarter catch two units instead of one and a half", () => {
		expect(paidFor(["a", "b", "c"])).toBe(2);
	});

	it("leaves a half catch alone, one unit being whole already", () => {
		expect(paidFor(["a", "b"])).toBe(1);
	});

	it("pays a full set the same two units it always paid", () => {
		expect(paidFor(["a", "b", "c", "d"])).toBe(2);
	});

	it("pays a cancelled-out answer nothing, a miss being a miss", () => {
		expect(paidFor(["a", "e"])).toBe(0);
	});

	it("names itself on the receipt rather than inflating the base", () => {
		const breakdown = runReducer(formatting(), {
			type: "answer",
			optionIds: ["a"],
		}).answeredThisGate[0]?.coverageBreakdown;

		expect(breakdown?.base).toBe(0.5);
		expect(breakdown?.configBonuses).toEqual([
			{ configId: "prettierrc", value: 0.5 },
		]);
	});

	it("keeps the verdict badge on the fraction caught, not on what it paid", () => {
		const landed = runReducer(formatting(), {
			type: "answer",
			optionIds: ["a"],
		}).answeredThisGate[0];

		expect(landed?.outcome).toBe("partial");
		expect(landed?.coverageFactors?.correct).toBe(0.25);
	});
});

describe("Cache", () => {
	const withCache = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			configs: [...state.build.configs, CONFIGS.cache],
		},
	});

	const earnedOf = (state: RunState, index: number): number | undefined =>
		state.answeredThisGate[index]?.coverageEarned;

	it("pays nothing on a cold category and a quarter unit more per cached hit", () => {
		let state = withCache(started(["js"]));
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(earnedOf(state, 0)).toBe(BASE_GAIN);
		expect(earnedOf(state, 1)).toBe(BASE_GAIN + 0.25 + STREAK_UNIT_STEP);
		expect(earnedOf(state, 2)).toBe(BASE_GAIN + 0.5 + STREAK_UNIT_STEP);
	});

	it("flushes the category on a wrong answer and rebuilds from cold", () => {
		let state = withCache(started(["js"]));
		state = answerWith(state, true);
		state = answerWith(state, false);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(earnedOf(state, 2)).toBe(BASE_GAIN);
		expect(earnedOf(state, 3)).toBe(BASE_GAIN + 0.25 + STREAK_UNIT_STEP);
	});

	it("keeps a category warm across a gate clear, capped at one unit", () => {
		let state = withCache(started(["js"]));
		state = clearGate(state);
		state = runReducer(state, { type: "finish-reward" });
		state = answerWith(state, true);
		expect(earnedOf(state, 0)).toBe(BASE_GAIN + 1);
	});
});

describe("A/B Test", () => {
	const withAbTest = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			configs: [...state.build.configs, CONFIGS.abTest],
		},
	});

	it("ships arm A by default: coverage multiplied, no faucet", () => {
		const state = answerWith(withAbTest(started(["js"])), true);
		expect(state.answeredThisGate[0]?.coverageFactors?.build).toBe(1.25);
		expect(state.answeredThisGate[0]?.faucetKb).toBeUndefined();
	});

	it("switches to arm B in the shop: faucet paid, coverage back to ×1", () => {
		let state = clearGate(withAbTest(started(["js"])));
		state = runReducer(state, { type: "switch-arm", configId: "ab-test" });
		state = runReducer(state, { type: "finish-reward" });
		state = answerWith(state, true);
		expect(state.answeredThisGate[0]?.coverageFactors?.build).toBe(1);
		expect(state.answeredThisGate[0]?.faucetKb).toBe(8);
	});

	it("switches mid-poll, scoring the answer you are about to give", () => {
		let state = withAbTest(started(["js"]));
		state = runReducer(state, { type: "switch-arm", configId: "ab-test" });
		state = answerWith(state, true);
		expect(state.answeredThisGate[0]?.coverageFactors?.build).toBe(1);
		expect(state.answeredThisGate[0]?.faucetKb).toBe(8);
	});

	it("refuses the switch before the run has started", () => {
		const state: RunState = {
			...withAbTest(started(["js"])),
			status: "configuring",
		};
		expect(runReducer(state, { type: "switch-arm", configId: "ab-test" })).toBe(
			state
		);
	});
});

describe("Moore's Law", () => {
	const held = (state: RunState, storage: number): RunState => ({
		...state,
		storage,
	});
	const maxed = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			configs: state.build.configs.map((config) =>
				config.id === "moores-law" ? { ...config, level: 5 } : config
			),
		},
	});
	const answerWholeWindow = (state: RunState): RunState => {
		let next = state;
		for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
		return next;
	};

	it("pays 2% of the balance on top of the gate reward at L1", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 128));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(2);
		expect(state.gateRewardKb).toBe(48 + FLAWLESS_OVERFLOW_KB + 2);
		expect(state.storage).toBe(128 + 63);
	});

	it("pays five times as much once maxed, on the same balance", () => {
		const state = answerWholeWindow({
			...maxed(held(started(["moores-law"]), 512)),
		});

		expect(state.interestThisGateKb).toBe(51);
	});

	it("pays interest on any balance — the floor left with the checks (ADR-035)", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 31));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(0);
	});

	it("upgrades for storage, spending the principal it then demands", () => {
		const shopping: RunState = {
			...held(started(["moores-law"]), 200),
			status: "rewarding",
		};
		const state = runReducer(shopping, {
			type: "upgrade",
			configId: "moores-law",
		});

		expect(state.storage).toBe(200 - 64);
		expect(
			state.build.configs.find((config) => config.id === "moores-law")?.level
		).toBe(2);
	});

	// The balance has to out-earn the rent as well as fit under the cap: at
	// 800 KB the 10% pays 80 against tier 2's 96 a gate, which the gate reward
	// covers. A smaller principal on the same rung decays instead.
	it("compounds while the plan is wide enough to hold the balance", () => {
		const rich: RunState = {
			...maxed(held(started(["moores-law"], 4 * SLICE_WINDOW), 800)),
		};
		let state = answerWholeWindow(rich);
		const first = state.interestThisGateKb ?? 0;
		state = runReducer(state, { type: "finish-reward" });
		state = answerWholeWindow(state);

		expect(first).toBe(80);
		expect(state.interestThisGateKb).toBeGreaterThan(first);
	});
});

describe("Dependabot's merge announcement", () => {
	it("stays unset when nothing in the build carries the axis", () => {
		const state = clearGate(started(["js"]));
		expect(state.autoUpgradedConfigId).toBeUndefined();
	});

	it("clears when the climb resumes, like the slot celebration", () => {
		const announced: RunState = {
			...clearGate(started(["js"])),
			autoUpgradedConfigId: "js",
		};
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.autoUpgradedConfigId).toBeUndefined();
	});
});

describe("Deprecated's decay", () => {
	const holdingDeprecated = (multiplier: number): RunState => {
		const base = started(["js"]);
		return {
			...base,
			build: {
				...base.build,
				configs: [
					...base.build.configs,
					{ ...CONFIGS.deprecated, coverageMultiplier: multiplier },
				],
			},
		};
	};

	const deprecatedIn = (state: RunState) =>
		state.build.configs.find((config) => config.id === "deprecated");

	it("fades ×3 to ×2.5 at the clear — the cleared gate scored at the full ×3", () => {
		const state = clearGate(holdingDeprecated(3));
		expect(deprecatedIn(state)?.coverageMultiplier).toBe(2.5);
		expect(state.deletedConfigs).toBeUndefined();
	});

	it("deletes it at ×1 and announces the deletion — the config is gone, only state can say so", () => {
		const state = clearGate(holdingDeprecated(1.5));
		expect(deprecatedIn(state)).toBeUndefined();
		expect(state.deletedConfigs).toEqual([
			{ ...CONFIGS.deprecated, coverageMultiplier: 1 },
		]);
	});

	it("does not fade on a failed gate — the redo already charges a peel", () => {
		const state = failGate(holdingDeprecated(3));
		expect(state.status).toBe("awaiting-strip");
		expect(deprecatedIn(state)?.coverageMultiplier).toBe(3);
	});

	it("clears the announcement when the climb resumes", () => {
		const announced = clearGate(holdingDeprecated(1.5));
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.deletedConfigs).toBeUndefined();
	});
});

describe("configs lost at the clear (DVTD-wii3: the comeback tally)", () => {
	const holding = (extra: Config): RunState => {
		const base = started(["js"]);
		return {
			...base,
			build: {
				...base.build,
				configs: [...base.build.configs, extra],
			},
		};
	};

	it("adds a decay deletion to the run's losses", () => {
		const state = clearGate(
			holding({ ...CONFIGS.deprecated, coverageMultiplier: 1.5 })
		);
		expect(state.deletedConfigs).toHaveLength(1);
		expect(state.configsLost).toBe(1);
	});

	it("adds a lapsed plan on top of an earlier tally", () => {
		const subscribed: RunState = {
			...holding({ ...CONFIGS.freemium, subscriptionKb: 512 }),
			storage: 0,
			configsLost: 2,
		};
		const state = clearGate(subscribed);
		expect(state.lapsedConfigs).toHaveLength(1);
		expect(state.configsLost).toBe(3);
	});

	it("reads a legacy snapshot's missing tally as zero at a clean clear", () => {
		const state = clearGate(started(["js"]));
		expect(state.configsLost).toBe(0);
	});
});

describe("Freemium's subscription", () => {
	const unaffordablePlan: Config = { ...CONFIGS.freemium, subscriptionKb: 512 };

	const subscribed = (
		storage: number,
		plan: Config = CONFIGS.freemium
	): RunState => {
		const base = started(["js"]);
		return {
			...base,
			storage,
			build: {
				...base.build,
				configs: [...base.build.configs, plan],
			},
		};
	};

	const freemiumIn = (state: RunState) =>
		state.build.configs.find((config) => config.id === "freemium");

	it("bills 8KB at the first clear and keeps the plan installed", () => {
		const state = clearGate(subscribed(128));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
		expect(state.lapsedConfigs).toBeUndefined();
	});

	it("bills after the gate pays, so the clear itself can cover the plan", () => {
		const state = clearGate(subscribed(0));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("lapses the plan when the clear cannot cover the bill, and frees the slot", () => {
		const state = clearGate(subscribed(0, unaffordablePlan));
		expect(freemiumIn(state)).toBeUndefined();
		expect(state.lapsedConfigs).toHaveLength(1);
		expect(state.subscriptionBillKb).toBe(0);
		expect(state.build.configs).toHaveLength(4);
	});

	it("does not bill a failed gate — the redo already charges a peel", () => {
		const state = failGate(subscribed(256));
		expect(state.status).toBe("awaiting-strip");
		expect(state.storage).toBe(256);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("clears the bill and the lapse notice when the climb resumes", () => {
		const announced = clearGate(subscribed(0, unaffordablePlan));
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.lapsedConfigs).toBeUndefined();
		expect(state.subscriptionBillKb).toBe(0);
	});

	it("charges half price at the counter while it is installed", () => {
		const cleared = clearGate(subscribed(300));
		const shopping: RunState = {
			...cleared,
			draftOptions: [CONFIGS.agentsMd],
		};
		const drafted = runReducer(shopping, {
			type: "draft",
			configId: "agents-md",
		});
		expect(drafted.storage).toBe(shopping.storage - 128);
	});
});

describe("an armed strict wager", () => {
	const wagering = (): RunState => {
		const base = started([]);
		return { ...base, build: { ...base.build, configs: [CONFIGS.strict] } };
	};

	const arm = (state: RunState): RunState =>
		runReducer(state, { type: "arm-strict" });

	it("pays half a unit on top of an exact answer", () => {
		const state = answerWith(arm(wagering()), true);

		expect(state.window.unitsEarned).toBe(BASE_UNIT + 0.5);
	});

	it("takes half a unit off the window a miss would have left alone", () => {
		const earned = answerWith(wagering(), true);

		expect(answerWith(arm(earned), false).window.unitsEarned).toBe(
			BASE_UNIT - 0.5
		);
	});

	it("takes half a unit off a partial, since strict means exact or nothing", () => {
		const base = started([]);
		const selectAll: RunPoll = {
			id: "select-all",
			category: "react",
			question: "Which of these beat Banjo?",
			answerType: "multiple",
			options: [
				{ id: "a", label: "Kazooie", correct: true },
				{ id: "b", label: "Mumbo", correct: true },
				{ id: "c", label: "Gruntilda", correct: false },
				{ id: "d", label: "Klungo", correct: false },
			],
		};
		const state = arm({
			...base,
			build: { ...base.build, configs: [CONFIGS.strict] },
			polls: [selectAll, ...base.polls.slice(1)],
		});
		const partial = runReducer(state, { type: "answer", optionIds: ["a"] });

		expect(partial.answeredThisGate[0].outcome).toBe("partial");
		expect(partial.answeredThisGate[0].coverageLost).toBe(0.5);
	});

	it("leaves the window at zero rather than owing units it cannot take", () => {
		expect(answerWith(arm(wagering()), false).window.unitsEarned).toBe(0);
	});

	it("settles nothing on an answer given without arming", () => {
		expect(answerWith(wagering(), false).window.unitsEarned).toBe(0);
		expect(answerWith(wagering(), true).window.unitsEarned).toBe(BASE_UNIT);
	});

	it("disarms after the answer, so every poll is wagered on its own", () => {
		expect(arm(wagering()).strictArmed).toBe(true);
		expect(answerWith(arm(wagering()), true).strictArmed).toBeUndefined();
	});

	it("keeps the payout flat, so a multiplying build cannot amplify the wager", () => {
		const base = started([]);
		const doubled = arm({
			...base,
			build: {
				...base.build,
				configs: [CONFIGS.strict, CONFIGS.agentsMd],
			},
		});
		const plain = {
			...base,
			build: { ...base.build, configs: [CONFIGS.agentsMd] },
		};

		expect(answerWith(doubled, true).window.unitsEarned).toBe(
			answerWith(plain, true).window.unitsEarned + 0.5
		);
	});
});

describe("Database holds its earnings until the gate closes", () => {
	// Database is not in the dealt-hand fixture, so the build is set directly
	// rather than installed — the same dodge Regression Test uses above.
	const withDatabase = (extra: Partial<RunState> = {}): RunState => {
		const base = started([]);
		return {
			...base,
			build: { ...base.build, configs: [CONFIGS.database] },
			...extra,
		};
	};

	const PLEDGE = CONFIGS.database.escrowPerCorrect ?? 0;
	const WINDOW_PLEDGE = PLEDGE * SLICE_WINDOW;

	it("holds an exact answer's KB rather than paying it into the balance", () => {
		const state = answerWith(withDatabase(), true);
		expect(state.pendingKb).toBe(PLEDGE);
		expect(state.storage).toBe(0);
	});

	it("holds nothing for a miss", () => {
		expect(answerWith(withDatabase(), false).pendingKb).toBe(0);
	});

	it("leaves the run cap alone while the transaction is still open", () => {
		expect(answerWith(withDatabase(), true).faucetEarnedKb).toBe(0);
	});

	it("commits the transaction at ×2 when the gate clears", () => {
		const cleared = clearGate(withDatabase());
		expect(cleared.status).toBe("rewarding");
		expect(cleared.escrowCommittedKb).toBe(
			WINDOW_PLEDGE * ESCROW_COMMIT_MULTIPLIER
		);
		expect(cleared.pendingKb).toBe(0);
	});

	it("spends run cap on the commit, not on the pledge", () => {
		expect(clearGate(withDatabase()).faucetEarnedKb).toBe(
			WINDOW_PLEDGE * ESCROW_COMMIT_MULTIPLIER
		);
	});

	it("rolls the transaction back on a gate held in SHAKY", () => {
		const held = failGate(withDatabase({ pendingKb: WINDOW_PLEDGE }));
		expect(held.status).toBe("awaiting-strip");
		expect(held.pendingKb).toBe(0);
		expect(held.escrowRolledBackKb).toBe(WINDOW_PLEDGE);
	});

	it("costs no run cap when it rolls back, so the loss leaves no trace", () => {
		expect(
			failGate(withDatabase({ pendingKb: WINDOW_PLEDGE })).faucetEarnedKb
		).toBe(0);
	});

	it("rolls the transaction back on a gate that ends the run", () => {
		let state = withDatabase({
			gatesCleared: 6,
			bankedUnits: 0,
			pendingKb: WINDOW_PLEDGE,
		});
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);

		expect(state.status).toBe("dead");
		expect(state.pendingKb).toBe(0);
		expect(state.escrowRolledBackKb).toBe(WINDOW_PLEDGE);
	});

	it("clamps the commit at whatever run cap is left", () => {
		const cleared = clearGate(
			withDatabase({ faucetEarnedKb: FAUCET_CAP_KB - 10 })
		);
		expect(cleared.escrowCommittedKb).toBe(10);
		expect(cleared.faucetEarnedKb).toBe(FAUCET_CAP_KB);
	});
});

describe("207 Multi-Status", () => {
	const multiPoll = (): RunPoll => ({
		id: "m",
		category: "ts",
		question: "Which are TS utility types?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "Partial", correct: true },
			{ id: "b", label: "Pick", correct: true },
			{ id: "c", label: "Banjo", correct: false },
		],
	});

	const singlePoll = (): RunPoll => ({
		id: "s",
		category: "ts",
		question: "Which is a TS utility type?",
		answerType: "single",
		options: [
			{ id: "s-a", label: "Partial", correct: true },
			{ id: "s-b", label: "Banjo", correct: false },
			{ id: "s-c", label: "Kazooie", correct: false },
		],
	});

	const answeringOn = (first: RunPoll, ...ids: AuditId[]): RunState =>
		audited(
			{ ...createRun([first, ...pool(5)], handed), status: "answering" },
			0,
			...ids
		);

	const earnedOn = (
		first: RunPoll,
		optionIds: string[],
		...ids: AuditId[]
	): number =>
		runReducer(answeringOn(first, ...ids), { type: "answer", optionIds })
			.answeredThisGate[0].coverageEarned ?? 0;

	const outcomeOn = (
		first: RunPoll,
		optionIds: string[],
		...ids: AuditId[]
	): string =>
		runReducer(answeringOn(first, ...ids), { type: "answer", optionIds })
			.answeredThisGate[0].outcome;

	it("pays an exact multiple-choice set one unit, where an unaudited gate pays two", () => {
		expect(earnedOn(multiPoll(), ["a", "b"])).toBe(BASE_UNIT * MULTIPLE_CREDIT);
		expect(earnedOn(multiPoll(), ["a", "b"], "multi-status")).toBe(BASE_UNIT);
	});

	it("runs the flat credit down the partial ladder, so half a set pays half a unit", () => {
		expect(earnedOn(multiPoll(), ["a"], "multi-status")).toBe(BASE_UNIT * 0.5);
	});

	it("leaves the partial verdict alone: only the credit is flattened", () => {
		expect(outcomeOn(multiPoll(), ["a"], "multi-status")).toBe("partial");
		expect(
			runReducer(answeringOn(multiPoll(), "multi-status"), {
				type: "answer",
				optionIds: ["a"],
			}).answeredThisGate[0].coverageFactors?.correct
		).toBe(0.5);
	});

	it("still asks a true single for exactly its one answer", () => {
		expect(outcomeOn(singlePoll(), ["s-a"], "multi-status")).toBe("correct");
		expect(earnedOn(singlePoll(), ["s-a"], "multi-status")).toBe(BASE_UNIT);
	});

	it("cancels a right pick on a true single when a second option is picked", () => {
		expect(outcomeOn(singlePoll(), ["s-a", "s-b"], "multi-status")).toBe(
			"wrong"
		);
		expect(earnedOn(singlePoll(), ["s-a", "s-b"], "multi-status")).toBe(0);
	});

	it("records the poll's true answer type, so the review says what it really was", () => {
		const answered = runReducer(answeringOn(singlePoll(), "multi-status"), {
			type: "answer",
			optionIds: ["s-a"],
		});
		expect(answered.answeredThisGate[0].answerType).toBe("single");
	});
});

describe("the clear's receipt", () => {
	it("records the parts the reward was paid in and the streak it paid on", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		const parts =
			(state.clearThisGateKb ?? 0) +
			(state.overflowThisGateKb ?? 0) +
			(state.interestThisGateKb ?? 0) +
			(state.extraPickThisGateKb ?? 0) +
			(state.escrowCommittedKb ?? 0);

		expect(state.status).toBe("rewarding");
		expect(state.streakAtClose).toBe(SLICE_WINDOW);
		expect(parts).toBe(state.gateRewardKb);
	});
});

describe("Try/Catch turns a fatal close into a held one (ADR-096)", () => {
	// Try/Catch is not in the dealt-hand fixture, so the build is set directly.
	const holding = (
		configs: readonly Config[],
		extra: Partial<RunState> = {}
	): RunState => {
		const base = started([]);
		return {
			...base,
			build: { ...base.build, configs },
			gatesCleared: 6,
			bankedUnits: 0,
			...extra,
		};
	};

	const withCatcher = (
		extra: Partial<RunState> = {},
		alongside: readonly Config[] = [CONFIGS.intellisense]
	): RunState => holding([CONFIGS.tryCatch, ...alongside], extra);

	const closedOnDanger = (state: RunState): RunState => {
		let next = state;
		for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, false);
		return next;
	};

	it("ends the run when no catch is installed", () => {
		expect(closedOnDanger(holding([CONFIGS.intellisense])).status).toBe("dead");
	});

	it("holds the gate instead of ending the run", () => {
		const held = closedOnDanger(withCatcher());
		expect(held.status).toBe("awaiting-strip");
		expect(held.heldBy).toBe("catch");
	});

	it("spends the catch, so a second fatal close is not caught", () => {
		const held = closedOnDanger(withCatcher());
		expect(held.build.configs.map((config) => config.id)).not.toContain(
			CONFIGS.tryCatch.id
		);
		expect(held.deletedConfigs).toEqual([CONFIGS.tryCatch]);
	});

	it("names what caught it, so the hold is never unexplained", () => {
		expect(closedOnDanger(withCatcher()).caughtFatalBy).toBe(
			CONFIGS.tryCatch.label
		);
	});

	it("pays its own weight into the peel it just created", () => {
		const state = withCatcher();
		const quota = failPeelQuotaFor(
			state.build.configs,
			state.gatesCleared,
			scheduleOf(state)
		);
		const held = closedOnDanger(state);

		expect(held.peelSlotsRemaining).toBe(
			Math.max(0, quota - slotsOf(CONFIGS.tryCatch))
		);
	});

	it("settles the whole peel when its weight covers the quota", () => {
		const held = closedOnDanger(withCatcher({}, [CONFIGS.js]));
		expect(held.peelSlotsRemaining).toBe(0);
	});

	it("never lets the peel it created empty the build and kill the run", () => {
		const held = closedOnDanger(withCatcher({ gatesCleared: 12 }));
		expect(held.status).toBe("awaiting-strip");
	});

	it("still rolls back an open transaction, as any held gate does", () => {
		const held = closedOnDanger(
			withCatcher({ pendingKb: 40 }, [CONFIGS.database])
		);
		expect(held.pendingKb).toBe(0);
		expect(held.escrowRolledBackKb).toBe(40);
	});
});

describe("SLA pays for holding to the band it promised (ADR-096)", () => {
	// The build stays on the free rung: a wider one bills every clear, and a
	// bigger reward then buys a bigger bill, which hides the uplift in storage.
	const promising = (band: string, extra: Partial<RunState> = {}): RunState => {
		const base = started([]);
		const prep: RunState = {
			...base,
			status: "rewarding",
			build: { ...base.build, configs: [CONFIGS.sla] },
		};
		return {
			...prep,
			status: base.status,
			...extra,
			slaBand: commitBand(prep, band).slaBand,
		};
	};

	const upliftOn = (state: RunState): number =>
		clearGate(state).slaUpliftKb ?? 0;

	it("adds its share of the gate's own payout when the band holds", () => {
		const cleared = clearGate(promising("ok"));
		expect(cleared.status).toBe("rewarding");
		expect(cleared.slaUpliftKb).toBeGreaterThan(0);
	});

	it("pays more for a bolder promise the gate still meets", () => {
		expect(upliftOn(promising("perfect"))).toBeGreaterThan(
			upliftOn(promising("ok"))
		);
	});

	it("pays nothing on a gate that cleared but fell short of its promise", () => {
		// Deep enough that five right answers clear the gate without filling the
		// bar, which is the only place a promise can be missed on a clear.
		const short = clearGate(
			promising("perfect", { gatesCleared: 4, bankedUnits: 12 })
		);

		expect(short.status).toBe("rewarding");
		expect(short.slaUpliftKb).toBe(0);
	});

	it("carries the uplift into the gate's reward, not beside it", () => {
		const promised = clearGate(promising("ok"));
		const bare = clearGate({ ...promising("ok"), slaBand: undefined });

		expect(promised.gateRewardKb).toBeGreaterThan(bare.gateRewardKb ?? 0);
		expect(promised.storage).toBeGreaterThan(bare.storage);
	});

	it("drops the promise unpaid when the gate holds instead of clearing", () => {
		const held = failGate(promising("ok"));
		expect(held.status).toBe("awaiting-strip");
		expect(held.slaBand).toBeUndefined();
		expect(held.slaUpliftKb).toBeUndefined();
	});

	it("never carries a promise into the next gate", () => {
		expect(clearGate(promising("ok")).slaBand).toBeUndefined();
	});
});

describe("a clear hands a sealed audit, and every close leaves a record (ADR-119)", () => {
	// Deep enough that five right answers clear the gate without filling the bar.
	const deepHealthy = { ...started(["js"]), gatesCleared: 4, bankedUnits: 12 };

	/** The banked total at gate 4 that lands five right answers in the named band. */
	const clearingIn = (band: HeldAuditBand): RunState => {
		const landing = Array.from({ length: 40 }, (_, banked) => ({
			...started(["js"]),
			gatesCleared: 4,
			bankedUnits: banked,
		})).find((state) => {
			const closed = clearGate(state);
			return closed.status === "rewarding" && closed.lastClose?.band === band;
		});
		if (landing === undefined) throw new Error(`no ${band} clear at gate 4`);
		return landing;
	};

	it("hands a sealed audit on a PERFECT clear and stamps the gate", () => {
		const cleared = clearGate(started(["js"]));
		expect(cleared.heldAudit).toEqual({ band: "perfect", gate: 0 });
		expect(cleared.auditHandedAtGate).toBe(0);
		expect(cleared.offeredAudit).toBeUndefined();
	});

	it("hands one on a HEALTHY clear", () => {
		expect(clearGate(deepHealthy).heldAudit).toEqual({
			band: "healthy",
			gate: 4,
		});
	});

	it("hands one on an OK clear too — a thin clear still earns the moment", () => {
		const cleared = clearGate(clearingIn("ok"));
		expect(cleared.lastClose?.band).toBe("ok");
		expect(cleared.heldAudit).toEqual({ band: "ok", gate: 4 });
	});

	it("offers a second while one is held and restamps the gate", () => {
		const held = clearGate({
			...deepHealthy,
			heldAudit: { band: "perfect", gate: 2 },
			auditHandedAtGate: 2,
		});
		expect(held.heldAudit).toEqual({ band: "perfect", gate: 2 });
		expect(held.offeredAudit).toEqual({ band: "healthy", gate: 4 });
		expect(held.auditHandedAtGate).toBe(4);
	});

	it("hands nothing on a held gate", () => {
		const held = failGate(started(["js"]));
		expect(held.heldAudit).toBeUndefined();
		expect(held.offeredAudit).toBeUndefined();
	});

	it("records how the gate closed, on a clear and on a hold alike", () => {
		expect(clearGate(started(["js"])).lastClose).toEqual({
			gate: 0,
			band: "perfect",
			cleared: true,
		});
		expect(failGate(started(["js"])).lastClose).toMatchObject({
			gate: 0,
			cleared: false,
		});
	});
});

describe("surviving a rival's audits pays on top of the clear (ADR-099)", () => {
	const sender = { id: "misty", name: "Misty" };
	const lockedAt = (gate: number): LockedIncident[] => [
		{ id: 1, auditId: "not-found", gate, sentBy: sender },
		{ id: 2, auditId: "read-only", gate, sentBy: sender },
	];

	it("pays the survival bonus per incident the cleared gate carried", () => {
		const attacked = {
			...audited(started(["js"]), 0, "not-found", "read-only"),
			incidents: lockedAt(0),
		};
		const clean = clearGate(started(["js"]));
		const survived = clearGate(attacked);

		expect(survived.incidentSurvivalKb).toBe(2 * INCIDENT_SURVIVAL_KB);
		expect(survived.gateRewardKb).toBe(
			(clean.gateRewardKb ?? 0) + 2 * INCIDENT_SURVIVAL_KB
		);
	});

	it("pays nothing for incidents waiting on a later gate", () => {
		const cleared = clearGate({ ...started(["js"]), incidents: lockedAt(1) });
		expect(cleared.incidentSurvivalKb).toBe(0);
	});
});

describe("withLockedGate", () => {
	const sender = { id: "misty", name: "Misty" };
	const mirrorAt = (gate: number): LockedIncident => ({
		id: 7,
		auditId: "mirrored",
		gate,
		sentBy: sender,
	});

	it("makes the locked incidents the gate's whole audit list", () => {
		const locked = withLockedGate(started(["js"]), 3, [mirrorAt(3)]);
		expect(locked.auditSchedule?.[3]).toEqual(["mirrored"]);
		expect(locked.incidents).toEqual([mirrorAt(3)]);
	});

	it("re-reads the pick budget when a mirror locks onto the gate in front", () => {
		// Three options with one right: a mirror asks for two picks a poll, not one.
		const threeWide = (entry: RunPoll): RunPoll => ({
			...entry,
			options: [
				...entry.options,
				{ id: `${entry.id}-c`, label: "Maybe", correct: false },
			],
		});
		const state = started(["js"]);
		const locked = withLockedGate(
			{ ...state, polls: state.polls.map(threeWide) },
			0,
			[mirrorAt(0)]
		);
		expect(state.window.budget).toBe(SLICE_WINDOW);
		expect(locked.window.budget).toBe(2 * SLICE_WINDOW);
	});

	it("leaves the open window alone when locking a later gate", () => {
		const state = started(["js"]);
		expect(withLockedGate(state, 1, [mirrorAt(1)]).window).toBe(state.window);
	});
});
