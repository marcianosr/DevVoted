import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { ObjectiveMetric } from "~/modules/run/config/domain/configUnlock.model";
import { objectiveIncrementsFor } from "~/modules/run/run/domain/objectiveProgress.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
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
	window: { ...state.window, coverageGained: 100 },
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

	it("counts a wrong answer as landed only", () => {
		const state = started(["js"]);
		expect(incrementsOf(state, answerAction(state, false))).toEqual([
			"polls-answered",
		]);
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
		const metrics = incrementsOf(state, answerAction(state, true));
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

	it("counts an exact estimate when the window settles", () => {
		const closing = answered(estimating(SLICE_WINDOW), SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).toContain(
			"exact-estimates"
		);
	});

	it("ignores an estimate the window missed", () => {
		const closing = answered(estimating(SLICE_WINDOW - 1), SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).not.toContain(
			"exact-estimates"
		);
	});

	it("pays the exact estimate even when the gate fails", () => {
		let state = answerWith(audited(estimating(1), 6), true);
		state = answered(state, SLICE_WINDOW - 2, false);
		const closing = runReducer(state, answerAction(state, false));
		expect(closing.status).toBe("awaiting-strip");
		const metrics = incrementsOf(state, answerAction(state, false));
		expect(metrics).toContain("exact-estimates");
		expect(metrics).not.toContain("gates-cleared");
	});
});

describe("gate clears", () => {
	it("counts the clear, its audit and the full build", () => {
		const closing = answered(
			demandMet(audited(started(["js"]), 4, "memory-leak")),
			SLICE_WINDOW - 1
		);
		const metrics = incrementsOf(closing, answerAction(closing, true));
		expect(metrics).toContain("gates-cleared");
		expect(metrics).toContain("audited-gates-cleared");
		expect(metrics).toContain("full-build-clear");
	});

	it("counts no audit on an unaudited clear", () => {
		const closing = answered(started(["js"]), SLICE_WINDOW - 1);
		const metrics = incrementsOf(closing, answerAction(closing, true));
		expect(metrics).toContain("gates-cleared");
		expect(metrics).not.toContain("audited-gates-cleared");
	});

	it("counts nothing gate-shaped on a failed close", () => {
		const state = answered(started(["js"]), SLICE_WINDOW - 1, false);
		const metrics = incrementsOf(state, answerAction(state, false));
		expect(metrics).toEqual(["polls-answered"]);
	});

	it("counts a mirror clear without a miss exactly once each", () => {
		const closing = answered(
			demandMet(audited(started(["js"]), 4, "mirrored")),
			SLICE_WINDOW - 1,
			false
		);
		const metrics = incrementsOf(closing, answerAction(closing, false));
		expect(metrics).toContain("mirror-clear-no-miss");
		expect(new Set(metrics).size).toBe(metrics.length);
	});

	it("misses the mirror badge when an answer missed", () => {
		let state = answerWith(
			demandMet(audited(started(["js"]), 4, "mirrored")),
			true
		);
		state = answered(state, SLICE_WINDOW - 2, false);
		const metrics = incrementsOf(state, answerAction(state, false));
		expect(metrics).toContain("gates-cleared");
		expect(metrics).not.toContain("mirror-clear-no-miss");
	});

	it("skips the full-build badge while a slot sits open", () => {
		const state = started(["js"]);
		const roomy: RunState = {
			...state,
			build: { ...state.build, slots: state.build.slots + 1 },
		};
		const closing = answered(roomy, SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).not.toContain(
			"full-build-clear"
		);
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
		expect(incrementsOf(closing, answerAction(closing, true))).toContain(
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
		expect(incrementsOf(closing, answerAction(closing, true))).not.toContain(
			"double-v2-clear"
		);
	});

	it("counts a lean arrival at gate four", () => {
		const state: RunState = {
			...demandMet(audited(started(["js"]), 3)),
			storage: 0,
		};
		const closing = answered(state, SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).toContain(
			"lean-gate-four"
		);
	});

	it("skips the lean badge holding 16 KB or more", () => {
		const state: RunState = {
			...demandMet(audited(started(["js"]), 3)),
			storage: 100,
		};
		const closing = answered(state, SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).not.toContain(
			"lean-gate-four"
		);
	});

	it("skips the lean badge at any other gate", () => {
		const state: RunState = {
			...demandMet(audited(started(["js"]), 2)),
			storage: 0,
		};
		const closing = answered(state, SLICE_WINDOW - 1);
		expect(incrementsOf(closing, answerAction(closing, true))).not.toContain(
			"lean-gate-four"
		);
	});
});

describe("run actions", () => {
	it("counts a community peek", () => {
		const state: RunState = {
			...started(["telemetry", "js"]),
			storage: 512,
		};
		expect(incrementsOf(state, { type: "peek-poll" })).toEqual([
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
		expect(incrementsOf(shopping, { type: "rebuild-draft" })).toEqual([
			"rebuilds",
		]);
	});

	it("counts a committed reorder when the answer lands", () => {
		const state: RunState = { ...started(["js"]), rebasedThisGate: true };
		expect(incrementsOf(state, answerAction(state, true))).toContain(
			"gates-reordered"
		);
	});

	it("counts no reorder without the rebase mark", () => {
		const state = started(["js"]);
		expect(incrementsOf(state, answerAction(state, true))).not.toContain(
			"gates-reordered"
		);
	});

	it("returns nothing for a refused action", () => {
		const answering = started(["js"]);
		expect(incrementsOf(answering, { type: "finish-reward" })).toEqual([]);
	});
});
