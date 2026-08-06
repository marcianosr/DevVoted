import { describe, expect, it } from "vitest";

import { createRun, runReducer, RunPoll } from "../climb/run.model";
import { CONFIGS } from "../configs/configRoster.model";
import type { Config } from "../configs/config.model";
import {
	correctOptionIdsFor,
	latestAnswerScore,
	latestAnswerVerdict,
	toRunView,
} from "./runView.viewmodel";

const poll = (id: string): RunPoll => ({
	id,
	category: "react",
	question: `${id}?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct: true },
		{ id: `${id}-b`, label: "No", correct: false },
	],
});

// View specs bypass the full-pipeline start rule: the status is forced so the
// pipeline holds exactly the configs under test, nothing more.
const answering = () => ({
	...createRun([poll("q0"), poll("q1")], [CONFIGS.js]),
	status: "answering" as const,
});

const answeringWith = (configs: Config[]) => {
	let state = createRun([poll("q0"), poll("q1")], configs);
	for (const config of configs)
		state = runReducer(state, { type: "slot", configId: config.id });
	return { ...state, status: "answering" as const };
};

describe("toRunView", () => {
	it("redacts option correctness from the current poll", () => {
		const view = toRunView(answering());
		expect(view.poll).not.toBeNull();
		for (const option of view.poll!.options) {
			expect("correct" in option).toBe(false);
		}
	});

	it("exposes only the current poll, never the upcoming ones", () => {
		expect(toRunView(answering()).poll?.id).toBe("q0");
	});

	it("hides the poll when not answering", () => {
		const view = toRunView(createRun([poll("q0")], [CONFIGS.js]));
		expect(view.status).toBe("configuring");
		expect(view.poll).toBeNull();
	});

	it("derives everything the wired client needs without touching RunState", () => {
		const view = toRunView(answering());
		expect(view.disabledOptionIds).toEqual([]);
		expect(view.lintCost).toBeGreaterThan(0);
		expect(view.rebuildCost).toBeGreaterThan(0);
		expect(view.canRebuild).toBe(false); // fresh run starts at 0 KB
		expect(view.slotCoverageRequired).toBeGreaterThan(0);
		expect(view.canAddSlot).toBe(false); // no coverage earned yet
	});

	it("surfaces the gate checks, demands, and stats a screen needs", () => {
		const view = toRunView(answeringWith([CONFIGS.js]));
		// The .js build owes only its own check — no baseline row (ADR-017).
		expect(view.checks.map((check) => check.label)).toEqual([".js mastery"]);
		expect(view.demands[0]).toBe(".js: get one right if js appears");
		expect(view.pollsToGate).toBe(5);
		expect(view.victoryGate).toBeGreaterThan(0);
	});

	it("keeps awaitingTomorrow off while a poll is on deck", () => {
		expect(toRunView(answering()).awaitingTomorrow).toBe(false);
	});

	it("raises awaitingTomorrow when answering with the day's polls exhausted", () => {
		const exhausted = { ...answering(), currentIndex: 2 };
		const view = toRunView(exhausted);
		expect(view.awaitingTomorrow).toBe(true);
		expect(view.poll).toBeNull();
	});

	it("keeps awaitingTomorrow off outside the answering status", () => {
		const configuring = createRun([], [CONFIGS.js]);
		expect(toRunView(configuring).awaitingTomorrow).toBe(false);
	});
});

describe("latestAnswerVerdict", () => {
	it("is null before any answer this gate", () => {
		expect(latestAnswerVerdict(toRunView(answering()))).toBeNull();
	});

	it("reports a correct pick", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerVerdict(toRunView(state))).toEqual({
			outcome: "correct",
			correctAnswers: ["Yes"],
		});
	});

	it("reports a wrong pick with the answer that was right", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-b"],
		});
		expect(latestAnswerVerdict(toRunView(state))).toEqual({
			outcome: "wrong",
			correctAnswers: ["Yes"],
		});
	});
});

describe("latestAnswerScore", () => {
	it("is null before any answer this gate", () => {
		expect(latestAnswerScore(toRunView(answering()))).toBeNull();
	});

	it("breaks a correct answer into base, streak, and total", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		// .js Focus is a no-op on a react poll, so no config chip; streak 1 → +0.1.
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: true,
			baseCoverage: 1,
			streakBonus: 0.1,
			configBonuses: [],
			earnedCoverage: 1.1,
		});
	});

	it("adds a chip for a coverage-affecting config and sums the total", () => {
		const state = runReducer(answeringWith([CONFIGS.copilot]), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: true,
			baseCoverage: 1,
			streakBonus: 0.2,
			configBonuses: [{ configId: "copilot", value: 1 }],
			earnedCoverage: 2.2,
		});
	});

	it("reads a miss as a negative base and no bonuses", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-b"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: false,
			baseCoverage: -0.5,
			streakBonus: 0,
			configBonuses: [],
			earnedCoverage: -0.5,
		});
	});

	it("omits the difficulty boost for a baseline single-choice poll", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))?.difficulty).toBeUndefined();
	});

	it("surfaces the difficulty boost for a multiple-choice poll", () => {
		const multiPoll: RunPoll = {
			id: "q0",
			category: "react",
			question: "Pick both?",
			answerType: "multiple",
			options: [
				{ id: "q0-a", label: "A", correct: true },
				{ id: "q0-b", label: "B", correct: true },
				{ id: "q0-c", label: "C", correct: false },
			],
		};
		const state = runReducer(
			{
				...createRun([multiPoll, poll("q1")], [CONFIGS.js]),
				status: "answering" as const,
			},
			{ type: "answer", optionIds: ["q0-a", "q0-b"] }
		);
		expect(latestAnswerScore(toRunView(state))?.difficulty).toEqual({
			multiplier: 1.5,
			optionCount: 3,
			isMultiple: true,
		});
	});
});

describe("correctOptionIdsFor", () => {
	it("maps the verdict back to option ids on the poll that was on screen", () => {
		const onScreen = toRunView(answering());
		const answered = toRunView(
			runReducer(answering(), { type: "answer", optionIds: ["q0-b"] })
		);
		expect(correctOptionIdsFor(onScreen.poll!, answered)).toEqual(["q0-a"]);
	});

	it("is empty when nothing has been answered", () => {
		const onScreen = toRunView(answering());
		expect(correctOptionIdsFor(onScreen.poll!, onScreen)).toEqual([]);
	});
});
