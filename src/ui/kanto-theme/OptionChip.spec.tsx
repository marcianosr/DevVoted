import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { OptionChip } from "./OptionChip.ui";

describe("OptionChip", () => {
	it("carries the option's letter beside the answer it names", () => {
		render(<OptionChip letter="A" label="justify-content" />);

		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("justify-content")).toBeInTheDocument();
	});

	it.each([
		["single", "rounded-full"],
		["multiple", "rounded-md"],
	] as const)(
		"caps a %s-answer option with the shape it was answered with",
		(answerType, shape) => {
			render(
				<OptionChip letter="A" label="Partial<T>" answerType={answerType} />
			);

			expect(screen.getByText("A")).toHaveClass(shape);
		}
	);

	it("keeps the letter out of the reading, since the label already says it", () => {
		render(<OptionChip letter="B" label="align-items" />);

		expect(screen.getByText("B")).toHaveAttribute("aria-hidden", "true");
	});

	it("draws an outline for what was expected and a fill for what was given", () => {
		const { rerender } = render(<OptionChip letter="A" label="slice" />);

		expect(screen.getByText("slice").closest("span")).not.toHaveClass(
			"badge-theme"
		);

		rerender(<OptionChip letter="A" label="slice" filled />);

		expect(screen.getByText("slice").closest("span")).toHaveClass(
			"badge-theme"
		);
	});

	it("wears the colour it was handed, and the screen's own without one", () => {
		const { rerender, container } = render(
			<OptionChip letter="A" label="slice" color="celadon" />
		);

		expect(container.firstElementChild).toHaveAttribute(
			"data-screen-theme",
			"celadon"
		);

		rerender(<OptionChip letter="A" label="slice" />);

		expect(container.firstElementChild).not.toHaveAttribute(
			"data-screen-theme"
		);
	});
});
