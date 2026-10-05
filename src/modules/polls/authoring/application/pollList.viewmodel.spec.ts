import { describe, expect, it } from "vitest";

import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import type { PollCreator } from "~/modules/polls/poll/domain/poll.model";

import {
	ALL,
	EMPTY_FILTER,
	PAGE_SIZE,
	activeFiltersOf,
	hasCode,
	withoutFilter,
	pollFactsOf,
	pollListChoicesOf,
	pollRowsOf,
	questionSegmentsOf,
	visiblePollsOf,
	windowOf,
} from "./pollList.viewmodel";

const BROCK = "brock-id";
const MISTY = "misty-id";

const flex = createMockPoll({
	id: 1,
	pollNumber: 1,
	question: "What does `flex: 1` expand to?",
	status: "published",
	answerType: "single",
	categoryCode: "css",
	createdBy: BROCK,
	codeBlock: null,
	codeSandboxExample: null,
});
const stacking = createMockPoll({
	id: 2,
	pollNumber: 2,
	question: "Which of these create a new stacking context?",
	status: "draft",
	answerType: "multiple",
	categoryCode: "css",
	createdBy: MISTY,
	codeBlock: null,
	codeSandboxExample: null,
});
const log = createMockPoll({
	id: 3,
	pollNumber: null,
	question: "What does this log?",
	status: "published",
	answerType: "single",
	categoryCode: "js",
	createdBy: BROCK,
	codeBlock: "console.log(0.1 + 0.2)",
	codeSandboxExample: null,
	explanation: "Floating point.",
});
const sandbox = createMockPoll({
	id: 4,
	pollNumber: 4,
	question: "Which array method returns a new array?",
	status: "archived",
	answerType: "single",
	categoryCode: "js",
	createdBy: MISTY,
	codeBlock: null,
	codeSandboxExample: "https://codesandbox.io/s/abc",
});

const POLLS = [flex, stacking, log, sandbox];

const DEALS: ReadonlyMap<number, number> = new Map([
	[1, 1],
	[3, 4],
]);

const CREATORS: readonly PollCreator[] = [
	{
		id: BROCK,
		displayName: "Brock",
		amountOfPolls: 2,
		photoUrl: "https://example.test/brock.png",
		githubUsername: "brock",
	},
	{
		id: MISTY,
		displayName: "Misty",
		amountOfPolls: 2,
		photoUrl: null,
		githubUsername: null,
	},
];

const idsOf = (polls: readonly { id: number }[]) =>
	polls.map((poll) => poll.id);

describe("visiblePollsOf", () => {
	it("shows every poll under the empty filter", () => {
		expect(idsOf(visiblePollsOf(POLLS, EMPTY_FILTER))).toEqual([1, 2, 3, 4]);
	});

	it("searches the question without regard to case or surrounding space", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, search: "  FLEX " }))
		).toEqual([1]);
	});

	it("narrows to one status", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, status: "published" }))
		).toEqual([1, 3]);
	});

	it("narrows to one answer type", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, answerType: "multiple" }))
		).toEqual([2]);
	});

	it("keeps polls with a code block or a sandbox when asked for code", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, withCode: true }))
		).toEqual([3, 4]);
	});

	it("narrows to one category", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, category: "js" }))
		).toEqual([3, 4]);
	});

	it("narrows to one creator", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, creator: MISTY }))
		).toEqual([2, 4]);
	});

	it("keeps only polls that carry an explanation when asked for one", () => {
		expect(
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, withExplanation: true }))
		).toEqual([3]);
	});

	it("narrows to polls never dealt, dealt once, or dealt again and again", () => {
		const dealt = (times: "never" | "once" | "often") =>
			idsOf(visiblePollsOf(POLLS, { ...EMPTY_FILTER, dealt: times }, DEALS));

		expect(dealt("never")).toEqual([2, 4]);
		expect(dealt("once")).toEqual([1]);
		expect(dealt("often")).toEqual([3]);
	});

	it("applies every filter at once", () => {
		expect(
			idsOf(
				visiblePollsOf(POLLS, {
					...EMPTY_FILTER,
					status: "published",
					category: "js",
					withCode: true,
				})
			)
		).toEqual([3]);
	});
});

