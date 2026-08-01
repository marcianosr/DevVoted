import { describe, expect, it } from "vitest";

import { KANTO_QUIZ } from "~/test/kanto";

import { CONFIGS } from "../configs/configRoster.model";
import { createRun, type RunPoll, type RunState } from "./run.model";
import { hydrateRunState, toRunSnapshot } from "./runSnapshot.model";

const kantoPoll = (index: number): RunPoll => {
	const quiz = KANTO_QUIZ[index % KANTO_QUIZ.length];
	return {
		id: `poll-${index}`,
		category: "js",
		question: quiz.question,
		answerType: "single",
		options: quiz.options.map((label, optionIndex) => ({
			id: `poll-${index}-${optionIndex}`,
			label,
			correct: label === quiz.correctAnswer,
		})),
	};
};

const POLLS = [kantoPoll(0), kantoPoll(1), kantoPoll(2)];
const HANDED = [CONFIGS.js, CONFIGS.eslint];

const baseState = createRun(POLLS, HANDED);

const stateVariants: Record<string, RunState> = {
	configuring: baseState,
	"mid-gate answering": {
		...baseState,
		status: "answering",
		currentIndex: 2,
		streak: 2,
		coverage: 2.4,
		coverageByCategory: { js: 2.4 },
		window: {
			correct: 2,
			answered: 2,
			coverageGained: 2.4,
			leadingCorrect: 2,
			byCategory: { js: { seen: 2, correct: 2 } },
		},
		storage: 120,
		log: ["Gate 1 progress"],
	},
	"awaiting-strip with strips remaining": {
		...baseState,
		status: "awaiting-strip",
		stripsRemaining: 2,
		gatesCleared: 3,
	},
	"rewarding with draft options": {
		...baseState,
		status: "rewarding",
		draftOptions: [CONFIGS.copilot, CONFIGS.indexedDb],
		draftedThisGate: [CONFIGS.copilot.id],
		rebuildsUsed: 1,
		gatesCleared: 1,
	},
};

describe("runSnapshot codec", () => {
	Object.entries(stateVariants).forEach(([name, state]) => {
		it(`round-trips a ${name} state without loss`, () => {
			const rehydrated = hydrateRunState(toRunSnapshot(state), state.polls);
			expect(rehydrated).toEqual(state);
		});
	});

	it("never persists the polls (the shared daily seed lives in daily_run_polls)", () => {
		const snapshot = toRunSnapshot(stateVariants["mid-gate answering"]);
		expect(snapshot).not.toHaveProperty("polls");
	});

	it("survives a JSON round-trip (the persistence format)", () => {
		const state = stateVariants["rewarding with draft options"];
		const stored = JSON.parse(JSON.stringify(toRunSnapshot(state)));
		expect(hydrateRunState(stored, state.polls)).toEqual(state);
	});
});

describe("hydrateRunState — the roster is authoritative", () => {
	it("swaps a stale embedded config for its current roster version", () => {
		const staleEslint = {
			...CONFIGS.eslint,
			description: "Disables one wrong answer on JS/TS polls.",
			check: undefined,
		};
		const state: RunState = {
			...baseState,
			pipeline: { ...baseState.pipeline, configs: [staleEslint] },
		};
		const rehydrated = hydrateRunState(toRunSnapshot(state), state.polls);
		expect(rehydrated.pipeline.configs[0]).toEqual(CONFIGS.eslint);
	});

	it("keeps the player's earned level while refreshing everything else", () => {
		const staleLevelled = { ...CONFIGS.js, level: 3, description: "stale" };
		const state: RunState = {
			...baseState,
			available: [staleLevelled],
		};
		const rehydrated = hydrateRunState(toRunSnapshot(state), state.polls);
		expect(rehydrated.available[0]).toEqual({ ...CONFIGS.js, level: 3 });
	});

	it("passes an unknown config id through untouched instead of crashing the run", () => {
		const retired = {
			...CONFIGS.copilot,
			id: "yarn-lock",
			label: "yarn.lock",
		};
		const state: RunState = {
			...baseState,
			draftOptions: [retired],
		};
		const rehydrated = hydrateRunState(toRunSnapshot(state), state.polls);
		expect(rehydrated.draftOptions[0]).toEqual(retired);
	});
});
