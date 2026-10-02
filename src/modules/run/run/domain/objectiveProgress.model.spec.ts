import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { ObjectiveMetric } from "~/modules/run/config/domain/configUnlock.model";
import { objectiveIncrementsFor } from "~/modules/run/run/domain/objectiveProgress.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import {
	type RunAction,
	runReducer,
} from "~/modules/run/run/domain/runAction.model";
import {
	answerWith,
	audited,
	clearGate,
	handed,
	pool,
	started,
} from "~/modules/run/run/domain/run.factory";

const incrementsOf = (
	state: RunState,
	action: RunAction
): readonly ObjectiveMetric[] =>
	objectiveIncrementsFor(state, runReducer(state, action), action);

const CLOSE: RunAction = { type: "close-gate" };

const settledIncrementsOf = (
	state: RunState,
	action: RunAction
): readonly ObjectiveMetric[] => {
	const answered = runReducer(state, action);

	return [
		...objectiveIncrementsFor(state, answered, action),
		...objectiveIncrementsFor(answered, runReducer(answered, CLOSE), CLOSE),
	];
};

const answerAction = (state: RunState, correct: boolean): RunAction => {
	const current = state.polls[state.currentIndex];
	const option = current.options.find(
		(candidate) => candidate.correct === correct
	);
	if (!option) throw new Error("no matching option");
	return { type: "answer", optionIds: [option.id] };
};

const answered = (state: RunState, count: number, correct = true): RunState => {
	let next = state;
	for (let i = 0; i < count; i++) next = answerWith(next, correct);
	return next;
};

const demandMet = (state: RunState): RunState => ({
	...state,
	headStartUnits: SLICE_WINDOW * state.gatesCleared,
});

const prepped = (extras: readonly Config[], installIds: string[]): RunState => {
	const base = createRun(pool(60), [...handed, ...extras]);
	const built = installIds.reduce(
		(state, configId) => runReducer(state, { type: "install", configId }),
		base
	);
	return runReducer(built, { type: "start" });
};

describe("landed answers", () => {
	it("counts a correct answer toward the landing, correctness and its category", () => {
		const state = started(["js"]);
		const metrics = incrementsOf(state, answerAction(state, true));
		expect(metrics).toContain("polls-answered");
		expect(metrics).toContain("polls-correct");
		expect(metrics).toContain("category-correct:react");
	});

	const multiAnswerRun = (): RunState => ({
		...createRun(
			[
				{
					id: "m",
					category: "ts",
					question: "Which are TS utility types?",
					answerType: "multiple",
					options: [
						{ id: "a", label: "Partial", correct: true },
						{ id: "b", label: "Pick", correct: true },
						{ id: "c", label: "Banjo", correct: false },
					],
				},
				...pool(5),
			],
			handed
		),
		status: "answering",
	});

	it("counts a paid partial toward the formatter's objective", () => {
		expect(
			incrementsOf(multiAnswerRun(), { type: "answer", optionIds: ["a"] })
		).toContain("partials-paid");
	});

	it("counts a cancelled-out answer as landed only, a miss paying nothing", () => {
		expect(
			incrementsOf(multiAnswerRun(), { type: "answer", optionIds: ["a", "c"] })
		).toEqual(["polls-answered", "category-answered:ts"]);
	});

	it("counts a correct answer as no partial, the two being exclusive", () => {
		const state = started(["js"]);
		expect(incrementsOf(state, answerAction(state, true))).not.toContain(
			"partials-paid"
		);
	});

	it("counts a wrong answer as landed only", () => {
		const state = started(["js"]);
		expect(incrementsOf(state, answerAction(state, false))).toEqual([
			"polls-answered",
			"category-answered:react",
		]);
	});

	it("counts a wrong answer toward the category it was asked in", () => {
		const state = started(["js"]);

		expect(incrementsOf(state, answerAction(state, false))).toContain(
			"category-answered:react"
		);
	});

	it("counts turning up once per answer, never twice for a correct one", () => {
		const state = started(["js"]);
		const metrics = incrementsOf(state, answerAction(state, true));

		expect(
			metrics.filter((metric) => metric === "category-answered:react")
		).toHaveLength(1);
	});

	it("counts a mirror-graded correct toward the real category", () => {
		const state = audited(started(["js"]), 4, "mirrored");
		const metrics = incrementsOf(state, answerAction(state, false));
		expect(metrics).toContain("polls-correct");
		expect(metrics).toContain("category-correct:react");
	});

	it("counts a warm cached hit while a cache config is live", () => {
		const first = prepped([CONFIGS.cache], ["cache"]);
		expect(incrementsOf(first, answerAction(first, true))).not.toContain(
			"cache-hits"
		);
		const warm = answerWith(first, true);
		expect(incrementsOf(warm, answerAction(warm, true))).toContain(
			"cache-hits"
		);
	});

	it("ignores a warm streak without the cache config", () => {
		const warm = answered(started(["js"]), 2);
		expect(incrementsOf(warm, answerAction(warm, true))).not.toContain(
			"cache-hits"
		);
	});

	it("flushes the cache on a wrong answer", () => {
		let state = prepped([CONFIGS.cache], ["cache"]);
		state = answerWith(state, true);
		state = answerWith(state, false);
		expect(incrementsOf(state, answerAction(state, true))).not.toContain(
			"cache-hits"
		);
	});
});