describe("pollListChoicesOf", () => {
	it("leads every axis with an all choice counting the whole list", () => {
		const choices = pollListChoicesOf(POLLS, EMPTY_FILTER);

		expect(choices.status[0]).toEqual({ value: ALL, label: "all", count: 4 });
		expect(choices.answerType[0]).toEqual({
			value: ALL,
			label: "any",
			count: 4,
		});
		expect(choices.category[0]).toEqual({ value: ALL, label: "All", count: 4 });
		expect(choices.withCode).toBe(2);
	});

	it("counts a status over the polls the other filters leave, ignoring the status already picked", () => {
		const choices = pollListChoicesOf(POLLS, {
			...EMPTY_FILTER,
			status: "draft",
			category: "css",
		});

		expect(choices.status).toEqual([
			{ value: ALL, label: "all", count: 2 },
			{ value: "draft", label: "draft", count: 1 },
			{ value: "published", label: "published", count: 1 },
			{ value: "archived", label: "archived", count: 0 },
		]);
	});

	it("names a category and counts it under the other filters", () => {
		const choices = pollListChoicesOf(POLLS, {
			...EMPTY_FILTER,
			withCode: true,
		});

		expect(choices.category).toContainEqual({
			value: "js",
			label: "JavaScript",
			count: 2,
		});
		expect(choices.category).toContainEqual({
			value: "css",
			label: "CSS",
			count: 0,
		});
	});

	it("counts the code polls under the other filters, ignoring the code toggle itself", () => {
		expect(
			pollListChoicesOf(POLLS, {
				...EMPTY_FILTER,
				withCode: true,
				category: "js",
			}).withCode
		).toBe(2);
	});

	it("counts the explained polls under the other filters", () => {
		expect(pollListChoicesOf(POLLS, EMPTY_FILTER).withExplanation).toBe(1);
	});

	it("counts how often the polls left were dealt", () => {
		expect(
			pollListChoicesOf(POLLS, EMPTY_FILTER, undefined, DEALS).dealt
		).toEqual([
			{ value: ALL, label: "any", count: 4 },
			{ value: "never", label: "never", count: 2 },
			{ value: "once", label: "once", count: 1 },
			{ value: "often", label: "2+ times", count: 1 },
		]);
	});

	it("offers no creator choices until creators are known", () => {
		expect(pollListChoicesOf(POLLS, EMPTY_FILTER).creator).toBeUndefined();
	});

	it("leads the creators with every creator, then each by display name", () => {
		expect(pollListChoicesOf(POLLS, EMPTY_FILTER, CREATORS).creator).toEqual([
			{ value: ALL, label: "all creators" },
			{ value: BROCK, label: "Brock" },
			{ value: MISTY, label: "Misty" },
		]);
	});
});

describe("activeFiltersOf", () => {
	it("names nothing under the empty filter", () => {
		expect(
			activeFiltersOf(EMPTY_FILTER, pollListChoicesOf(POLLS, EMPTY_FILTER))
		).toEqual([]);
	});

	it("names each filter set, in the words its control uses", () => {
		const filter = {
			...EMPTY_FILTER,
			search: "flex",
			category: "css" as const,
			withExplanation: true,
			dealt: "never" as const,
			creator: MISTY,
		};

		expect(
			activeFiltersOf(filter, pollListChoicesOf(POLLS, filter, CREATORS))
		).toEqual([
			{ key: "search", label: "“flex”" },
			{ key: "dealt", label: "dealt never" },
			{ key: "withExplanation", label: "with explanation" },
			{ key: "category", label: "CSS" },
			{ key: "creator", label: "Misty" },
		]);
	});
});

