import { describe, expect, it } from "vitest";

import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import type { PollCreator } from "~/modules/polls/poll/domain/poll.model";
import { TEST_DATES } from "~/test/kanto";

import { pollDetailViewOf } from "./pollDetail.viewmodel";

const MISTY: PollCreator = {
	id: "misty-id",
	displayName: "Misty",
	amountOfPolls: 3,
	photoUrl: "https://example.test/misty.png",
	githubUsername: "misty",
};

const POLL = createMockPoll({
	id: 7,
	pollNumber: 12,
	question: "Which value of `position` removes an element from normal flow?",
	status: "draft",
	answerType: "single",
	categoryCode: "css",
	createdBy: MISTY.id,
	createdAt: new Date(`${TEST_DATES.birthday}T12:00:00`),
	explanation: "Absolute takes the box out of flow.",
});

const OUT_OF_FLOW =
	"Taken out of flow and placed against the nearest positioned ancestor.";
const STAYS_IN_FLOW = "Sticky stays in flow until it reaches its threshold.";

const OPTIONS = [
	{
		id: 1,
		pollId: 7,
		option: "absolute",
		correct: true,
		explanation: OUT_OF_FLOW,
		group: null,
	},
	{
		id: 2,
		pollId: 7,
		option: "relative",
		correct: false,
		explanation: null,
		group: null,
	},
	{
		id: 3,
		pollId: 7,
		option: "sticky",
		correct: false,
		explanation: STAYS_IN_FLOW,
		group: null,
	},
];

const PAIRS_POLL = createMockPoll({
	id: 8,
	question: "Match each combinator to the elements it pulls in!",
	answerType: "pairs",
	categoryCode: "css",
	createdBy: MISTY.id,
	createdAt: new Date(`${TEST_DATES.christmas}T12:00:00`),
});

const pairTile = (id: number, option: string, group: number) => ({
	id,
	pollId: 8,
	option,
	correct: true,
	explanation: null,
	group,
});

const PAIR_OPTIONS = [
	pairTile(11, "div + p", 0),
	pairTile(12, "Only the p right after a div", 0),
	pairTile(13, "div ~ p", 1),
	pairTile(14, "Every p after a div", 1),
	pairTile(15, "div > p", 2),
	pairTile(16, "A p directly inside a div", 2),
	pairTile(17, "div p", 3),
	pairTile(18, "A p anywhere inside a div", 3),
];

const labelsOf = (tiles: readonly { label: string }[] | undefined) =>
	tiles?.map((tile) => tile.label);

describe("pollDetailViewOf for a pairs poll", () => {
	it("splits the tiles into a left and right column of open tiles as a player meets them", () => {
		const { pairs } = pollDetailViewOf(
			PAIRS_POLL,
			PAIR_OPTIONS,
			[MISTY],
			"player"
		).question;

		expect(labelsOf(pairs?.left)).toEqual(
			expect.arrayContaining(["div + p", "div ~ p", "div > p", "div p"])
		);
		expect(labelsOf(pairs?.left)).toHaveLength(4);
		expect(labelsOf(pairs?.right)).toHaveLength(4);
		expect(
			[...(pairs?.left ?? []), ...(pairs?.right ?? [])].every(
				(tile) => tile.state === "open"
			)
		).toBe(true);
	});

	it("lines every pair up side by side as matched when the answer is shown", () => {
		const { pairs } = pollDetailViewOf(
			PAIRS_POLL,
			PAIR_OPTIONS,
			[MISTY],
			"answer"
		).question;

		expect(labelsOf(pairs?.left)).toEqual([
			"div + p",
			"div ~ p",
			"div > p",
			"div p",
		]);
		expect(labelsOf(pairs?.right)).toEqual([
			"Only the p right after a div",
			"Every p after a div",
			"A p directly inside a div",
			"A p anywhere inside a div",
		]);
		expect(pairs?.right.every((tile) => tile.state === "matched")).toBe(true);
	});

	it("draws no pair columns for a choice poll", () => {
		expect(
			pollDetailViewOf(POLL, OPTIONS, [MISTY], "answer").question.pairs
		).toBeUndefined();
	});
});

describe("pollDetailViewOf", () => {
	it("letters the options in order and leaves them unmarked as a player meets them", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "player");

		expect(view.question.options).toEqual([
			{ id: "1", letter: "A", label: "absolute" },
			{ id: "2", letter: "B", label: "relative" },
			{ id: "3", letter: "C", label: "sticky" },
		]);
	});

	it("marks the right answers when the answer is shown", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "answer");

		expect(view.question.options.map((option) => option.state)).toEqual([
			"right",
			"idle",
			"idle",
		]);
	});

	it("explains each option by its own correctness once the answer is shown", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "answer");

		expect(view.question.options[0]?.explanation).toEqual({
			text: OUT_OF_FLOW,
			right: true,
		});
		expect(view.question.options[2]?.explanation).toEqual({
			text: STAYS_IN_FLOW,
			right: false,
		});
	});

	it("leaves an option with no explanation bare in the answer view", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "answer");

		expect(view.question.options[1]).not.toHaveProperty("explanation");
	});

	it("holds every option's explanation back from a player", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "player");

		expect(
			view.question.options.some((option) => "explanation" in option)
		).toBe(false);
	});

	it("names the poll by its number and category, and states its status", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "player");

		expect(view).toMatchObject({
			number: "#12",
			category: "CSS",
			status: "draft",
			created: "13 May 2026",
		});
	});

	it("credits the author by name and photo once the creators are known", () => {
		expect(pollDetailViewOf(POLL, OPTIONS, [MISTY], "player").author).toEqual({
			name: "Misty",
			photoUrl: "https://example.test/misty.png",
			userId: "misty-id",
		});
		expect(
			pollDetailViewOf(POLL, OPTIONS, undefined, "player").author
		).toBeUndefined();
	});

	it("carries the explanation only when the poll has one", () => {
		expect(pollDetailViewOf(POLL, OPTIONS, [], "player").explanation).toBe(
			"Absolute takes the box out of flow."
		);
		expect(
			pollDetailViewOf({ ...POLL, explanation: "  " }, OPTIONS, [], "player")
		).not.toHaveProperty("explanation");
	});

	it("states the review and dates it beside the last edit", () => {
		const view = pollDetailViewOf(
			{
				...POLL,
				updatedAt: new Date(`${TEST_DATES.birthday}T12:00:00`),
				reviewedAt: new Date(`${TEST_DATES.christmas}T09:00:00`),
			},
			OPTIONS,
			[],
			"player"
		);

		expect(view).toMatchObject({
			review: "changed",
			reviewedOn: "25 Dec 2025",
			updatedOn: "13 May 2026",
		});
	});

	it("dates no review for a poll nobody reviewed", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [], "player");

		expect(view.review).toBe("never");
		expect(view).not.toHaveProperty("reviewedOn");
	});
});
