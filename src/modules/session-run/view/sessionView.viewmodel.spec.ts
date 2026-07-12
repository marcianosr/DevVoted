import { describe, expect, it } from "vitest";

import {
	createSession,
	sessionReducer,
	SessionPoll,
} from "../climb/sessionRun.model";
import { CONFIGS } from "../configs/configRoster.model";
import { toSessionView } from "./sessionView.viewmodel";

const poll = (id: string): SessionPoll => ({
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
	sessionReducer(createSession([poll("q0"), poll("q1")], [CONFIGS.js]), {
		type: "start",
	});

describe("toSessionView", () => {
	it("redacts option correctness from the current poll", () => {
		const view = toSessionView(answering());
		expect(view.poll).not.toBeNull();
		for (const option of view.poll!.options) {
			expect("correct" in option).toBe(false);
		}
	});

	it("exposes only the current poll, never the upcoming ones", () => {
		expect(toSessionView(answering()).poll?.id).toBe("q0");
	});

	it("hides the poll when not answering", () => {
		const view = toSessionView(createSession([poll("q0")], [CONFIGS.js]));
		expect(view.status).toBe("configuring");
		expect(view.poll).toBeNull();
	});

	it("surfaces the gate checks, demands, and stats a screen needs", () => {
		const view = toSessionView(answering());
		expect(view.checks[0].label).toBe("Correct");
		expect(view.demands[0]).toContain("correct answer");
		expect(view.pollsToGate).toBe(5);
		expect(view.victoryGate).toBeGreaterThan(0);
	});
});