describe("windows", () => {
	it("counts a perfect window when the closing answer lands", () => {
		const closing = answered(started(["js"]), SLICE_WINDOW - 1);
		const metrics = incrementsOf(closing, answerAction(closing, true));
		expect(metrics).toContain("perfect-windows");
		expect(metrics).not.toContain("perfect-window-deep");
		expect(metrics).not.toContain("exact-estimates");
	});

	it("counts a deep perfect window past gate 3", () => {
		const closing = answered(
			demandMet(audited(started(["js"]), 3)),
			SLICE_WINDOW - 1
		);
		const metrics = incrementsOf(closing, answerAction(closing, true));
		expect(metrics).toContain("perfect-windows");
		expect(metrics).toContain("perfect-window-deep");
	});

	it("loses the perfect window to a single miss", () => {
		let state = answerWith(started(["js"]), false);
		state = answered(state, SLICE_WINDOW - 2);
		const metrics = settledIncrementsOf(state, answerAction(state, true));
		expect(metrics).not.toContain("perfect-windows");
		expect(metrics).toContain("gates-cleared");
	});
});

describe("estimates", () => {
	const estimating = (count: number): RunState => {
		const base = createRun(pool(60), [...handed, CONFIGS.planningPoker]);
		const built = ["planning-poker", "js", "ts", "css"].reduce(
			(state, configId) => runReducer(state, { type: "install", configId }),
			base
		);
		const committed = runReducer(built, { type: "estimate", count });
		return runReducer(committed, { type: "start" });
	};

	it("counts an estimate the window met when it settles", () => {
		const closing = answered(estimating(SLICE_WINDOW), SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).toContain(
			"exact-estimates"
		);
	});

	it("counts an estimate the window beat, because the number is a floor", () => {
		const closing = answered(estimating(SLICE_WINDOW - 1), SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).toContain(
			"exact-estimates"
		);
	});

	it("ignores an estimate the window fell short of", () => {
		const closing = answered(estimating(SLICE_WINDOW), SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, false))).not.toContain(
			"exact-estimates"
		);
	});

	it("pays the met estimate even when the gate ends the run", () => {
		let state = answerWith(audited(estimating(1), 9), true);
		state = answered(state, SLICE_WINDOW - 2, false);
		const answeredOut = runReducer(state, answerAction(state, false));
		expect(runReducer(answeredOut, CLOSE).status).toBe("dead");
		const metrics = settledIncrementsOf(state, answerAction(state, false));
		expect(metrics).toContain("exact-estimates");
		expect(metrics).not.toContain("gates-cleared");
	});
});

