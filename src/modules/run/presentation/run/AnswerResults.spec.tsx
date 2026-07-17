import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AnswerResults } from "./AnswerResults.ui";

describe(AnswerResults, () => {
	it("lists each answered poll with its category, question, and pick", () => {
		render(
			<AnswerResults
				answered={[
					{
						id: "js1",
						question: "typeof null?",
						category: "js",
						outcome: "correct",
						picked: ['"object"'],
					},
					{
						id: "css1",
						question: "Center a flex item?",
						category: "css",
						outcome: "wrong",
						picked: ["align: middle"],
					},
				]}
			/>
		);
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText('"object"')).toBeInTheDocument();
		expect(screen.getByText("align: middle")).toBeInTheDocument();
	});

	it("marks each outcome with its own symbol", () => {
		render(
			<AnswerResults
				answered={[
					{
						id: "ts1",
						question: "Which are TS utility types?",
						category: "ts",
						outcome: "partial",
						picked: ["Partial"],
					},
					{
						id: "js1",
						question: "typeof null?",
						category: "js",
						outcome: "correct",
						picked: ['"object"'],
					},
					{
						id: "css1",
						question: "Center a flex item?",
						category: "css",
						outcome: "wrong",
						picked: ["align: middle"],
					},
				]}
			/>
		);
		expect(screen.getByText("◐")).toBeInTheDocument();
		expect(screen.getByText("✓")).toBeInTheDocument();
		expect(screen.getByText("✕")).toBeInTheDocument();
	});
});
