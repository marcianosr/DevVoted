import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	createRun,
	pickBudgetFor,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { answerWith, handed, poll } from "~/modules/run/run/domain/run.factory";

describe(".length's pick budget", () => {
	// Two correct options out of three, so this poll alone costs 2 of the budget.
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

	// One multi-answer poll in the first window: budget 6 across 5 polls, so the
	// window holds exactly one correct answer beyond one per poll.
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

	// The same build with .length swapped for a linter the react-only pool never
	// serves, so any difference in the clear payout is .length's alone.
	const uncounted = (polls: RunPoll[] = mixedPool()): RunState => {
		let state = createRun(polls, handed);
		for (const configId of ["eslint", "ts", "css"])
			state = runReducer(state, { type: "install", configId });
		return runReducer(state, { type: "start" });
	};

	// `.length` sells knowledge, not KB. It used to pay per extra pick as well,
	// which made a config bought for its reveal earn its keep on the ledger — and
	// left the reveal itself unbuilt on the screens that were meant to carry it.
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
		// The second window is all single-answer, so its budget is one per poll.
		expect(state.window.budget).toBe(5);
	});
});
