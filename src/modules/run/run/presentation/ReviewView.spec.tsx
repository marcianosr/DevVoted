import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	createMockGatePayout,
	createMockRunView,
} from "~/test/runView.factory";

import { ReviewView } from "./ReviewView.component";

const answered: readonly AnsweredPoll[] = [
	{
		id: "a",
		category: "js",
		question: "Which method returns the last element?",
		outcome: "correct",
		picked: ["at(-1)"],
		correct: ["at(-1)"],
		options: ["at(-1)", "pop()"],
		coverageEarned: 1,
	},
	{
		id: "b",
		category: "ts",
		question: "Which type makes every property optional?",
		outcome: "wrong",
		picked: ["Readonly<T>"],
		correct: ["Partial<T>"],
		options: ["Partial<T>", "Readonly<T>"],
		coverageLost: 1,
	},
];

const view = createMockRunView({
	answeredThisGate: answered,
	status: "rewarding",
	gatePayout: createMockGatePayout({ clearedGateNumber: 4 }),
});

const back = { label: "Back to the gate", onUse: () => {} };

describe("ReviewView", () => {
	it("lists every answer of the gate with its question", () => {
		render(<ReviewView view={view} back={back} />);

		expect(
			screen.getByText("Which method returns the last element?")
		).toBeInTheDocument();
		expect(
			screen.getByText("Which type makes every property optional?")
		).toBeInTheDocument();
	});

	it("names the gate that was reviewed", () => {
		render(<ReviewView view={view} back={back} />);

		expect(screen.getByText(/gate 4/)).toBeInTheDocument();
	});

	it("costs a wrong answer coverage rather than crediting it", () => {
		render(<ReviewView view={view} back={back} />);

		expect(screen.getByText("-4")).toBeInTheDocument();
	});

	it("states an answer's earn as a share of the gate, not as the raw unit", () => {
		render(<ReviewView view={view} back={back} />);

		expect(screen.getByText("+4")).toBeInTheDocument();
		expect(screen.queryByText("+1")).not.toBeInTheDocument();
	});

	it("leaves a passed answer folded away until asked to open it", async () => {
		const { container } = render(<ReviewView view={view} back={back} />);

		const foldOf = (question: string) =>
			[...container.querySelectorAll("details")].find((fold) =>
				fold.querySelector("summary")?.textContent?.includes(question)
			);

		expect(
			foldOf("Which method returns the last element?")
		).not.toHaveAttribute("open");
		expect(foldOf("Which type makes every property optional?")).toHaveAttribute(
			"open"
		);

		await userEvent.click(
			screen.getByRole("button", { name: /open everything/ })
		);

		expect(foldOf("Which method returns the last element?")).toHaveAttribute(
			"open"
		);
	});

	it("goes back where it came from", async () => {
		const onUse = vi.fn();
		render(
			<ReviewView view={view} back={{ label: "Back to the gate", onUse }} />
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Back to the gate" })
		);
		expect(onUse).toHaveBeenCalled();
	});
});
