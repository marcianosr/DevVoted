import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
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

const correct: AnsweredPoll = {
	...answered,
	id: "poll-2",
	outcome: "correct",
	picked: ["slice", "at"],
	coverageEarned: 6.5,
};

const wrong: AnsweredPoll = {
	...answered,
	id: "poll-3",
	outcome: "wrong",
	picked: ["splice"],
	coverageEarned: 0,
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

		expect(screen.getByText("Review · Lavender")).toBeInTheDocument();
	});

	it("sorts a correct answer into passed and everything else into failed", () => {
		render(
			<ReviewView
				view={createMockRunView({
					answeredThisGate: [answered, correct, wrong],
				})}
				back={back}
			/>
		);

		expect(
			screen.getByText("1 passed · 2 failed · 3 polls")
		).toBeInTheDocument();
	});

	it("shows what was expected against what was picked on a miss", () => {
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [answered] })}
				back={back}
			/>
		);

		expect(screen.getByText("slice, at")).toBeInTheDocument();
		expect(screen.getByText("slice, splice")).toBeInTheDocument();
	});

	// A partial earns coverage even though it did not pass. Reporting only the
	// miss would tell the player they got nothing for it.
	it("banks the coverage a partial answer still earned", () => {
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [answered] })}
				back={back}
			/>
		);

		expect(screen.getByText("banked")).toBeInTheDocument();
		expect(screen.getByText("+4.2%")).toBeInTheDocument();
	});

	it("quotes the coverage a wrong answer cost, not a zero earn", () => {
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [wrong] })}
				back={back}
			/>
		);

		expect(screen.getByText("cost")).toBeInTheDocument();
		expect(screen.queryByText("banked")).not.toBeInTheDocument();
	});

	it("carries the explanation through so a miss teaches something", () => {
		render(
			<ReviewView
				view={createMockRunView({ answeredThisGate: [answered] })}
				back={back}
			/>
		);

		expect(screen.getByText("splice mutates in place.")).toBeInTheDocument();
	});

	// The pool cycles, so poll-1 can be answered at gate 0 and again at gate 4.
	it("keys repeated polls apart rather than collapsing them", () => {
		render(
			<ReviewView
				view={createMockRunView({
					answeredThisGate: [answered, { ...answered }],
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
