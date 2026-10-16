import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	REVIEW_DEX_NOTE,
	kantoGateAnswers,
	kantoReview,
	kantoReviewAt,
	kantoReviewFlawless,
} from "~/test/kantoGate.factory";

import { ReviewScreen } from "./ReviewScreen.ui";

const props = kantoReview();

const rowOf = (question: string) =>
	screen
		.getByRole("heading", { name: question })
		.closest<HTMLElement>(".panel-surface");

describe("ReviewScreen", () => {
	it("names the gate it is reviewing and how many polls it held", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Review · Lavender" })
		).toBeInTheDocument();
		expect(screen.getByText("5 polls")).toBeInTheDocument();
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

	it("heads every card with its verdict as a word", () => {
		render(<ReviewScreen {...props} />);

		expect(screen.getAllByText("PASS")).toHaveLength(3);
		expect(screen.getByText("PART")).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
	});

	it("heads each card with its category and what the answer paid", () => {
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

	it("marks the right answer and the wrong pick on the poll's own options", () => {
		render(<ReviewScreen {...props} />);

		const miss = rowOf(
			"Which property centres a flex child along the main axis?"
		)!;

		expect(
			within(miss).getByText("justify-content").closest("[data-answer]")
		).toHaveAttribute("data-answer", "right");
		expect(
			within(miss).getByText("align-items").closest("[data-answer]")
		).toHaveAttribute("data-answer", "wrong");
	});

	it("explains each option under its own row, worded by the option and not the pick", () => {
		render(<ReviewScreen {...props} />);

		const miss = rowOf(
			"Which property centres a flex child along the main axis?"
		)!;
		const right = within(miss)
			.getByText("justify-content")
			.closest<HTMLElement>("[data-answer]")!;
		const unpicked = within(miss)
			.getByText("text-align")
			.closest<HTMLElement>("[data-answer]")!;

		expect(within(right).getByText("Why it’s right")).toBeInTheDocument();
		expect(unpicked).toHaveAttribute("data-answer", "idle");
		expect(within(unpicked).getByText("Why it’s wrong")).toBeInTheDocument();
		expect(
			within(miss).getByText("align-items").closest("[data-answer]")
		).not.toContainElement(within(miss).queryByText("Why it’s wrong"));
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

	it("leaves for the shop, and says where the polls went", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByRole("button", { name: /^To the shop/ })
		).toBeInTheDocument();
		expect(screen.getByText(REVIEW_DEX_NOTE)).toBeInTheDocument();
	});

	it("stands its cards on the page, shedding the screen's own frame", () => {
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

	it("tallies a flawless gate as all passes", () => {
		render(<ReviewScreen {...kantoReviewFlawless()} />);

		expect(screen.getByText("5 passed")).toBeInTheDocument();
		expect(screen.queryByText(/failed/)).not.toBeInTheDocument();
	});

	it("shows every poll open as a card with its facts", () => {
		const { container } = render(<ReviewScreen {...props} />);

		expect(screen.getAllByText(/^\d+ (options|pairs) · /)).toHaveLength(5);
		expect(container.querySelector("details")).toBeNull();
		expect(
			within(rowOf("What does a rebase rewrite?")!).getByText(/options ·/)
		).toBeInTheDocument();
	});

	it("puts who picked an option under its label, beside the vote count", () => {
		const answers = kantoGateAnswers.map((answer, index) => ({
			...answer,
			pollId: String(index),
		}));
		render(
			<ReviewScreen
				{...kantoReviewAt({
					gate: 4,
					answers,
					votes: new Map(
						answers.map((answer) => [
							answer.pollId,
							[
								{
									label: answer.options[0],
									count: 7,
									climbers: [{ name: "Misty" }],
								},
							],
						])
					),
				})}
			/>
		);

		const count = within(rowOf("What does a rebase rewrite?")!).getByText("7");

		expect(count.closest("[data-note]")).toBeNull();
		expect(count.closest("[data-answer]")).toContainElement(
			within(rowOf("What does a rebase rewrite?")!).getByText("the commits")
		);
	});
});
