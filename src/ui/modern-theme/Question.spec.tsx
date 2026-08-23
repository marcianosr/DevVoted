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
			<Question meta={["lift-the-final-two", "typescript", "@matthijsgroen"]}>
				Which line?
			</Question>
		);

		expect(screen.getByText("lift-the-final-two")).toBeInTheDocument();
		expect(screen.getByText("typescript")).toBeInTheDocument();
		expect(screen.getByText("@matthijsgroen")).toBeInTheDocument();
	});

	it("separates meta facts without adding one before the first", () => {
		render(<Question meta={["a", "b", "c"]}>Which line?</Question>);

		expect(screen.getAllByText("·")).toHaveLength(2);
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
