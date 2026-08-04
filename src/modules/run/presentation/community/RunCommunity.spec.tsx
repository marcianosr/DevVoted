import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { RunCommunityPoll } from "~/modules/run/api/community.handlers";

import { RunCommunityBoard } from "./RunCommunity.ui";

const answeredPoll: RunCommunityPoll = {
	pollId: 1,
	index: 0,
	question: "What happens when the stylesheet 404s?",
	category: "css",
	outcome: "correct",
	detail: {
		answerType: "single",
		answeredCount: 5,
		gotItRightCount: 2,
		youGotItRight: true,
		options: [
			{
				label: "Nothing happens and none of the CSS is applied",
				isRight: true,
				count: 2,
				percent: 40,
				yours: true,
				voters: [
					{ id: "red", displayName: "Red", you: true },
					{ id: "brock", displayName: "Brock Boulder", you: false },
				],
			},
			{
				label: "All three tags turn red",
				isRight: false,
				count: 3,
				percent: 60,
				yours: false,
				voters: [
					{ id: "misty", displayName: "Misty Cascade", you: false },
					{ id: "surge", displayName: "Lt Surge", you: false },
					{ id: "erika", displayName: "Erika Rainbow", you: false },
				],
			},
			{
				label: "The CSS breaks entirely",
				isRight: false,
				count: 0,
				percent: 0,
				yours: false,
				voters: [],
			},
		],
	},
};

const missedPoll: RunCommunityPoll = {
	pollId: 2,
	index: 1,
	question: "Which town has no gym?",
	category: null,
	outcome: "missed",
	detail: null,
};

const base = {
	totalPlayers: 5,
	topPercent: 18,
	standouts: [],
	polls: [answeredPoll, missedPoll],
};

describe(RunCommunityBoard, () => {
	it("heads the board with the player count for today", () => {
		render(<RunCommunityBoard {...base} />);
		expect(
			screen.getByRole("heading", { name: "Community" })
		).toBeInTheDocument();
		expect(screen.getByText("5 players answered today")).toBeInTheDocument();
	});

	it("wears the poll's category as a swatch next to the question — sealed polls stay bare", () => {
		render(<RunCommunityBoard {...base} />);
		const [swatch] = screen.getAllByTestId("swatch");
		// The swatch inherits its color from the section's category theme.
		expect(swatch.closest("[data-category-theme]")).toHaveAttribute(
			"data-category-theme",
			"css"
		);
		// One answered poll → exactly one swatch; the missed poll shows none.
		expect(screen.getAllByTestId("swatch")).toHaveLength(1);
	});

	it("tags a multiple-answer poll with a quiet multi marker", () => {
		const multi: RunCommunityPoll = {
			...answeredPoll,
			detail: answeredPoll.detail && {
				...answeredPoll.detail,
				answerType: "multiple",
			},
		};
		render(<RunCommunityBoard {...base} polls={[multi]} />);
		expect(screen.getByText("multi")).toBeInTheDocument();
	});

	it("lists every option with its pick count — no percentages, no summary line", () => {
		render(<RunCommunityBoard {...base} />);
		expect(
			screen.getByText("Nothing happens and none of the CSS is applied")
		).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.queryByText("40%")).not.toBeInTheDocument();
		expect(screen.queryByText(/got it right/)).not.toBeInTheDocument();
	});

	it("tucks voter names into chip tooltips, with the viewer's 'you' chip first", () => {
		render(<RunCommunityBoard {...base} />);
		const tooltips = screen
			.getAllByRole("tooltip")
			.map((tooltip) => tooltip.textContent);
		expect(tooltips[0]).toBe("you");
		expect(tooltips).toContain("Brock Boulder");
		// The name only exists inside the tooltip — never as visible row text.
		expect(screen.getByText("Brock Boulder")).toHaveAttribute(
			"role",
			"tooltip"
		);
	});

	it("folds a poll's options behind its question and reopens on a second tap", () => {
		render(<RunCommunityBoard {...base} />);
		const question = screen.getByRole("button", {
			name: /What happens when the stylesheet 404s\?/,
		});
		// jsdom has no matchMedia, so the section starts open (the desktop default).
		expect(screen.getByText("All three tags turn red")).toBeInTheDocument();
		expect(screen.queryByText(/had it correct/)).not.toBeInTheDocument();
		fireEvent.click(question);
		expect(
			screen.queryByText("All three tags turn red")
		).not.toBeInTheDocument();
		// Folded, the row still tells the story: the share who got it right.
		expect(screen.getByText(/had it correct/)).toHaveTextContent(
			"40% had it correct"
		);
		fireEvent.click(question);
		expect(screen.getByText("All three tags turn red")).toBeInTheDocument();
	});

	it("lists the day's standouts with the winner named and the value in view", () => {
		render(
			<RunCommunityBoard
				{...base}
				standouts={[
					{
						voter: { id: "red", displayName: "Red", you: true },
						title: "fastest answer",
						value: "9s",
					},
					{
						voter: { id: "brock", displayName: "Brock Boulder", you: false },
						title: "most CSS polls",
						value: "3",
					},
				]}
			/>
		);
		expect(screen.getByText("standouts today")).toBeInTheDocument();
		// The viewer's own standout reads "you"; others carry their name visibly.
		expect(screen.getByText("fastest answer")).toBeInTheDocument();
		expect(screen.getByText("9s")).toBeInTheDocument();
		expect(
			screen
				.getAllByText("Brock Boulder")
				.some((node) => node.getAttribute("role") !== "tooltip")
		).toBe(true);
	});

	it("keeps a skipped poll sealed — no question, no results", () => {
		render(<RunCommunityBoard {...base} />);
		expect(
			screen.getByText(/Poll 2 · skipped — results stay sealed/)
		).toBeInTheDocument();
		expect(
			screen.queryByText("Which town has no gym?")
		).not.toBeInTheDocument();
	});
});
