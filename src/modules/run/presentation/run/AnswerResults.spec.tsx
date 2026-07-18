import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AnswerResults } from "./AnswerResults.ui";

const answered = [
	{
		id: "js1",
		question: "typeof null?",
		category: "js" as const,
		outcome: "correct" as const,
		picked: ['"object"'],
	},
	{
		id: "css1",
		question: "Center a flex item?",
		category: "css" as const,
		outcome: "wrong" as const,
		picked: ["align: middle"],
	},
	{
		id: "ts1",
		question: "Which are TS utility types?",
		category: "ts" as const,
		outcome: "partial" as const,
		picked: ["Partial"],
	},
];

describe(AnswerResults, () => {
	it("renders a tile per answered poll with its category and outcome symbol", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("Poll 1")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("✓")).toBeInTheDocument();
		expect(screen.getByText("✕")).toBeInTheDocument();
		expect(screen.getByText("◐")).toBeInTheDocument();
	});

	it("expands a tile into the full question and picked answers", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.queryByText("typeof null?")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Poll 1/ }));
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText(/"object"/)).toBeInTheDocument();
	});

	it("collapses the expanded tile when clicked again", () => {
		render(<AnswerResults answered={answered} />);
		fireEvent.click(screen.getByRole("button", { name: /Poll 2/ }));
		expect(screen.getByText("Center a flex item?")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Poll 2/ }));
		expect(screen.queryByText("Center a flex item?")).not.toBeInTheDocument();
	});
});