describe("gate clears", () => {
	it("names every gate a clear reached, so depth can earn a service", () => {
		let state = answerWith(started(["js"]), false);
		state = answered(state, SLICE_WINDOW - 2);
		const metrics = settledIncrementsOf(state, answerAction(state, true));
		expect(metrics).toContain("reached-gate:1");
		expect(metrics).not.toContain("reached-gate:2");
	});

	it("counts the clear, its audit and the full build", () => {
		const closing = answered(
			demandMet(audited(started(["js"]), 4, "memory-leak")),
			SLICE_WINDOW - 1
		);
		const metrics = settledIncrementsOf(closing, answerAction(closing, true));
		expect(metrics).toContain("gates-cleared");
		expect(metrics).toContain("audited-gates-cleared");
		expect(metrics).toContain("full-build-clear");
	});

	it("counts no audit on an unaudited clear", () => {
		const closing = answered(started(["js"]), SLICE_WINDOW - 1);
		const metrics = settledIncrementsOf(closing, answerAction(closing, true));
		expect(metrics).toContain("gates-cleared");
		expect(metrics).not.toContain("audited-gates-cleared");
	});

	it("counts nothing gate-shaped on a failed close", () => {
		const state = answered(started(["js"]), SLICE_WINDOW - 1, false);
		const metrics = settledIncrementsOf(state, answerAction(state, false));
		expect(metrics).toEqual(["polls-answered", "category-answered:react"]);
	});

	it("counts a mirror clear without a miss exactly once each", () => {
		const closing = answered(
			demandMet(audited(started(["js"]), 4, "mirrored")),
			SLICE_WINDOW - 1,
			false
		);
		const metrics = settledIncrementsOf(closing, answerAction(closing, false));
		expect(metrics).toContain("mirror-clear-no-miss");
		expect(new Set(metrics).size).toBe(metrics.length);
	});

	it("misses the mirror badge when an answer missed", () => {
		let state = answerWith(
			demandMet(audited(started(["js"]), 4, "mirrored")),
			true
		);
		state = answered(state, SLICE_WINDOW - 2, false);
		const metrics = settledIncrementsOf(state, answerAction(state, false));
		expect(metrics).toContain("gates-cleared");
		expect(metrics).not.toContain("mirror-clear-no-miss");
	});

	it("skips the full-build badge while a slot sits open", () => {
		const state = started(["js"]);
		const roomy: RunState = {
			...state,
			build: {
				...state.build,
				configs: [...state.build.configs, CONFIGS.strict],
			},
		};
		const closing = answered(roomy, SLICE_WINDOW - 1);
		expect(
			settledIncrementsOf(closing, answerAction(closing, true))
		).not.toContain("full-build-clear");
	});

	it("counts a clear holding two upgraded configs", () => {
		const state = started(["js"]);
		const upgraded: RunState = {
			...state,
			build: {
				...state.build,
				configs: state.build.configs.map((config, index) =>
					index < 2 ? { ...config, level: 2 } : config
				),
			},
		};
		const closing = answered(upgraded, SLICE_WINDOW - 1);
		expect(settledIncrementsOf(closing, answerAction(closing, true))).toContain(
			"double-v2-clear"
		);
	});

	it("needs both configs upgraded for the double badge", () => {
		const state = started(["js"]);
		const single: RunState = {
			...state,
			build: {
				...state.build,
				configs: state.build.configs.map((config, index) =>
					index === 0 ? { ...config, level: 2 } : config
				),
			},
		};
		const closing = answered(single, SLICE_WINDOW - 1);
		expect(
			settledIncrementsOf(closing, answerAction(closing, true))
		).not.toContain("double-v2-clear");
	});

	it("counts a lean arrival at gate four", () => {
		const state: RunState = {
			...demandMet(audited(started(["js"]), 3)),
			storage: 0,
		};
		const closing = answered(state, SLICE_WINDOW - 1);
		expect(settledIncrementsOf(closing, answerAction(closing, true))).toContain(
			"lean-gate-four"
		);
	});

	it("skips the lean badge holding 16 KB or more", () => {
		const state: RunState = {
			...demandMet(audited(started(["js"]), 3)),
			storage: 100,
		};
		const closing = answered(state, SLICE_WINDOW - 1);
		expect(
			settledIncrementsOf(closing, answerAction(closing, true))
		).not.toContain("lean-gate-four");
	});

	it("skips the lean badge at any other gate", () => {
		const state: RunState = {
			...demandMet(audited(started(["js"]), 2)),
			storage: 0,
		};
		const closing = answered(state, SLICE_WINDOW - 1);
		expect(
			settledIncrementsOf(closing, answerAction(closing, true))
		).not.toContain("lean-gate-four");
	});
});

