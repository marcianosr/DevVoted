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
						correct: true,
						picked: ['"object"'],
					},
					{
						id: "css1",
						question: "Center a flex item?",
						category: "css",
						correct: false,
						picked: ["align: middle"],
					},
				]}
			/>
		);
		expect(screen.getByText("typeof null?")).toBeInTheDocument();
		expect(screen.getByText('"object"')).toBeInTheDocument();
		expect(screen.getByText("align: middle")).toBeInTheDocument();
	});
});
