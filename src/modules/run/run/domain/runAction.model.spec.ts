import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	coverageDemandFor,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import {
	createRun,
	isAwaitingTomorrow,
	pickBudgetFor,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import {
	isShopLocked,
	runReducer,
} from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	atGateWithBuild,
	configIds,
	failGate,
	handed,
	payPeel,
	poll,
	pool,
	started,
} from "~/modules/run/run/domain/run.factory";

describe("configuring", () => {
	it("refuses to slot beyond the pipeline's slots", () => {
		let state = createRun(pool(60), handed);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = runReducer(state, { type: "slot", configId: id });
		expect(state.pipeline.configs).toHaveLength(3);
	});
});

describe("starter stacks (ADR-026)", () => {
	const pickStack = (state: RunState, stackId: string): RunState =>
		runReducer(state, { type: "pick-stack", stackId });

	it("fills the whole pipeline with the stack and pulls its members from the pool", () => {
		const state = pickStack(createRun(pool(60), handed), "test-everything");
		expect(configIds(state)).toEqual(["js", "ts", "eslint"]);
		const availableIds = state.available.map((config) => config.id);
		expect(availableIds).not.toContain("js");
		expect(availableIds).not.toContain("ts");
		expect(availableIds).not.toContain("eslint");
	});

	it("replaces hand-slotted configs instead of stacking on top of them", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "slot", configId: "css" });
		state = pickStack(state, "test-everything");
		expect(configIds(state)).toEqual(["js", "ts", "eslint"]);
		expect(state.available.map((config) => config.id)).toContain("css");
	});

	it("grants a stack whose members the hand never held", () => {
		const state = pickStack(createRun(pool(60), handed), "ship-it");

		expect(configIds(state)).toEqual(["js", "jsx", "code-coverage"]);
		expect(state.available.map((config) => config.id)).not.toContain("jsx");
	});

	it("ignores an unknown stack id", () => {
		const before = createRun(pool(60), handed);
		expect(pickStack(before, "team-rocket")).toBe(before);
	});

	it("only applies while configuring — a started run keeps its build", () => {
		const before = started(["js"]);
		expect(pickStack(before, "test-everything")).toBe(before);
	});

	it("makes the run startable in one pick", () => {
		let state = pickStack(createRun(pool(60), handed), "test-everything");
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});
});