describe("run actions", () => {
	it("counts a community peek", () => {
		const state: RunState = {
			...started(["telemetry", "js"]),
			storage: 512,
		};
		expect(settledIncrementsOf(state, { type: "peek-poll" })).toEqual([
			"community-peeks",
		]);
	});

	it("counts a locked offer", () => {
		const shopping: RunState = {
			...clearGate(
				prepped([CONFIGS.yarnLock], ["yarn-lock", "js", "ts", "css"])
			),
			storage: 512,
		};
		const offerId = shopping.draftOptions[0].id;
		expect(
			incrementsOf(shopping, { type: "lock-offer", configId: offerId })
		).toEqual(["offers-locked"]);
	});

	it("counts a switched arm", () => {
		const state = prepped([CONFIGS.abTest], ["ab-test", "js", "ts"]);
		expect(
			incrementsOf(state, { type: "switch-arm", configId: "ab-test" })
		).toEqual(["arms-switched"]);
	});

	it("counts the third sale of one shop exactly once as the one-shot", () => {
		let state = clearGate(started(["js"]));
		expect(
			incrementsOf(state, { type: "sell", configId: state.build.configs[0].id })
		).toEqual(["configs-sold"]);
		state = runReducer(state, {
			type: "sell",
			configId: state.build.configs[0].id,
		});
		state = runReducer(state, {
			type: "sell",
			configId: state.build.configs[0].id,
		});
		expect(
			incrementsOf(state, { type: "sell", configId: state.build.configs[0].id })
		).toEqual(["configs-sold", "sold-three-one-shop"]);
	});

	it("counts a rebuilt draft", () => {
		const shopping: RunState = { ...clearGate(started(["js"])), storage: 512 };
		expect(settledIncrementsOf(shopping, { type: "rebuild-draft" })).toEqual([
			"rebuilds",
		]);
	});

	it("counts a committed reorder when the answer lands", () => {
		const state: RunState = { ...started(["js"]), rebasedThisGate: true };
		expect(settledIncrementsOf(state, answerAction(state, true))).toContain(
			"gates-reordered"
		);
	});

	it("counts no reorder without the rebase mark", () => {
		const state = started(["js"]);
		expect(settledIncrementsOf(state, answerAction(state, true))).not.toContain(
			"gates-reordered"
		);
	});

	it("returns nothing for a refused action", () => {
		const answering = started(["js"]);
		expect(settledIncrementsOf(answering, { type: "finish-reward" })).toEqual(
			[]
		);
	});
});

describe("run end", () => {
	const alive = { ...started(["js"]), gatesCleared: 6 };
	const endedWith = (
		overrides: Partial<RunState>
	): readonly ObjectiveMetric[] =>
		objectiveIncrementsFor(alive, { ...alive, ...overrides }, CLOSE);

	it("counts the bank when a dead run's credit reaches 256 KB, at its gates' share", () => {
		expect(endedWith({ status: "dead", storage: 555 })).toContain(
			"banked-256-one-run"
		);
		expect(endedWith({ status: "dead", storage: 554 })).not.toContain(
			"banked-256-one-run"
		);
	});

	it("counts a won run's bank at the full rate", () => {
		expect(endedWith({ status: "won", storage: 256 })).toContain(
			"banked-256-one-run"
		);
		expect(endedWith({ status: "won", storage: 255 })).not.toContain(
			"banked-256-one-run"
		);
	});

	it("counts the kept starting config while the build still holds one of the dealt hand", () => {
		expect(endedWith({ status: "dead" })).toContain(
			"finished-holding-a-dealt-config"
		);
		expect(
			endedWith({ status: "dead", build: { ...alive.build, configs: [] } })
		).not.toContain("finished-holding-a-dealt-config");
	});

	it("counts neither while the run goes on", () => {
		expect(endedWith({ storage: 9999 })).toEqual([]);
	});

	it("counts neither a second time once the run is already over", () => {
		const dead: RunState = { ...alive, status: "dead", storage: 9999 };

		expect(
			objectiveIncrementsFor(dead, { ...dead, storage: 1 }, CLOSE)
		).toEqual([]);
	});
});

