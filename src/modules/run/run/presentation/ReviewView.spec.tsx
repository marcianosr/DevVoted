import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
import { createMockRunView } from "~/test/runView.factory";

import { ReviewView } from "./ReviewView.component";

const answered: AnsweredPoll = {
	id: "poll-1",
	question: "Which method copies without mutating?",
	category: "js",
	outcome: "partial",
	options: ["slice", "splice", "at"],
	picked: ["slice", "splice"],
	correct: ["slice", "at"],
	coverageEarned: 4.2,
	explanation: "splice mutates in place.",
};

const back = { label: "← Back", onUse: () => {} };

describe("ReviewView", () => {
	it("names the gate the answers were given at, not the run's start", () => {
		render(
			<ReviewView
				view={createMockRunView({
					gatesCleared: 4,
					answeredThisGate: [answered],
				})}
				back={back}
			/>
		);

		expect(
			screen.getByRole("heading", { name: "Review · Lavender gate 4" })
		).toBeInTheDocument();
	});

	it("marks an option both expected and received when it was correct and picked", () => {
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [answered] })}
				back={back}
			/>
		);

		// Verdict splits the flags into an Expected row and a Received row, so a
		// label that is both lands twice. That doubling is the assertion: get it
		// wrong and a caught answer reads as a miss.
		expect(screen.getAllByText("slice")).toHaveLength(2);
		expect(screen.getAllByText("at")).toHaveLength(1);
		expect(screen.getAllByText("splice")).toHaveLength(1);
		expect(screen.getByText("1 caught")).toBeInTheDocument();
		expect(screen.getByText("1 missed")).toBeInTheDocument();
		expect(screen.getByText("1 wrong pick")).toBeInTheDocument();
	});

	it("carries the coverage the answer actually earned", () => {
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [answered] })}
				back={back}
			/>
		);

		expect(screen.getByText("+4.2")).toBeInTheDocument();
	});

	// The pool cycles, so poll-1 can be answered at gate 0 and again at gate 4.
	it("keys repeated polls apart rather than collapsing them", () => {
		render(
			<ReviewView
				view={createMockRunView({
					answeredThisGate: [answered, { ...answered, outcome: "correct" }],
				})}
				back={back}
			/>
		);

		expect(
			screen.getAllByText("Which method copies without mutating?")
		).toHaveLength(2);
	});

	it("goes back from the footer", async () => {
		const onUse = vi.fn();
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [answered] })}
				back={{ label: "← Back to rewards", onUse }}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "← Back to rewards" })
		);

		expect(onUse).toHaveBeenCalledOnce();
	});
});
