import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PollResultScreen } from "./PollResultScreen.ui";
import type { AnswerReviewOption } from "./PollAnswerReview.ui";

const options: AnswerReviewOption[] = [
	{ id: "1", text: "A bear", correct: true, isYours: true },
	{ id: "2", text: "A bird", correct: false, isYours: false },
];

const baseProps = {
	question: "What species is Banjo",
	categoryName: "JavaScript",
	options,
};

describe(PollResultScreen.name, () => {
	it("renders the question and the review section", () => {
		render(<PollResultScreen {...baseProps} />);
		expect(screen.getByText("What species is Banjo")).toBeInTheDocument();
		expect(screen.getByText("Review your answer")).toBeInTheDocument();
	});

	it("renders the continue action when provided", () => {
		render(
			<PollResultScreen
				{...baseProps}
				continueAction={{
					label: "Go to pipeline check →",
					onClick: vi.fn(),
				}}
			/>
		);
		expect(
			screen.getByRole("button", { name: /Go to pipeline check/ })
		).toBeInTheDocument();
	});

	it("omits the continue action when none is given", () => {
		render(<PollResultScreen {...baseProps} />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
