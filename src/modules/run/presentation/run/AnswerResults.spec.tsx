import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

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
		coverageEarned: 12,
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
		coverageEarned: 0,
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
		coverageEarned: 5,
	},
];

// Locate the describe/it line for a given option label.
const lineOf = (label: string) => {
	const node = screen.getByText(label).closest("div");
	if (!node) throw new Error(`no row for ${label}`);
	return node;
};

describe(AnswerResults, () => {
	it("renders one reporter row per poll with a PASS/FAIL/PART badge and the question", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("1 correct")).toBeInTheDocument();
		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
		expect(screen.getByText("PART")).toBeInTheDocument();
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText("Which are TS utility types?")).toBeInTheDocument();
	});

	it("shows each poll's option count", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getAllByText("(3)")).toHaveLength(2); // js + css
		expect(screen.getByText("(4)")).toBeInTheDocument(); // ts
	});

	it("shows earned coverage in the result slot, tinted by outcome", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("+12%")).toHaveClass("text-viridian");
		expect(screen.getByText("0%")).toHaveClass("text-cinnabar");
		expect(screen.getByText("+5%")).toHaveClass("text-saffron");
	});

	it("shows a dash instead of a score when coverage was never recorded", () => {
		const withoutCoverage = answered.map(
			({ coverageEarned: _drop, ...poll }) => poll
		);
		render(<AnswerResults answered={withoutCoverage} />);
		expect(screen.queryByText(/%/)).not.toBeInTheDocument();
		expect(screen.getAllByText("—")).toHaveLength(3);
	});

	it("marks a picked-correct option as a passing assertion", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText('"object"')).toHaveClass("text-zinc-100");
		expect(screen.getByText("Partial")).toHaveClass("text-zinc-100");
	});

	it("marks a wrong pick as a failing assertion, tagged 'picked, wrong'", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("Banjo")).toHaveClass("text-cinnabar");
		expect(
			within(lineOf("Banjo")).getByText("picked, wrong")
		).toBeInTheDocument();
	});

	it("marks a correct option you didn't pick as a failing assertion, tagged 'missed'", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("Pick")).toHaveClass("text-cinnabar");
		expect(within(lineOf("Pick")).getByText("missed")).toBeInTheDocument();
	});

	it("marks an untouched wrong option as skipped", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("Kazooie")).toHaveClass("text-zinc-400");
		expect(screen.getByText("float: center")).toHaveClass("text-zinc-400");
	});

	it("shows the explanation, prefixed, only when the poll carries one", () => {
		render(<AnswerResults answered={answered} />);
		expect(
			screen.getByText(/place-items centers on both axes/)
		).toBeInTheDocument();
		expect(screen.getAllByText(/›/)).toHaveLength(1);
	});
});