describe("withoutFilter", () => {
	it("clears only the filter it names", () => {
		const filter = {
			...EMPTY_FILTER,
			category: "css" as const,
			withCode: true,
		};

		expect(withoutFilter(filter, "category")).toEqual({
			...EMPTY_FILTER,
			withCode: true,
		});
	});
});

describe("hasCode", () => {
	it("is true for a code block, a sandbox, and false for neither", () => {
		expect(hasCode(log)).toBe(true);
		expect(hasCode(sandbox)).toBe(true);
		expect(hasCode(flex)).toBe(false);
	});

	it("counts a fenced block in the question, but not an inline span", () => {
		expect(
			hasCode(
				createMockPoll({
					question: "What logs?\n```js\n1\n```",
				})
			)
		).toBe(true);
		expect(hasCode(createMockPoll({ question: "What is `1`?" }))).toBe(false);
	});
});

describe("questionSegmentsOf", () => {
	it("drops a fenced block and joins the prose around it with a space", () => {
		expect(
			questionSegmentsOf("What does this log?\n```js\n1\n```\nBe honest.")
		).toEqual([{ kind: "text", text: "What does this log? Be honest." }]);
	});

	it("strips the fence off a code span and leaves the prose as text", () => {
		expect(questionSegmentsOf("What does `flex: 1` expand to?")).toEqual([
			{ kind: "text", text: "What does " },
			{ kind: "code", text: "flex: 1" },
			{ kind: "text", text: " expand to?" },
		]);
	});
});

describe("pollFactsOf", () => {
	it("states the answer type", () => {
		expect(pollFactsOf(flex)).toBe("single answer");
		expect(pollFactsOf(stacking)).toBe("multiple answers");
	});

	it("appends code when the poll carries an example", () => {
		expect(pollFactsOf(log)).toBe("single answer · code");
	});

	it("appends how often the poll was dealt once it has been", () => {
		expect(pollFactsOf(log, 4)).toBe("single answer · code · dealt 4×");
		expect(pollFactsOf(flex, 0)).toBe("single answer");
	});
});

describe("pollRowsOf", () => {
	it("links each row to its poll and numbers it by poll number, falling back to the id", () => {
		const rows = pollRowsOf([flex, log]);

		expect(rows[0]).toMatchObject({ id: 1, href: "/polls/1", number: 1 });
		expect(rows[1]).toMatchObject({ id: 3, href: "/polls/3", number: 3 });
	});

	it("names the category, the facts and the status", () => {
		expect(pollRowsOf([log])[0]).toMatchObject({
			category: "JavaScript",
			facts: "single answer · code",
			status: "published",
		});
	});

	it("carries no author until creators are known", () => {
		expect(pollRowsOf([flex])[0]?.author).toBeUndefined();
	});

	it("names the author from the creators, with a photo only when there is one", () => {
		const rows = pollRowsOf([flex, stacking], CREATORS);

		expect(rows[0]?.author).toEqual({
			name: "Brock",
			photoUrl: "https://example.test/brock.png",
		});
		expect(rows[1]?.author).toEqual({ name: "Misty" });
	});

	it("leaves the author off a poll whose creator is not in the list", () => {
		expect(pollRowsOf([flex], [])[0]?.author).toBeUndefined();
	});
});

describe("windowOf", () => {
	const rows = pollRowsOf(
		Array.from({ length: 25 }, (_, index) =>
			createMockPoll({ id: index + 1, pollNumber: index + 1 })
		)
	);

	it("shows the first page and says more is left", () => {
		expect(windowOf(rows, PAGE_SIZE)).toMatchObject({
			shown: 10,
			total: 25,
			more: true,
		});
		expect(windowOf(rows, PAGE_SIZE).rows).toHaveLength(10);
	});

	it("never shows more than there is", () => {
		expect(windowOf(rows, 30)).toMatchObject({
			shown: 25,
			total: 25,
			more: false,
		});
	});

	it("is empty for an empty list", () => {
		expect(windowOf([], PAGE_SIZE)).toEqual({
			rows: [],
			shown: 0,
			total: 0,
			more: false,
		});
	});
});