describe("the gate audits (ADR-035)", () => {
	const atMarsh = (): RunState => ({ ...started(["js"]), gatesCleared: 7 });

	it("pays the wrong option at the mirror, streak and all", () => {
		let state = answerWith(atMarsh(), false);
		expect(state.window.coverageGained).toBe(8.8);
		expect(state.streak).toBe(1);
		state = answerWith(state, false);
		expect(state.streak).toBe(2);
	});

	it("bleeds the meter on the poll's own correct option", () => {
		let state: RunState = {
			...atMarsh(),
			coverage: 100,
			coverageByCategory: { react: 100 },
		};
		state = answerWith(state, true);
		expect(state.window.coverageGained).toBe(0);
		expect(state.coverage).toBe(96);
		expect(state.streak).toBe(0);
	});

	it("asks for every wrong option once a poll has more than one", () => {
		const base = started(["js"]);
		const poll: RunPoll = {
			id: "multi",
			category: "react",
			question: "Which are hooks?",
			answerType: "single",
			options: [
				{ id: "a", label: "useState", correct: true },
				{ id: "b", label: "componentDidMount", correct: false },
				{ id: "c", label: "render", correct: false },
			],
		};
		const state: RunState = {
			...base,
			gatesCleared: 7,
			polls: [poll, ...base.polls.slice(1)],
			currentIndex: 0,
		};
		const both = runReducer(state, {
			type: "answer",
			optionIds: ["b", "c"],
		});
		const half = runReducer(state, { type: "answer", optionIds: ["b"] });
		expect(both.answeredThisGate.at(-1)?.outcome).toBe("correct");
		expect(half.answeredThisGate.at(-1)?.outcome).toBe("partial");
		expect(both.window.coverageGained).toBeGreaterThan(
			half.window.coverageGained
		);
	});

	it("marks the mirrored expectation as the answer to beat", () => {
		const state = answerWith(atMarsh(), false);
		const answered = state.answeredThisGate.at(-1);
		expect(answered?.correct).toEqual(["No"]);
	});

	it("leaks storage every poll at the volcano, more on a miss", () => {
		let state = { ...started(["js"]), gatesCleared: 9, storage: 100 };
		state = answerWith(state, true);
		expect(state.storage).toBe(84);
		state = answerWith(state, false);
		expect(state.storage).toBe(52);
	});

	it("floors the leak at 0 — insolvency stays non-lethal (ADR-023)", () => {
		let state = { ...started(["js"]), gatesCleared: 9, storage: 10 };
		state = answerWith(state, true);
		expect(state.storage).toBe(0);
		expect(state.status).toBe("answering");
	});

	it("ends an Elite run whose build cannot pay the deepened peel", () => {
		const state = failGate(atGateWithBuild(11, 1));
		expect(state.status).toBe("dead");
		expect(state.log.at(-1)).toContain("Run over");
	});

	it("refuses every shop write at a Read-only gate, and none elsewhere", () => {
		const base = started(["js"]);
		const shopping = (gatesCleared: number): RunState => ({
			...base,
			status: "rewarding",
			gatesCleared,
			storage: 1000,
			pipeline: { ...base.pipeline, spots: 4 },
			draftOptions: [CONFIGS.indexedDb],
		});
		const readOnly = shopping(5);
		expect(isShopLocked(readOnly)).toBe(true);
		expect(
			runReducer(readOnly, { type: "draft", configId: "indexed-db" })
		).toBe(readOnly);
		expect(runReducer(readOnly, { type: "set-extra-spots", spots: 1 })).toBe(
			readOnly
		);
		expect(runReducer(readOnly, { type: "rebuild-draft" })).toBe(readOnly);

		const open = shopping(4);
		expect(isShopLocked(open)).toBe(false);
		expect(
			runReducer(open, { type: "draft", configId: "indexed-db" }).pipeline
				.configs
		).toHaveLength(4);
	});

	it("lets a Read-only run start its gate and drop a config", () => {
		const readOnly: RunState = {
			...started(["js"]),
			status: "rewarding",
			gatesCleared: 5,
		};
		expect(runReducer(readOnly, { type: "finish-reward" }).status).toBe(
			"answering"
		);
		expect(
			runReducer(readOnly, { type: "drop", configId: "js" }).pipeline.configs
		).toHaveLength(3);
	});

	it("takes one config offline at a Dependency Outage gate", () => {
		const outage = { ...started(["js"]), gatesCleared: 4 };
		const view = toRunView(outage);
		expect(view.offlineConfigs).toHaveLength(1);
		expect(outage.pipeline.configs).toContain(view.offlineConfigs[0].config);
		expect(view.offlineConfigs[0].audit).toBe("Dependency Outage");
	});

	it("moves the flake from poll to poll at a Flaky Build gate", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 8 };
		const seen = new Set<string>();
		for (let i = 0; i < SLICE_WINDOW - 1; i++) {
			seen.add(toRunView(state).offlineConfigs[0]?.config.id ?? "");
			state = answerWith(state, true);
		}
		expect(seen.size).toBeGreaterThan(1);
	});

	it("switches off the most-upgraded config at a Breaking Change gate", () => {
		const base = started(["js"]);
		const levelled: RunState = {
			...base,
			gatesCleared: 10,
			pipeline: {
				...base.pipeline,
				configs: base.pipeline.configs.map((config, index) =>
					index === 1 ? { ...config, level: 4 } : config
				),
			},
		};
		expect(toRunView(levelled).offlineConfigs[0]?.config.id).toBe(
			levelled.pipeline.configs[1].id
		);
	});

	it("keeps an offline config out of the answer it would have scored", () => {
		const base = started(["js"]);
		const build: RunState = {
			...base,
			gatesCleared: 4,
			pipeline: {
				...base.pipeline,
				spots: 5,
				configs: [
					...base.pipeline.configs,
					CONFIGS.agentsMd,
					CONFIGS.coverageGain,
				],
			},
		};
		const offlineId = toRunView(build).offlineConfigs[0]?.config.id;
		const bonuses = answerWith(build, true)
			.answeredThisGate.at(-1)
			?.coverageBreakdown?.configBonuses.map((bonus) => bonus.configId);
		expect(offlineId).toBeDefined();
		expect(bonuses).not.toContain(offlineId);
		expect(bonuses?.length).toBeGreaterThan(0);
	});

	it("scores an answer past the clock as a miss, whatever was picked", () => {
		const timed = { ...started(["js"]), gatesCleared: 8 };
		const poll = timed.polls[timed.currentIndex];
		const rightOption = poll.options.find((option) => option.correct);
		const late = runReducer(timed, {
			type: "answer",
			optionIds: [rightOption?.id ?? ""],
			elapsedMs: 31_000,
		});
		expect(late.window.coverageGained).toBe(0);
		expect(late.window.correct).toBe(0);
		expect(late.streak).toBe(0);
		expect(late.answeredThisGate.at(-1)?.timedOut).toBe(true);
	});

	it("leaves an answer inside the clock alone", () => {
		const timed = { ...started(["js"]), gatesCleared: 8 };
		const poll = timed.polls[timed.currentIndex];
		const rightOption = poll.options.find((option) => option.correct);
		const inTime = runReducer(timed, {
			type: "answer",
			optionIds: [rightOption?.id ?? ""],
			elapsedMs: 29_000,
		});
		expect(inTime.window.coverageGained).toBeGreaterThan(0);
		expect(inTime.answeredThisGate.at(-1)?.timedOut).toBeUndefined();
	});

	it("frees the polls past the clocked ones", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 8 };
		for (let i = 0; i < 3; i++) state = answerWith(state, true);
		expect(toRunView(state).pollTimeLimitMs).toBeNull();
	});

	it("charges Marsh its full demand — the mirror no longer discounts it", () => {
		expect(toRunView(atMarsh()).gateStake.coverageDemand).toBe(
			coverageDemandFor(7)
		);
	});

	it("counts the picks a mirrored window actually wants", () => {
		const threeOption = (id: string): RunPoll => ({
			id,
			category: "react",
			question: `${id}?`,
			answerType: "single",
			options: [
				{ id: `${id}-a`, label: "A", correct: true },
				{ id: `${id}-b`, label: "B", correct: false },
				{ id: `${id}-c`, label: "C", correct: false },
			],
		});
		const polls = Array.from({ length: 20 }, (_, index) =>
			threeOption(`three-${index}`)
		);
		let base = createRun(polls, [...handed, CONFIGS.length]);
		for (const configId of ["length", "js", "eslint"])
			base = runReducer(base, { type: "slot", configId });
		base = runReducer(base, { type: "start" });

		expect(toRunView(base).correctAnswersThisGate).toBe(SLICE_WINDOW);
		expect(pickBudgetFor(polls, 0, true)).toBe(SLICE_WINDOW * 2);

		const reopened = runReducer(
			{
				...base,
				gatesCleared: 7,
				status: "awaiting-strip" as const,
				peelSpotsRemaining: 0,
			},
			{ type: "resume-climb" }
		);
		expect(toRunView(reopened).correctAnswersThisGate).toBe(SLICE_WINDOW * 2);
	});

	it("Volkswagen CI suppresses the mirror — normal scoring, full demand", () => {
		const base = started(["js"]);
		let state: RunState = {
			...base,
			gatesCleared: 7,
			pipeline: {
				...base.pipeline,
				configs: [...base.pipeline.configs, CONFIGS.volkswagenCi],
			},
		};
		const view = toRunView(state);
		expect(view.gateStake.coverageDemand).toBe(coverageDemandFor(7));
		expect(view.gateStake.audits).toEqual([
			expect.objectContaining({ id: "mirrored", suppressed: true }),
		]);
		state = answerWith(state, true);
		expect(state.window.coverageGained).toBeGreaterThan(0);
	});
});

