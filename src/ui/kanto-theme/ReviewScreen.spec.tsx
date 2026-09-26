import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	REVIEW_DEX_NOTE,
	REVIEW_EXPAND_LABEL,
	kantoReview,
	kantoReviewAllOpen,
	kantoReviewFlawless,
} from "~/test/kantoGate.factory";

import { ReviewScreen } from "./ReviewScreen.ui";

const props = kantoReview();

const rowOf = (question: string) =>
	screen.getByRole("heading", { name: question }).closest("details");

describe("ReviewScreen", () => {
	it("names the gate it is reviewing and how many polls it held", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Review · Lavender" })
		).toBeInTheDocument();
		expect(screen.getByText("gate 4 · 5 polls")).toBeInTheDocument();
	});

	it("tallies the three outcomes apart, rather than lumping part with failed", () => {
		render(<ReviewScreen {...props} />);

		expect(screen.getByText("3 passed")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("1 part")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
		expect(screen.getByText("1 failed")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("opens the fumbles on arrival and leaves the passes folded", () => {
		render(<ReviewScreen {...props} />);

		expect(
			rowOf("Which property centres a flex child along the main axis?")
		).toHaveAttribute("open");
		expect(rowOf("Which of these are built-in utility types?")).toHaveAttribute(
			"open"
		);
		expect(rowOf("What does a rebase rewrite?")).not.toHaveAttribute("open");
	});

	it("dims a row that needs no reading", () => {
		render(<ReviewScreen {...props} />);

		expect(rowOf("What does a rebase rewrite?")?.parentElement).toHaveClass(
			"opacity-70"
		);
		expect(
			rowOf("Which property centres a flex child along the main axis?")
				?.parentElement
		).not.toHaveClass("opacity-70");
	});

	it("leads every row with its verdict as a word", () => {
		render(<ReviewScreen {...props} />);

		expect(screen.getAllByText("PASS")).toHaveLength(3);
		expect(screen.getByText("PART")).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
	});

	it("closes each strip on its category and what the answer paid", () => {
		render(<ReviewScreen {...props} />);

		const miss = rowOf(
			"Which property centres a flex child along the main axis?"
		)!;

		expect(within(miss).getByText("CSS")).toBeInTheDocument();
		expect(within(miss).getByText("-4.4%")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("stands the expected answer over the one that was given", () => {
		render(<ReviewScreen {...props} />);

		const miss = rowOf(
			"Which property centres a flex child along the main axis?"
		)!;

		expect(within(miss).getByText("justify-content")).toBeInTheDocument();
		expect(within(miss).getByText("align-items")).toBeInTheDocument();
	});

	it("squares the chips on a multi-answer poll and rounds them on a single", () => {
		render(<ReviewScreen {...props} />);

		const multi = rowOf("Which of these are built-in utility types?")!;
		const single = rowOf(
			"Which property centres a flex child along the main axis?"
		)!;

		expect(within(multi).getAllByText("A")[0]).toHaveClass("rounded-md");
		expect(within(single).getByText("A")).toHaveClass("rounded-full");
	});

	it("counts the catches on the poll that was only half right", () => {
		render(<ReviewScreen {...props} />);

		expect(
			within(rowOf("Which of these are built-in utility types?")!).getByText(
				"2 of 3 caught"
			)
		).toBeInTheDocument();
	});

	it("folds the options nobody reached for", () => {
		render(<ReviewScreen {...props} />);

		expect(
			within(
				rowOf("Which property centres a flex child along the main axis?")!
			).getByRole("heading", { name: "2 other options" })
		).toBeInTheDocument();
	});

	it("sits the snippet and the explanation with the diff", () => {
		render(<ReviewScreen {...props} />);

		const miss = rowOf(
			"Which property centres a flex child along the main axis?"
		)!;

		expect(miss.querySelector("code")?.textContent).toContain("display: flex");
		expect(
			within(miss).getByText(/justify-content works along the main axis/)
		).toBeInTheDocument();
	});

	it("offers to open everything, and says what is folded and why", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByRole("button", { name: REVIEW_EXPAND_LABEL })
		).toBeInTheDocument();
		expect(screen.getByText("fumbles open, passes folded")).toBeInTheDocument();
	});

	it("opens every row when the caller says so", () => {
		const { container } = render(<ReviewScreen {...kantoReviewAllOpen()} />);

		for (const row of container.querySelectorAll(
			":scope > div > div > details"
		)) {
			expect(row).toHaveAttribute("open");
		}
	});

	it("leaves for the shop, and says where the polls went", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByRole("button", { name: /^To the shop/ })
		).toBeInTheDocument();
		expect(screen.getByText(REVIEW_DEX_NOTE)).toBeInTheDocument();
	});

	it("stands its folds on the page, shedding the screen's own frame", () => {
		const { container } = render(<ReviewScreen {...props} />);

		expect(container.firstElementChild).not.toHaveClass("bg-theme-faint");
		expect(container.firstElementChild).not.toHaveClass("rounded-3xl");
	});

	it("closes on the press itself, never on a rule across the page", () => {
		render(<ReviewScreen {...props} />);

		const exit = screen.getByRole("button", { name: /^To the shop/ });

		expect(exit.closest("footer")?.parentElement).not.toHaveClass(
			"border-theme-faint"
		);
		expect(within(exit).getByText(REVIEW_DEX_NOTE)).toBeInTheDocument();
	});

	it("folds the whole screen away on a flawless gate", () => {
		const { container } = render(<ReviewScreen {...kantoReviewFlawless()} />);

		expect(screen.getByText("5 passed")).toBeInTheDocument();
		expect(screen.queryByText(/failed/)).not.toBeInTheDocument();
		expect(container.querySelectorAll("details[open]")).toHaveLength(0);
	});
});
