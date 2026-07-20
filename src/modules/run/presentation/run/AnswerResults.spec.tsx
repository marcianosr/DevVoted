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
		correct: ['"object"'],
		options: ['"object"', '"null"', '"undefined"'],
		answerType: "single" as const,
	},
	{
		id: "css1",
		question: "Center a flex item?",
		category: "css" as const,
		outcome: "wrong" as const,
		picked: ["align: middle"],
		correct: ["place-items: center"],
		options: ["align: middle", "place-items: center", "float: center"],
		answerType: "single" as const,
		explanation:
			"place-items centers on both axes in a grid or flex container.",
	},
	{
		id: "ts1",
		question: "Which are TS utility types?",
		category: "ts" as const,
		outcome: "partial" as const,
		picked: ["Partial", "Banjo"],
		correct: ["Partial", "Pick"],
		options: ["Partial", "Banjo", "Pick", "Kazooie"],
		answerType: "multiple" as const,
	},
];

describe(AnswerResults, () => {
	it("summarizes outcomes and renders a tile per answered poll", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("1 correct")).toBeInTheDocument();
		expect(screen.getByText("1 partial")).toBeInTheDocument();
		expect(screen.getByText("1 incorrect")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Poll 3/ })).toBeInTheDocument();
	});

	it("opens on the first poll with its question, hint, and full option list", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText("Select exactly one answer")).toBeInTheDocument();
		// Every option shows in review — including the ones you didn't pick.
		expect(screen.getByText('"null"')).toBeInTheDocument();
		expect(screen.getByText('"undefined"')).toBeInTheDocument();
	});

	it("reveals the correct option in green and the wrong pick in red", () => {
		render(<AnswerResults answered={answered} />);
		fireEvent.click(screen.getByRole("button", { name: /Poll 2/ }));
		expect(screen.getByText("place-items: center").closest("div")).toHaveClass(
			"border-viridian/60"
		);
		expect(screen.getByText("align: middle").closest("div")).toHaveClass(
			"border-cinnabar/60"
		);
		expect(screen.getByText("float: center").closest("div")).toHaveClass(
			"border-zinc-700"
		);
	});

	it("shows the explanation box only when the poll carries one", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.queryByText(/Explanation/)).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Poll 2/ }));
		expect(screen.getByText(/Explanation/)).toBeInTheDocument();
		expect(
			screen.getByText(/place-items centers on both axes/)
		).toBeInTheDocument();
	});

	it("judges each pick of a partial answer on its own", () => {
		render(<AnswerResults answered={answered} />);
		fireEvent.click(screen.getByRole("button", { name: /Poll 3/ }));
		expect(screen.getByText("Banjo").closest("div")).toHaveClass(
			"border-cinnabar/60"
		);
		expect(screen.getByText("Partial").closest("div")).toHaveClass(
			"border-viridian/60"
		);
		// The correct option you missed is revealed too.
		expect(screen.getByText("Pick").closest("div")).toHaveClass(
			"border-viridian/60"
		);
	});

	it("walks the polls with previous/next", () => {
		render(<AnswerResults answered={answered} />);
		const next = screen.getByRole("button", { name: /Next poll/ });
		expect(
			screen.getByRole("button", { name: /Previous poll/ })
		).toBeDisabled();
		fireEvent.click(next);
		expect(screen.getByText("Center a flex item?")).toBeInTheDocument();
		fireEvent.click(next);
		expect(screen.getByText("Which are TS utility types?")).toBeInTheDocument();
		expect(next).toBeDisabled();
	});
});
