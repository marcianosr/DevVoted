import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Question } from "./Question.ui";

describe("Question", () => {
	it("renders the ask as the screen's heading", () => {
		render(<Question>Which line returns the final two?</Question>);

		expect(
			screen.getByRole("heading", { name: "Which line returns the final two?" })
		).toBeInTheDocument();
	});

	it("lists every meta fact about the poll", () => {
		render(
			<Question
				meta={[
					{ label: "lift-the-final-two" },
					{ label: "typescript" },
					{ label: "@matthijsgroen" },
				]}
			>
				Which line?
			</Question>
		);

		expect(screen.getByText("lift-the-final-two")).toBeInTheDocument();
		expect(screen.getByText("typescript")).toBeInTheDocument();
		expect(screen.getByText("@matthijsgroen")).toBeInTheDocument();
	});

	it("separates meta facts without adding one before the first", () => {
		render(
			<Question meta={[{ label: "a" }, { label: "b" }, { label: "c" }]}>
				Which line?
			</Question>
		);

		expect(screen.getAllByText("·")).toHaveLength(2);
	});

	it("chips the figure a fact turns on and leaves its wording muted", () => {
		render(
			<Question meta={[{ label: "scores", figure: "×1.25", tone: "celadon" }]}>
				Which line?
			</Question>
		);

		expect(screen.getByText("scores")).toHaveClass("text-zinc-400");
		expect(screen.getByText("×1.25").parentElement).toHaveClass(
			"bg-celadon/15"
		);
	});

	it("costs read in the losing colour, so a price cannot be mistaken for a prize", () => {
		render(
			<Question
				meta={[
					{ label: "scores", figure: "×1.25", tone: "celadon" },
					{ label: "wrong costs", figure: "0.5", tone: "cinnabar" },
				]}
			>
				Which line?
			</Question>
		);

		expect(screen.getByText("0.5").parentElement).toHaveClass("bg-cinnabar/15");
	});

	it("takes a fact that is all figure and one that is all words", () => {
		render(
			<Question
				meta={[{ figure: "×2", tone: "celadon" }, { label: "3 options" }]}
			>
				Which line?
			</Question>
		);

		expect(screen.getByText("×2")).toBeInTheDocument();
		expect(screen.getByText("3 options")).toBeInTheDocument();
	});

	it("renders no meta line when the poll carries no facts", () => {
		const { container } = render(<Question>Which line?</Question>);

		expect(container.querySelector("p")).not.toBeInTheDocument();
	});

	it("gives the category chip the gate's accent unless told otherwise", () => {
		render(<Question category={{ label: "typescript" }}>Which one?</Question>);

		expect(screen.getByText("typescript").parentElement).toHaveClass(
			"bg-theme-soft"
		);
	});
});
