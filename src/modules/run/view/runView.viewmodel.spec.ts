import { describe, expect, it } from "vitest";

import { createRun, runReducer, RunPoll } from "../climb/run.model";
import { CONFIGS } from "../configs/configRoster.model";
import { toRunView } from "./runView.viewmodel";

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

const answering = () =>
	runReducer(createRun([poll("q0"), poll("q1")], [CONFIGS.js]), {
		type: "start",
	});

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
		const view = toRunView(answering());
		expect(view.checks[0].label).toBe("Correct");
		expect(view.demands[0]).toContain("correct answer");
		expect(view.pollsToGate).toBe(5);
		expect(view.victoryGate).toBeGreaterThan(0);
	});
});
