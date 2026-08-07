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

const summaryAround = (text: RegExp): Element => {
	const summary = screen.getByText(text).closest("summary");
	if (!summary) throw new Error(`No <summary> wraps ${text}`);
	return summary;
};

describe(RunCommunityBoard, () => {
	it("heads the board with today's polls and the player count", () => {
		render(<RunCommunityBoard {...base} />);
		expect(
			screen.getByRole("heading", { name: "Today’s polls" })
		).toBeInTheDocument();
		expect(screen.getByText("5 players answered")).toBeInTheDocument();
	});

	it("leaves the poll's category unnamed — the gate owns the run's colour", () => {
		render(<RunCommunityBoard {...base} />);
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
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

	it("opens on the right answer and your pick, folding the rest away", () => {
		render(<RunCommunityBoard {...base} />);
		expect(
			screen.getByText("Nothing happens and none of the CSS is applied")
		).toBeVisible();
		expect(screen.getByText("All three tags turn red")).not.toBeVisible();
		expect(screen.getByText("The CSS breaks entirely")).not.toBeVisible();
	});

	it("counts the folded options and the votes they still hold", () => {
		render(<RunCommunityBoard {...base} />);
		expect(screen.getByText(/2 other options, 3 votes/)).toBeInTheDocument();
	});

	it("drops the vote count from a tail nobody touched", () => {
		const untouchedTail: RunCommunityPoll = {
			...answeredPoll,
			detail: answeredPoll.detail && {
				...answeredPoll.detail,
				options: answeredPoll.detail.options.map((option) =>
					option.isRight ? option : { ...option, count: 0, voters: [] }
				),
			},
		};
		render(<RunCommunityBoard {...base} polls={[untouchedTail]} />);
		expect(screen.getByText(/2 other options/)).not.toHaveTextContent("vote");
	});

	it("shows one row when the answer you picked was the right one", () => {
		render(<RunCommunityBoard {...base} />);
		// isRight and yours are the same option here, so it is listed once.
		expect(
			screen.getAllByText("Nothing happens and none of the CSS is applied")
		).toHaveLength(1);
	});

	it("unfolds the tail with its voter chips and counts intact", () => {
		render(<RunCommunityBoard {...base} />);
		fireEvent.click(summaryAround(/2 other options, 3 votes/));
		expect(screen.getByText("All three tags turn red")).toBeVisible();
		expect(screen.getByText("3")).toBeVisible();
	});

	it("lists an option's pick count without a percentage", () => {
		render(<RunCommunityBoard {...base} />);
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.queryByText("40%")).not.toBeInTheDocument();
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

	it("keeps the share who got it right in view whether the poll is open or shut", () => {
		render(<RunCommunityBoard {...base} />);
		const percent = screen.getByText("40% correct");
		expect(percent).toBeInTheDocument();

		fireEvent.click(summaryAround(/What happens when the stylesheet 404s\?/));
		expect(
			screen.getByText("Nothing happens and none of the CSS is applied")
		).not.toBeVisible();
		expect(screen.getByText("40% correct")).toBeInTheDocument();
	});

	it("colours the share by how the crowd found the poll", () => {
		render(<RunCommunityBoard {...base} />);
		// 40% split the room.
		expect(screen.getByText("40% correct")).toHaveClass("text-saffron");

		const brutal: RunCommunityPoll = {
			...answeredPoll,
			pollId: 3,
			detail: answeredPoll.detail && {
				...answeredPoll.detail,
				gotItRightCount: 1,
				answeredCount: 5,
			},
		};
		render(<RunCommunityBoard {...base} polls={[brutal]} />);
		expect(screen.getByText("20% correct")).toHaveClass("text-vermillion");
	});

	it("lists the day's standouts by avatar and value, summarising your haul", () => {
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
		expect(screen.getByText("you took one of two")).toBeInTheDocument();
		expect(screen.getByText("fastest answer")).toBeInTheDocument();
		expect(screen.getByText("9s")).toBeInTheDocument();
		// The winner is the avatar; their name lives in its tooltip, as on an
		// option row.
		expect(
			screen
				.getAllByText("Brock Boulder")
				.every((node) => node.getAttribute("role") === "tooltip")
		).toBe(true);
	});

	it("says nothing about your haul when you took no standouts", () => {
		render(
			<RunCommunityBoard
				{...base}
				standouts={[
					{
						voter: { id: "brock", displayName: "Brock Boulder", you: false },
						title: "most CSS polls",
						value: "3",
					},
				]}
			/>
		);
		expect(screen.queryByText(/you took/)).not.toBeInTheDocument();
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
