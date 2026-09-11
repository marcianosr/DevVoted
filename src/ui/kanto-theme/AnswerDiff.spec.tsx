import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AnswerDiff } from "./AnswerDiff.ui";

const MISS = {
	outcome: "wrong",
	answerType: "single",
	expected: [{ letter: "A", label: "justify-content" }],
	received: [{ letter: "B", label: "align-items" }],
	others: [
		{ letter: "C", label: "text-align" },
		{ letter: "D", label: "place-items" },
	],
	othersLabel: "2 other options",
} as const;

const sideOf = (label: string) =>
	screen.getByText(label).closest("div") as HTMLElement;

describe("AnswerDiff", () => {
	it("stands what was wanted over what was given", () => {
		render(<AnswerDiff {...MISS} />);

		expect(
			within(sideOf("Expected")).getByText("justify-content")
		).toBeInTheDocument();
		expect(
			within(sideOf("Received")).getByText("align-items")
		).toBeInTheDocument();
	});

	it("reads Expected in celadon whatever the answer did", () => {
		const { rerender } = render(<AnswerDiff {...MISS} />);

		const expected = () =>
			screen.getByText("justify-content").closest("[data-screen-theme]");

		expect(expected()).toHaveAttribute("data-screen-theme", "celadon");

		rerender(<AnswerDiff {...MISS} outcome="correct" />);

		expect(expected()).toHaveAttribute("data-screen-theme", "celadon");
	});

	it.each([
		["correct", "viridian"],
		["partial", "saffron"],
		["wrong", "cinnabar"],
	] as const)("dresses Received in the %s outcome", (outcome, color) => {
		render(<AnswerDiff {...MISS} outcome={outcome} />);

		expect(
			screen.getByText("align-items").closest("[data-screen-theme]")
		).toHaveAttribute("data-screen-theme", color);
	});

	it("lets the two sides share a colour only when the answer was right", () => {
		render(
			<AnswerDiff
				outcome="correct"
				expected={[{ letter: "A", label: "slice" }]}
				received={[{ letter: "A", label: "slice" }]}
			/>
		);

		const chips = screen.getAllByText("slice");
		const themes = chips.map((chip) =>
			chip.closest("[data-screen-theme]")?.getAttribute("data-screen-theme")
		);

		expect(new Set(themes).size).toBe(2);
	});

	it("counts the catches on a multi-answer poll", () => {
		render(
			<AnswerDiff
				outcome="partial"
				answerType="multiple"
				expected={[
					{ letter: "A", label: "Partial<T>" },
					{ letter: "C", label: "Readonly<T>" },
					{ letter: "D", label: "Record<K,V>" },
				]}
				received={[
					{ letter: "A", label: "Partial<T>" },
					{ letter: "C", label: "Readonly<T>" },
				]}
				tally="2 of 3 caught"
			/>
		);

		expect(screen.getByText("2 of 3 caught")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
		expect(
			within(sideOf("Received")).getByText("2 of 3 caught")
		).toBeInTheDocument();
	});

	it("folds the options nobody touched, shut", () => {
		const { container } = render(<AnswerDiff {...MISS} />);

		const fold = container.querySelector("details");

		expect(fold).not.toHaveAttribute("open");
		expect(
			screen.getByRole("heading", { name: "2 other options" })
		).toBeInTheDocument();
	});

	it("draws no fold when every option is already on the diff", () => {
		const { container } = render(
			<AnswerDiff
				outcome="wrong"
				expected={[{ letter: "A", label: "slice" }]}
				received={[{ letter: "B", label: "splice" }]}
			/>
		);

		expect(container.querySelector("details")).toBeNull();
	});

	it("labels its two sides for a reader scanning the column", () => {
		render(<AnswerDiff {...MISS} />);

		expect(screen.getByText("Expected").parentElement).toHaveClass("w-20");
		expect(screen.getByText("Received").parentElement).toHaveClass("w-20");
	});
});
