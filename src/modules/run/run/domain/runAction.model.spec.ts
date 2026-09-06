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
	audited,
	clearGate,
	configIds,
	failGate,
	handed,
	payPeel,
	poll,
	pool,
	started,
} from "~/modules/run/run/domain/run.factory";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";

describe("configuring", () => {
	it("refuses to slot beyond the build's slots", () => {
		let state = createRun(pool(60), handed);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = runReducer(state, { type: "install", configId: id });
		expect(state.build.configs).toHaveLength(3);
	});

	it("keeps an installed config in the hand, so the deal reads as one list", () => {
		const state = runReducer(createRun(pool(60), handed), {
			type: "install",
			configId: "js",
		});

		expect(configIds(state)).toEqual(["js"]);
		expect(state.available.map((config) => config.id)).toContain("js");
	});

	it("refuses to install the same config twice", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "install", configId: "js" });
		state = runReducer(state, { type: "install", configId: "js" });

		expect(configIds(state)).toEqual(["js"]);
	});

	it("uninstalls without duplicating the card back into the hand", () => {
		let state = runReducer(createRun(pool(60), handed), {
			type: "install",
			configId: "js",
		});
		state = runReducer(state, { type: "uninstall", configId: "js" });

		expect(configIds(state)).toEqual([]);
		expect(state.available.filter((config) => config.id === "js")).toHaveLength(
			1
		);
	});
});

describe("the opening build (ADR-057)", () => {
	it("opens empty — the deal decides nothing for the player", () => {
		const state = createRun(pool(60), handed);

		expect(configIds(state)).toEqual([]);
		expect(state.available).toHaveLength(handed.length);
	});

	it("refuses to start until one config is picked, then allows it", () => {
		const dealt = createRun(pool(60), handed);

		expect(runReducer(dealt, { type: "start" }).status).toBe("configuring");

		const picked = runReducer(dealt, { type: "install", configId: "js" });

		expect(runReducer(picked, { type: "start" }).status).toBe("answering");
	});
});

