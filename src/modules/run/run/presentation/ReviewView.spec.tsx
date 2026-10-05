import { beforeEach, describe, expect, it, vi } from "vitest";
import { render as renderBare, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import userEvent from "@testing-library/user-event";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	createMockGatePayout,
	createMockRunView,
} from "~/test/runView.factory";

import { getRunCommunity } from "~/modules/run/community/application/community.serverfn";
import { withQueryClient } from "~/test/queryClient.harness";

import { ReviewView } from "./ReviewView.component";

vi.mock("~/modules/run/community/application/community.serverfn", () => ({
	getRunCommunity: vi.fn(),
}));

const render = (ui: ReactElement) => renderBare(withQueryClient(ui));

const MISTY_VOTE = {
	id: "misty-id",
	displayName: "Misty",
	photoUrl: null,
	borderUrl: null,
	you: false,
};

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
		id: "7",
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
	beforeEach(() => {
		vi.mocked(getRunCommunity).mockResolvedValue({
			success: true,
			data: {
				date: "2026-05-13",
				totalPlayers: 1,
				players: [],
				leaders: [],
				climb: null,
				polls: [
					{
						pollId: 7,
						index: 0,
						question: "Which type makes every property optional?",
						category: "ts",
						outcome: "wrong",
						detail: {
							answerType: "single",
							answeredCount: 1,
							gotItRightCount: 1,
							youGotItRight: false,
							options: [
								{
									label: "Partial<T>",
									isRight: true,
									count: 1,
									percent: 100,
									yours: false,
									voters: [MISTY_VOTE],
								},
							],
						},
					},
				],
			},
		});
	});

	it("shows who picked each option of the poll", async () => {
		render(<ReviewView view={view} back={back} />);

		expect(
			await screen.findByRole("link", { name: "Misty's profile" })
		).toBeInTheDocument();
	});

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

		expect(
			screen.getByRole("heading", { name: /^Review · / })
		).toBeInTheDocument();
	});

	it("costs a wrong answer coverage rather than crediting it", () => {
		render(<ReviewView view={view} back={back} />);

		expect(screen.getByText("-14.3%")).toBeInTheDocument();
	});

	it("states an answer's earn as a share of the gate, not as the raw unit", () => {
		render(<ReviewView view={view} back={back} />);

		expect(screen.getByText("+14.3%")).toBeInTheDocument();
		expect(screen.queryByText("+1%")).not.toBeInTheDocument();
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
			screen.getByRole("button", { name: /^Back to the gate/ })
		);
		expect(onUse).toHaveBeenCalled();
	});
});
