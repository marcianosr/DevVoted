import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { GATE_COUNT, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	archiveCreditBytes,
	answerTypesOf,
	createRun,
	liveConfigsOf,
	pickBudgetFor,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	atGateWithBuild,
	handed,
	poll,
	started,
} from "~/modules/run/run/domain/run.factory";
import { STORAGE_UNITS } from "~/shared/lib/storage";

describe(".length's pick budget", () => {
	const multiPoll = (id: string): RunPoll => ({
		id,
		category: "react",
		question: `Which of ${id} are Kanto towns?`,
		answerType: "multiple",
		options: [
			{ id: `${id}-a`, label: "Pewter", correct: true },
			{ id: `${id}-b`, label: "Viridian", correct: true },
			{ id: `${id}-c`, label: "Hyrule", correct: false },
		],
	});

	const mixedPool = (size = 60): RunPoll[] => [
		multiPoll("celadon"),
		...Array.from({ length: size - 1 }, (_, index) =>
			poll(`kazooie-${index}`, true)
		),
	];

	const counting = (polls: RunPoll[] = mixedPool()): RunState => {
		let state = createRun(polls, [...handed, CONFIGS.length]);
		for (const configId of ["length", "ts", "css"])
			state = runReducer(state, { type: "install", configId });
		return runReducer(state, { type: "start" });
	};

	const answerIds = (state: RunState, ids: string[]): RunState =>
		runReducer(state, { type: "answer", optionIds: ids });

	const spendAll = (state: RunState): RunState =>
		answerIds(state, ["celadon-a", "celadon-b"]);

	it("fixes the budget from the window's polls when the run starts", () => {
		expect(counting().window.budget).toBe(6);
		expect(pickBudgetFor(mixedPool(), 0)).toBe(6);
	});

	const uncounted = (polls: RunPoll[] = mixedPool()): RunState => {
		let state = createRun(polls, handed);
		for (const configId of ["eslint", "ts", "css"])
			state = runReducer(state, { type: "install", configId });
		return runReducer(state, { type: "start" });
	};

	it("pays nothing for the count it reveals, even where extra picks are owed", () => {
		let state = spendAll(counting());
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);

		let bare = spendAll(uncounted());
		for (let i = 0; i < SLICE_WINDOW - 1; i++) bare = answerWith(bare, true);
		expect(bare.clearedGate).toBe(0);
		expect(state.gateRewardKb).toBe(bare.gateRewardKb);
	});

	it("still clears when the multi-answer poll was hedged — no spend is owed (ADR-035)", () => {
		let state = answerIds(counting(), ["celadon-a"]);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("refreshes the budget for the next gate off the polls it will serve", () => {
		let state = spendAll(counting());
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.budget).toBe(5);
	});
});

describe("the window's answer types", () => {
	const multiPoll = (id: string): RunPoll => ({
		id,
		category: "js",
		question: `Which of ${id} are Kanto towns?`,
		answerType: "multiple",
		options: [
			{ id: `${id}-a`, label: "Pewter", correct: true },
			{ id: `${id}-b`, label: "Viridian", correct: true },
			{ id: `${id}-c`, label: "Hyrule", correct: false },
		],
	});

	it("splits the polls it is given into single and multiple answers", () => {
		expect(
			answerTypesOf([
				poll("pallet", true),
				multiPoll("cerulean"),
				poll("pewter", true),
			])
		).toEqual({ single: 2, multiple: 1 });
	});

	it("counts nothing for a window with no polls left", () => {
		expect(answerTypesOf([])).toEqual({ single: 0, multiple: 0 });
	});
});

describe("archiveCreditBytes", () => {
	const ended = (
		status: "won" | "dead",
		gatesCleared: number,
		storage: number,
		startedAtGate = 0
	) => ({ ...started(["js"]), status, gatesCleared, storage, startedAtGate });

	it("banks every KB of a won run, in bytes", () => {
		expect(archiveCreditBytes(ended("won", 12, 100))).toBe(
			100 * STORAGE_UNITS.KB
		);
	});

	it("banks a dead run's share by the gates it climbed", () => {
		expect(archiveCreditBytes(ended("dead", 6, 130))).toBe(
			Math.round((130 * STORAGE_UNITS.KB * 6) / GATE_COUNT)
		);
	});

	it("banks nothing for a run that died before clearing a gate", () => {
		expect(archiveCreditBytes(ended("dead", 0, 500))).toBe(0);
	});

	it("credits a rescued run only for the gates it climbed itself", () => {
		expect(archiveCreditBytes(ended("dead", 8, 130, 6))).toBe(
			archiveCreditBytes(ended("dead", 2, 130))
		);
	});
});

describe("425 Too Early", () => {
	const BUILD_SIZE = 3;

	it("leaves nothing live on the window's opening poll", () => {
		expect(liveConfigsOf(atGateWithBuild(9, BUILD_SIZE, "too-early"))).toEqual(
			[]
		);
	});

	it("hands the build back once the first answer is in", () => {
		const opener = atGateWithBuild(9, BUILD_SIZE, "too-early");
		const second: RunState = {
			...opener,
			currentIndex: opener.currentIndex + 1,
			window: { ...opener.window, answered: 1 },
		};
		expect(liveConfigsOf(second)).toHaveLength(BUILD_SIZE);
	});
});

describe("510 Not Extended", () => {
	const atVersion = (state: RunState, level: number): RunState => ({
		...state,
		build: {
			...state.build,
			configs: state.build.configs.map((config) => ({ ...config, level })),
		},
	});

	const versionsScored = (state: RunState): (number | undefined)[] =>
		liveConfigsOf(state).map((config) => config.level);

	it("scores every config at its first version while the audit stands", () => {
		expect(
			versionsScored(atVersion(atGateWithBuild(11, 3, "not-extended"), 4))
		).toEqual([1, 1, 1]);
	});

	it("leaves the stored build alone, so the versions are back at the next gate", () => {
		const state = atVersion(atGateWithBuild(11, 3, "not-extended"), 4);
		expect(state.build.configs.map((config) => config.level)).toEqual([
			4, 4, 4,
		]);
	});

	it("touches nothing when no audit flattens versions", () => {
		expect(
			versionsScored(atVersion(atGateWithBuild(11, 3, "not-found"), 4))
		).toEqual([4, 4, 4]);
	});
});
