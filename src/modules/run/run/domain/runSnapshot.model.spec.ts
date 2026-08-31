import { describe, expect, it } from "vitest";

import { KANTO_QUIZ, KANTO_TOWNS } from "~/test/kanto";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	hydrateRunState,
	toRunSnapshot,
} from "~/modules/run/run/domain/runSnapshot.model";

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
			byCategory: { js: { seen: 2, correct: 2 } },
			// Three single-answer polls from index 0: what hydration will recompute.
			budget: 3,
		},
		storage: 120,
		log: ["Gate 1 progress"],
	},
	"awaiting-strip with strips remaining": {
		...baseState,
		status: "awaiting-strip",
		peelSlotsRemaining: 2,
		gatesCleared: 3,
	},
	"rewarding with draft options": {
		...baseState,
		status: "rewarding",
		draftOptions: [CONFIGS.agentsMd, CONFIGS.indexedDb],
		draftedThisGate: [CONFIGS.agentsMd.id],
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
			build: { ...baseState.build, configs: [staleEslint] },
		};
		const rehydrated = hydrateRunState(toRunSnapshot(state), state.polls);
		expect(rehydrated.build.configs[0]).toEqual(CONFIGS.eslint);
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
			...CONFIGS.agentsMd,
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

describe("hydrateRunState — the polls are authoritative (DVTD-6nkn)", () => {
	const multiPoll = (id: string, correctCount: number): RunPoll => ({
		id,
		category: "js",
		question: "Which of these are Kanto towns?",
		answerType: "multiple",
		options: KANTO_TOWNS.slice(0, 4).map((town, index) => ({
			id: `${id}-${index}`,
			label: town.name,
			correct: index < correctCount,
		})),
	});

	const midGate = stateVariants["mid-gate answering"];

	it("recomputes the pick budget from the polls the window holds now", () => {
		// The rollover dropped the unplayed tail and appended multi-answer polls, so
		// the budget the window opened with describes polls that no longer exist.
		const afterRollover = [POLLS[0], POLLS[1], multiPoll("day2-0", 3)];
		const rehydrated = hydrateRunState(toRunSnapshot(midGate), afterRollover);
		expect(midGate.window.budget).toBe(3);
		expect(rehydrated.window.budget).toBe(5);
	});

	it("counts the polls already answered this window, not just the ones ahead", () => {
		// Two answered polls with three correct options each, one single-answer poll
		// left: a budget of only the remaining poll would let a spent pick vanish.
		const answeredWereMulti = [
			multiPoll("day1-0", 3),
			multiPoll("day1-1", 3),
			POLLS[2],
		];
		const rehydrated = hydrateRunState(
			toRunSnapshot(midGate),
			answeredWereMulti
		);
		expect(rehydrated.window.budget).toBe(7);
	});

	it("measures the window from its own first poll, not from the run's", () => {
		// Second window, one poll in: the budget must skip the cleared gate's polls.
		const secondWindow: RunState = {
			...midGate,
			currentIndex: 6,
			gatesCleared: 1,
			window: { ...midGate.window, answered: 1 },
		};
		const polls = [
			...Array.from({ length: 5 }, (_, index) =>
				multiPoll(`gate1-${index}`, 4)
			),
			multiPoll("gate2-0", 2),
			POLLS[0],
			POLLS[1],
		];
		// From index 5: gate2-0 (2) + two single-answer polls (1 each).
		expect(
			hydrateRunState(toRunSnapshot(secondWindow), polls).window.budget
		).toBe(4);
	});

	it("gives a legacy snapshot with no budget a real one", () => {
		const legacy = toRunSnapshot({
			...midGate,
			window: { ...midGate.window, budget: undefined },
		});
		expect(hydrateRunState(legacy, POLLS).window.budget).toBe(3);
	});

	it("reads a budget of zero on a fresh window with the day's polls used up", () => {
		// Awaiting tomorrow: the window opened on nothing, so the check stands down
		// instead of demanding picks the day cannot supply.
		const awaitingTomorrow: RunState = {
			...midGate,
			currentIndex: POLLS.length,
			window: { ...midGate.window, answered: 0 },
		};
		expect(
			hydrateRunState(toRunSnapshot(awaitingTomorrow), POLLS).window.budget
		).toBe(0);
	});
});
