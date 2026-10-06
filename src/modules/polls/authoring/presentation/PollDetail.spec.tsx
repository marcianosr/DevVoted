import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PollDetail, type PollDetailProps } from "./PollDetail.ui";

const PROPS: PollDetailProps = {
	id: 1,
	number: "#1",
	category: "CSS",
	status: "draft",
	created: "4 Oct 2026",
	question: {
		answerType: "single",
		question: "Which value of `position` removes an element from flow?",
		options: [
			{ id: "1", letter: "A", label: "absolute" },
			{ id: "2", letter: "B", label: "relative" },
		],
	},
	explanation: "Absolute leaves the flow.",
	canEdit: false,
	editHref: "/polls/1/edit",
	listHref: "/polls",
	view: "player",
	onView: vi.fn(),
};

describe("PollDetail", () => {
	it("draws the poll as the run's question card, with its number, category and status", () => {
		render(<PollDetail {...PROPS} />);

		expect(screen.getByText("#1")).toBeInTheDocument();
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("draft")).toBeInTheDocument();
		expect(screen.getByText("absolute")).toBeInTheDocument();
	});

	it("keeps the explanation back while the poll is shown as a player meets it", () => {
		render(<PollDetail {...PROPS} />);

		expect(
			screen.queryByText("Absolute leaves the flow.")
		).not.toBeInTheDocument();
	});

	it("states the explanation once the answer is shown", () => {
		render(<PollDetail {...PROPS} view="answer" />);

		expect(screen.getByText("Absolute leaves the flow.")).toBeInTheDocument();
	});

	it("asks to show the answer when that view is picked", async () => {
		const onView = vi.fn();
		render(<PollDetail {...PROPS} onView={onView} />);

		await userEvent.click(
			screen.getByRole("radio", { name: /with the answer/ })
		);

		expect(onView).toHaveBeenCalledWith("answer");
	});

	it("offers the edit press only to someone who may edit", () => {
		const { rerender } = render(<PollDetail {...PROPS} />);
		expect(
			screen.queryByRole("link", { name: "Edit poll" })
		).not.toBeInTheDocument();

		rerender(<PollDetail {...PROPS} canEdit />);
		expect(screen.getByRole("link", { name: "Edit poll" })).toHaveAttribute(
			"href",
			"/polls/1/edit"
		);
	});
});

describe("PollDetail stepping through a filtered list", () => {
	it("links back to the list it came from and to the polls either side", () => {
		render(
			<PollDetail
				{...PROPS}
				listHref="/polls?category=css"
				step={{
					position: 2,
					total: 9,
					previousHref: "/polls/7?category=css",
					nextHref: "/polls/12?category=css",
				}}
			/>
		);

		expect(screen.getByRole("link", { name: "← Polls" })).toHaveAttribute(
			"href",
			"/polls?category=css"
		);
		expect(screen.getByRole("link", { name: "‹ previous" })).toHaveAttribute(
			"href",
			"/polls/7?category=css"
		);
		expect(screen.getByRole("link", { name: "next ›" })).toHaveAttribute(
			"href",
			"/polls/12?category=css"
		);
		expect(screen.getByText("2 of 9")).toBeInTheDocument();
	});

	it("offers only the way back when the poll is not in the list", () => {
		render(<PollDetail {...PROPS} />);

		expect(screen.queryByRole("link", { name: "next ›" })).toBeNull();
		expect(screen.getByRole("link", { name: "← Polls" })).toBeInTheDocument();
	});
});

describe("PollDetail review", () => {
	it("lets an admin mark an unreviewed poll reviewed", async () => {
		const onReview = vi.fn();
		render(<PollDetail {...PROPS} canEdit onReview={onReview} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Mark reviewed" })
		);

		expect(onReview).toHaveBeenCalledOnce();
	});

	it("states a reviewed poll instead of offering the press", () => {
		render(<PollDetail {...PROPS} canEdit reviewed />);

		expect(screen.getByText("reviewed")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Mark reviewed" })).toBeNull();
	});
});
