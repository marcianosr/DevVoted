import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AnswerResults } from "~/modules/run/run/presentation/AnswerResults.ui";

// Letters come from each option's seat in its own poll's option list, so the
// fixtures below are read as: js1 A/B/C, css1 A/B/C, ts1 A/B/C/D.

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

const rowOf = (question: string): HTMLElement => {
	const row = screen.getByText(question).closest("details");
	if (!row) throw new Error(`no row for ${question}`);
	return row;
};

/** The option lines under a row's Expected or Received label. */
const sideOf = (question: string, side: "Expected" | "Received") => {
	const label = within(rowOf(question)).getByText(side);
	const lines = label.parentElement?.lastElementChild;
	if (!(lines instanceof HTMLElement)) throw new Error(`no ${side} lines`);
	return within(lines);
};

describe(AnswerResults, () => {
	it("renders one reporter row per poll with a PASS/FAIL/PART badge and the question", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("1 of 3 correct")).toBeInTheDocument();
		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
		expect(screen.getByText("PART")).toBeInTheDocument();
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText("Which are TS utility types?")).toBeInTheDocument();
	});

	it("opens the polls you fumbled and leaves the one you passed folded", () => {
		render(<AnswerResults answered={answered} />);
		expect(rowOf("typeof null?")).not.toHaveAttribute("open");
		expect(rowOf("Center a flex item?")).toHaveAttribute("open");
		expect(rowOf("Which are TS utility types?")).toHaveAttribute("open");
	});

	it("dims a passed poll's question and keeps the fumbled ones at full contrast", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("typeof null?")).toHaveClass("text-pewter");
		expect(screen.getByText("Center a flex item?")).toHaveClass(
			"text-zinc-100"
		);
	});

	it("pairs each expected option with its letter, in celadon", () => {
		render(<AnswerResults answered={answered} />);
		const expected = sideOf("Center a flex item?", "Expected");
		expect(expected.getByText("B")).toBeInTheDocument();
		expect(expected.getByText("place-items: center")).toHaveClass(
			"text-celadon"
		);
	});

	it("colours a wrong pick vermillion and a partial one saffron", () => {
		render(<AnswerResults answered={answered} />);
		const wrong = sideOf("Center a flex item?", "Received");
		expect(wrong.getByText("A")).toBeInTheDocument();
		expect(wrong.getByText("align: middle")).toHaveClass("text-vermillion");

		const partial = sideOf("Which are TS utility types?", "Received");
		expect(partial.getByText("Partial")).toHaveClass("text-saffron");
		expect(partial.getByText("Banjo")).toHaveClass("text-saffron");
	});

	it("tallies a multiple-answer poll and names the letters you missed", () => {
		render(<AnswerResults answered={answered} />);
		const tally = within(rowOf("Which are TS utility types?")).getByText(
			/1 of 2/
		);
		expect(tally).toHaveTextContent("1 of 2 — you missed C");
	});

	it("leaves single-answer polls untallied — expected over received says it all", () => {
		render(<AnswerResults answered={answered} />);
		expect(
			within(rowOf("Center a flex item?")).queryByText(/of 1/)
		).not.toBeInTheDocument();
	});

	it("folds away the options neither side of the diff touched", () => {
		render(<AnswerResults answered={answered} />);
		const row = within(rowOf("Center a flex item?"));
		expect(row.getByText(/1 other option/)).toBeInTheDocument();
		expect(row.getByText("float: center")).not.toBeVisible();
	});

	it("counts the untouched options in plural when there is more than one", () => {
		render(<AnswerResults answered={answered} />);
		expect(
			within(rowOf("typeof null?")).getByText(/2 other options/)
		).toBeInTheDocument();
	});

	it("shows earned coverage in the result slot, tinted by outcome", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("+12%")).toHaveClass("text-celadon");
		expect(screen.getByText("+5%")).toHaveClass("text-saffron");
	});

	it("leaves a zero score grey — the FAIL badge already carries that news", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.getByText("0%")).toHaveClass("text-pewter");
	});

	it("shows a dash instead of a score when coverage was never recorded", () => {
		const withoutCoverage = answered.map(
			({ coverageEarned: _drop, ...poll }) => poll
		);
		render(<AnswerResults answered={withoutCoverage} />);
		expect(screen.queryByText(/%/)).not.toBeInTheDocument();
		expect(screen.getAllByText("—")).toHaveLength(3);
	});

	it("tags only the multiple-answer poll as multiple choice", () => {
		render(<AnswerResults answered={answered} />);
		const markers = screen.getAllByText("multiple choice");
		expect(markers).toHaveLength(1);
		expect(
			within(rowOf("Which are TS utility types?")).getByText("multiple choice")
		).toBeInTheDocument();
	});

	it("names no category on the row — the gate owns the run's colour and label", () => {
		render(<AnswerResults answered={answered} />);
		expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
		expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
	});

	it("drops the Expected side for snapshots taken before answers were keyed", () => {
		const legacy = answered.map(({ correct: _drop, ...poll }) => poll);
		render(<AnswerResults answered={legacy} />);
		expect(screen.queryByText("Expected")).not.toBeInTheDocument();
		expect(screen.getAllByText("Received")).toHaveLength(3);
	});

	it("shows the poll's snippet inside the row, only when it had one", () => {
		const withCode = [
			{ ...answered[0], codeBlock: "let parsed = pollPoints.map(parseInt);" },
			answered[1],
		];
		const { container } = render(<AnswerResults answered={withCode} />);
		// Queried as an element, not by text: the highlighter splits the snippet
		// across a span per token, so no single node holds the whole line.
		const blocks = container.querySelectorAll("pre");
		// One block, for the one poll that had code — no empty block on the other.
		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toHaveTextContent(
			"let parsed = pollPoints.map(parseInt);"
		);
	});

	it("shows the explanation, prefixed, only when the poll carries one", () => {
		render(<AnswerResults answered={answered} />);
		expect(
			screen.getByText(/place-items centers on both axes/)
		).toBeInTheDocument();
		expect(screen.getAllByText(/›/)).toHaveLength(1);
	});
});