describe("the gate audits (ADR-035, drawn per ADR-056)", () => {
	const atMarsh = (): RunState => audited(started(["js"]), 7, "mirrored");

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
		expect(state.coverage).toBe(94.3);
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
		const state: RunState = audited(
			{
				...base,
				polls: [poll, ...base.polls.slice(1)],
				currentIndex: 0,
			},
			7,
			"mirrored"
		);
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

	it("leaks storage every poll at a 507 gate, more on a miss", () => {
		let state = audited({ ...started(["js"]), storage: 100 }, 9, "memory-leak");
		state = answerWith(state, true);
		expect(state.storage).toBe(84);
		state = answerWith(state, false);
		expect(state.storage).toBe(52);
	});

	it("floors the leak at 0 — insolvency stays non-lethal (ADR-023)", () => {
		let state = audited({ ...started(["js"]), storage: 10 }, 9, "memory-leak");
		state = answerWith(state, true);
		expect(state.storage).toBe(0);
		expect(state.status).toBe("answering");
	});

	it("ends an Elite run whose build cannot pay the deepened peel", () => {
		const state = failGate(atGateWithBuild(11, 1, "strip"));
		expect(state.status).toBe("dead");
		expect(state.log.at(-1)).toContain("Run over");
	});

	it("refuses every shop write at a 405 Method Not Allowed gate, and none elsewhere", () => {
		const base = started(["js"]);
		const shopping = (gatesCleared: number, ...ids: AuditId[]): RunState =>
			audited(
				{
					...base,
					status: "rewarding",
					storage: 1000,
					build: { ...base.build, slots: 4 },
					draftOptions: [CONFIGS.indexedDb],
				},
				gatesCleared,
				...ids
			);
		const readOnly = shopping(6, "read-only");
		expect(isShopLocked(readOnly)).toBe(true);
		expect(
			runReducer(readOnly, { type: "draft", configId: "indexed-db" })
		).toBe(readOnly);
		expect(runReducer(readOnly, { type: "buy-slot" })).toBe(readOnly);
		expect(runReducer(readOnly, { type: "rebuild-draft" })).toBe(readOnly);

		const open = shopping(4);
		expect(isShopLocked(open)).toBe(false);
		expect(
			runReducer(open, { type: "draft", configId: "indexed-db" }).build.configs
		).toHaveLength(4);
	});

	it("lets a Read-only run start its gate and drop a config", () => {
		const readOnly: RunState = audited(
			{ ...started(["js"]), status: "rewarding" },
			5,
			"read-only"
		);
		expect(runReducer(readOnly, { type: "finish-reward" }).status).toBe(
			"answering"
		);
		expect(
			runReducer(readOnly, { type: "drop", configId: "js" }).build.configs
		).toHaveLength(3);
	});

	it("takes one config offline at a Dependency Outage gate", () => {
		const outage = audited(started(["js"]), 4, "dependency-outage");
		const view = toRunView(outage);
		expect(view.offlineConfigs).toHaveLength(1);
		expect(outage.build.configs).toContain(view.offlineConfigs[0].config);
		expect(view.offlineConfigs[0].audit).toBe("424 Failed Dependency");
	});

	it("moves the flake from poll to poll at a Flaky Build gate", () => {
		let state: RunState = audited(started(["js"]), 8, "flaky-build");
		const seen = new Set<string>();
		for (let i = 0; i < SLICE_WINDOW - 1; i++) {
			seen.add(toRunView(state).offlineConfigs[0]?.config.id ?? "");
			state = answerWith(state, true);
		}
		expect(seen.size).toBeGreaterThan(1);
	});

	it("switches off the most-upgraded config at a Breaking Change gate", () => {
		const base = started(["js"]);
		const levelled: RunState = audited(
			{
				...base,
				build: {
					...base.build,
					configs: base.build.configs.map((config, index) =>
						index === 1 ? { ...config, level: 4 } : config
					),
				},
			},
			10,
			"breaking-change"
		);
		expect(toRunView(levelled).offlineConfigs[0]?.config.id).toBe(
			levelled.build.configs[1].id
		);
	});

	it("keeps an offline config out of the answer it would have scored", () => {
		const base = started(["js"]);
		const build: RunState = audited(
			{
				...base,
				build: {
					...base.build,
					slots: 5,
					configs: [
						...base.build.configs,
						CONFIGS.agentsMd,
						CONFIGS.intellisense,
					],
				},
			},
			4,
			"dependency-outage"
		);
		const offlineId = toRunView(build).offlineConfigs[0]?.config.id;
		const bonuses = answerWith(build, true)
			.answeredThisGate.at(-1)
			?.coverageBreakdown?.configBonuses.map((bonus) => bonus.configId);
		expect(offlineId).toBeDefined();
		expect(bonuses).not.toContain(offlineId);
		expect(bonuses?.length).toBeGreaterThan(0);
	});

	it("scores an answer past the clock as a miss, whatever was picked", () => {
		const timed = audited(started(["js"]), 8, "timeout");
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
		const timed = audited(started(["js"]), 8, "timeout");
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
		let state: RunState = audited(started(["js"]), 8, "timeout");
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
			base = runReducer(base, { type: "install", configId });
		base = runReducer(base, { type: "start" });

		expect(toRunView(base).correctAnswersThisGate).toBe(SLICE_WINDOW);
		expect(pickBudgetFor(polls, 0, true)).toBe(SLICE_WINDOW * 2);

		const reopened = runReducer(
			audited(
				{
					...base,
					status: "awaiting-strip" as const,
					peelSlotsRemaining: 0,
				},
				7,
				"mirrored"
			),
			{ type: "resume-climb" }
		);
		expect(toRunView(reopened).correctAnswersThisGate).toBe(SLICE_WINDOW * 2);
	});

	it("Volkswagen CI suppresses the mirror — normal scoring, full demand", () => {
		const base = started(["js"]);
		let state: RunState = audited(
			{
				...base,
				build: {
					...base.build,
					configs: [...base.build.configs, CONFIGS.volkswagenCi],
				},
			},
			7,
			"mirrored"
		);
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

describe("the starting build", () => {
	it("starts with empty slots — nothing is pre-installed", () => {
		expect(configIds(createRun(pool(60), handed))).toEqual([]);
	});

	it("refuses to start bare, and starts with slots to spare", () => {
		const bare = createRun(pool(60), handed);
		expect(runReducer(bare, { type: "start" }).status).toBe("configuring");

		let state = runReducer(bare, { type: "install", configId: "js" });
		state = runReducer(state, { type: "install", configId: "eslint" });
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});

	it("unslots any config while configuring — Unit Tests included", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "install", configId: "unit-tests" });
		state = runReducer(state, { type: "uninstall", configId: "unit-tests" });
		expect(configIds(state)).toEqual([]);
	});
});

describe("the storage high-water mark", () => {
	it("records the best KB the run has held", () => {
		const cleared = clearGate(started(["js"]));

		expect(cleared.storage).toBeGreaterThan(0);
		expect(cleared.peakStorageKb).toBe(cleared.storage);
	});

	it("holds the mark once the balance is spent back down", () => {
		const rich = {
			...clearGate(started(["js"])),
			storage: 400,
			peakStorageKb: 400,
		};
		const spent = runReducer(rich, { type: "buy-slot" });

		expect(spent.storage).toBeLessThan(400);
		expect(spent.peakStorageKb).toBe(400);
	});
});