describe("the daily gate lock", () => {
	it("stays answering when the day's polls run out mid-window", () => {
		let state = started(["js"], 3);
		for (let i = 0; i < 3; i++) state = answerWith(state, true);
		expect(state.status).toBe("answering");
		expect(isAwaitingTomorrow(state)).toBe(true);
	});

	it("ignores an answer while awaiting tomorrow's polls", () => {
		let state = started(["js"], 1);
		state = answerWith(state, true);
		const locked = runReducer(state, {
			type: "answer",
			optionIds: ["ghost"],
		});
		expect(locked).toBe(state);
	});

	it("unlocks once the next day's segment appends polls", () => {
		let state = started(["js"], 2);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(isAwaitingTomorrow(state)).toBe(true);
		const rolled = {
			...state,
			polls: [...state.polls, poll("tomorrow-0", true)],
		};
		expect(isAwaitingTomorrow(rolled)).toBe(false);
	});

	it("opens the shop, not the lock, when the gate clears on the day's last poll", () => {
		let state = started(["js"], SLICE_WINDOW);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(isAwaitingTomorrow(state)).toBe(false);
		state = runReducer(state, { type: "finish-reward" });
		expect(isAwaitingTomorrow(state)).toBe(true);
	});

	it("locks the retry behind tomorrow when the day ends on a failed gate", () => {
		let state = failGate(started(["unit-tests"], SLICE_WINDOW));
		expect(state.status).toBe("awaiting-strip");
		state = runReducer(payPeel(state), { type: "finish-reward" });
		expect(isAwaitingTomorrow(state)).toBe(true);
	});
});

describe("a two-polls-a-day player (ADR-014)", () => {
	const dayPolls = (day: number, count = SLICE_WINDOW): RunPoll[] =>
		Array.from({ length: count }, (_, index) =>
			poll(`day${day}-${index}`, true)
		);

	const nextDay = (
		state: RunState,
		tomorrow: readonly RunPoll[]
	): RunState => ({
		...state,
		polls: [...state.polls.slice(0, state.currentIndex), ...tomorrow],
	});

	it("carries a half-filled gate across the day boundary", () => {
		let state = started(["js"], SLICE_WINDOW);
		state = answerWith(state, true);
		state = answerWith(state, true);

		state = nextDay(state, dayPolls(2));

		expect(state.window.answered).toBe(2);
		expect(isAwaitingTomorrow(state)).toBe(false);
	});
});

describe("the starting pipeline", () => {
	it("starts with empty slots — nothing is pre-installed", () => {
		expect(configIds(createRun(pool(60), handed))).toEqual([]);
	});

	it("refuses to start bare, and starts with spots to spare", () => {
		const bare = createRun(pool(60), handed);
		expect(runReducer(bare, { type: "start" }).status).toBe("configuring");

		let state = runReducer(bare, { type: "slot", configId: "js" });
		state = runReducer(state, { type: "slot", configId: "eslint" });
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});

	it("unslots any config while configuring — Unit Tests included", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "slot", configId: "unit-tests" });
		state = runReducer(state, { type: "unslot", configId: "unit-tests" });
		expect(configIds(state)).toEqual([]);
	});
});