describe("special titles", () => {
	const base = started(["js"]);
	const landing = (
		outcome: AnsweredPoll["outcome"],
		overrides: Partial<AnsweredPoll> = {}
	): AnsweredPoll => ({
		id: "p1",
		question: "Which Pokémon does Ash choose in Pallet Town?",
		category: "js",
		outcome,
		picked: [],
		...overrides,
	});
	const stepped = (
		state: RunState,
		overrides: Partial<RunState>,
		action: RunAction = CLOSE
	): readonly ObjectiveMetric[] =>
		objectiveIncrementsFor(state, { ...state, ...overrides }, action);
	const landed = (
		state: RunState,
		poll: AnsweredPoll
	): readonly ObjectiveMetric[] =>
		stepped(state, { allAnswered: [...(state.allAnswered ?? []), poll] });
	const clearedAt = (
		state: RunState,
		band: CoverageBandId,
		overrides: Partial<RunState> = {}
	): readonly ObjectiveMetric[] =>
		stepped(state, {
			gatesCleared: state.gatesCleared + 1,
			lastClose: { gate: state.gatesCleared, band, cleared: true },
			...overrides,
		});

	it("counts a run's first answer when it is exactly correct", () => {
		expect(landed(base, landing("correct"))).toContain("first-poll-correct");
	});

	it("counts no first answer that was only partly right", () => {
		expect(landed(base, landing("partial"))).not.toContain(
			"first-poll-correct"
		);
	});

	it("counts no correct answer after the run's first", () => {
		const second = { ...base, allAnswered: [landing("wrong")] };
		expect(landed(second, landing("correct"))).not.toContain(
			"first-poll-correct"
		);
	});

	it("counts a won run in which every answer was correct", () => {
		expect(
			stepped(base, {
				status: "won",
				allAnswered: [landing("correct"), landing("correct")],
			})
		).toContain("won-every-answer-correct");
	});

	it("counts no all-correct win when one answer was partial", () => {
		expect(
			stepped(base, {
				status: "won",
				allAnswered: [landing("correct"), landing("partial")],
			})
		).not.toContain("won-every-answer-correct");
	});

	it("counts an audited gate cleared at exactly OK", () => {
		const auditedGate = audited(base, 4, "memory-leak");
		expect(clearedAt(auditedGate, "ok")).toContain("audited-clear-ok");
	});

	it("counts no OK badge for an audited gate cleared HEALTHY", () => {
		const auditedGate = audited(base, 4, "memory-leak");
		expect(clearedAt(auditedGate, "healthy")).not.toContain("audited-clear-ok");
	});

	it("counts no OK badge for an unaudited gate cleared at OK", () => {
		expect(clearedAt(base, "ok")).not.toContain("audited-clear-ok");
	});

	it("counts one answer that earned ten coverage units", () => {
		expect(landed(base, landing("correct", { coverageEarned: 10 }))).toContain(
			"ten-unit-answer"
		);
	});

	it("counts no answer that earned nine units", () => {
		expect(
			landed(base, landing("correct", { coverageEarned: 9 }))
		).not.toContain("ten-unit-answer");
	});

	it("counts a gate closed past full coverage, paid as overflow", () => {
		expect(clearedAt(base, "perfect", { overflowThisGateKb: 8 })).toContain(
			"gate-over-full"
		);
	});

	it("counts no overflow for a gate closed exactly full", () => {
		expect(clearedAt(base, "perfect", { overflowThisGateKb: 0 })).not.toContain(
			"gate-over-full"
		);
	});

	it("counts a clear after missing the gate's first two polls", () => {
		const recovering = {
			...base,
			answeredThisGate: [
				landing("wrong"),
				landing("partial"),
				landing("correct"),
				landing("correct"),
				landing("correct"),
			],
		};
		expect(clearedAt(recovering, "ok")).toContain("cleared-after-two-misses");
	});

	it("counts no recovery after skipping the opening, which misses nothing", () => {
		const skipping = {
			...base,
			answeredThisGate: [
				landing("skipped"),
				landing("skipped"),
				landing("correct"),
				landing("correct"),
				landing("correct"),
			],
		};
		expect(clearedAt(skipping, "ok")).not.toContain("cleared-after-two-misses");
	});

	it("counts no recovery when only the first poll missed", () => {
		const recovering = {
			...base,
			answeredThisGate: [
				landing("wrong"),
				landing("correct"),
				landing("correct"),
			],
		};
		expect(clearedAt(recovering, "ok")).not.toContain(
			"cleared-after-two-misses"
		);
	});

	it("counts no recovery on a gate that held", () => {
		const recovering = {
			...base,
			answeredThisGate: [landing("wrong"), landing("wrong")],
		};
		expect(
			stepped(recovering, {
				lastClose: { gate: 0, band: "shaky", cleared: false },
			})
		).not.toContain("cleared-after-two-misses");
	});

	const holding = (count: number): RunState => ({
		...base,
		build: {
			...base.build,
			configs: Object.values(CONFIGS).slice(0, count),
		},
	});

	it("counts the moment a build first holds eight configs", () => {
		expect(stepped(holding(7), { build: holding(8).build }, CLOSE)).toContain(
			"eight-configs-held"
		);
	});

	it("counts no eighth config while the build stays at eight", () => {
		expect(stepped(holding(8), { storage: 1 })).not.toContain(
			"eight-configs-held"
		);
	});

	it("counts no build of seven configs", () => {
		expect(stepped(holding(6), { build: holding(7).build })).not.toContain(
			"eight-configs-held"
		);
	});

	const DRAFT: RunAction = { type: "draft", configId: "js" };

	it("counts an install after three rebuilds in one shop", () => {
		const shop = { ...base, rebuildsUsed: 3, draftedThisGate: [] };
		expect(stepped(shop, { draftedThisGate: ["js"] }, DRAFT)).toContain(
			"install-after-three-rebuilds"
		);
	});

	it("counts no install after two rebuilds", () => {
		const shop = { ...base, rebuildsUsed: 2, draftedThisGate: [] };
		expect(stepped(shop, { draftedThisGate: ["js"] }, DRAFT)).not.toContain(
			"install-after-three-rebuilds"
		);
	});

	it("counts landing on exactly 418 KB", () => {
		expect(stepped({ ...base, storage: 400 }, { storage: 418 })).toContain(
			"storage-418"
		);
	});

	it("counts no teapot at 417 KB, nor again while sitting on 418", () => {
		expect(stepped({ ...base, storage: 400 }, { storage: 417 })).not.toContain(
			"storage-418"
		);
		expect(
			stepped({ ...base, storage: 418 }, { streak: 1, storage: 418 })
		).not.toContain("storage-418");
	});

	const REFUSE: RunAction = { type: "refuse-gate" };

	it("counts refusing the peel of a SHAKY gate", () => {
		const held = {
			...base,
			lastClose: { gate: 0, band: "shaky", cleared: false },
		} satisfies RunState;
		expect(stepped(held, { status: "dead" }, REFUSE)).toContain(
			"refused-shaky-peel"
		);
	});

	it("counts no WONTFIX for refusing a gate held at DANGER", () => {
		const held = {
			...base,
			lastClose: { gate: 0, band: "danger", cleared: false },
		} satisfies RunState;
		expect(stepped(held, { status: "dead" }, REFUSE)).not.toContain(
			"refused-shaky-peel"
		);
	});
});
