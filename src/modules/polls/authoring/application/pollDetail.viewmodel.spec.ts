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

const OPTIONS = [
	{ id: 1, pollId: 7, option: "absolute", correct: true, group: null },
	{ id: 2, pollId: 7, option: "relative", correct: false, group: null },
];

describe("pollDetailViewOf", () => {
	it("letters the options in order and leaves them unmarked as a player meets them", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "player");

		expect(view.question.options).toEqual([
			{ id: "1", letter: "A", label: "absolute" },
			{ id: "2", letter: "B", label: "relative" },
		]);
	});

	it("marks the right answers when the answer is shown", () => {
		const view = pollDetailViewOf(POLL, OPTIONS, [MISTY], "answer");

		expect(view.question.options.map((option) => option.state)).toEqual([
			"right",
			"idle",
		]);
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
