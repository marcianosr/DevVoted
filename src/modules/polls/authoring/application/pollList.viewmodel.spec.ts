import { describe, expect, it } from "vitest";

import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import type { PollCreator } from "~/modules/polls/poll/domain/poll.model";
import { TEST_DATES } from "~/test/kanto";

import {
	ALL,
	EMPTY_FILTER,
	PAGE_SIZE,
	activeFiltersOf,
	hasCode,
	neighboursOf,
	pollStepOf,
	pollListFilterOf,
	pollListQueryOf,
	pollListSearchOf,
	searchOfFilter,
	withoutFilter,
	pollFactsOf,
	pollListChoicesOf,
	pollRowsOf,
	questionSegmentsOf,
	visiblePollsOf,
	windowOf,
	type ReviewedFilter,
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

describe("pollListSearchOf", () => {
	it("keeps every filter the URL states with a value it allows", () => {
		expect(
			pollListSearchOf({
				search: "flex",
				status: "draft",
				answerType: "multiple",
				withCode: true,
				withExplanation: "true",
				dealt: "often",
				category: "css",
				creator: BROCK,
			})
		).toEqual({
			search: "flex",
			status: "draft",
			answerType: "multiple",
			withCode: true,
			withExplanation: true,
			dealt: "often",
			category: "css",
			creator: BROCK,
		});
	});

	it("drops a value the filter does not allow instead of filtering on it", () => {
		expect(
			pollListSearchOf({
				status: "deleted",
				answerType: 3,
				dealt: "twice",
				category: "cobol",
				withCode: "yes",
			})
		).toEqual({});
	});

	it("reads a search the router parsed as a number back as text", () => {
		expect(pollListSearchOf({ search: 151 })).toEqual({ search: "151" });
	});
});

describe("pollListFilterOf", () => {
	it("fills every filter the search leaves out with its default", () => {
		expect(pollListFilterOf({ status: "draft" })).toEqual({
			...EMPTY_FILTER,
			status: "draft",
		});
	});
});

describe("searchOfFilter", () => {
	it("states only the filters that differ from the default", () => {
		expect(
			searchOfFilter({ ...EMPTY_FILTER, category: "css", withCode: true })
		).toEqual({ category: "css", withCode: true });
	});

	it("leaves out a search that is only whitespace", () => {
		expect(searchOfFilter({ ...EMPTY_FILTER, search: "  " })).toEqual({});
	});

	it("round-trips through the URL parser unchanged", () => {
		const filter = {
			...EMPTY_FILTER,
			search: "flex",
			status: "published",
			withExplanation: true,
		} satisfies typeof EMPTY_FILTER;

		expect(pollListFilterOf(pollListSearchOf(searchOfFilter(filter)))).toEqual(
			filter
		);
	});
});

describe("pollListQueryOf", () => {
	it("is empty under the empty filter", () => {
		expect(pollListQueryOf(EMPTY_FILTER)).toBe("");
	});

	it("states each set filter as a query parameter", () => {
		expect(
			pollListQueryOf({ ...EMPTY_FILTER, status: "draft", withCode: true })
		).toBe("?status=draft&withCode=true");
	});
});

describe("pollRowsOf with a query", () => {
	it("carries the list's query onto every row's link", () => {
		const [row] = pollRowsOf([flex], undefined, undefined, "?status=draft");

		expect(row?.href).toBe("/polls/1?status=draft");
	});
});

describe("neighboursOf", () => {
	it("places a poll in the middle between the one before and after it", () => {
		expect(neighboursOf(POLLS, 2)).toEqual({
			position: 2,
			total: 4,
			previous: 1,
			next: 3,
		});
	});

	it("gives the first poll no previous and the last no next", () => {
		expect(neighboursOf(POLLS, 1)).toEqual({ position: 1, total: 4, next: 2 });
		expect(neighboursOf(POLLS, 4)).toEqual({
			position: 4,
			total: 4,
			previous: 3,
		});
	});

	it("has no neighbours for a poll the filter hides", () => {
		expect(neighboursOf([flex, log], 2)).toBeUndefined();
	});

	it("has no neighbours in an empty list", () => {
		expect(neighboursOf([], 1)).toBeUndefined();
	});
});

describe("pollStepOf", () => {
	it("links the neighbours on the same screen, keeping the list's query", () => {
		expect(
			pollStepOf(
				{ position: 2, total: 4, previous: 1, next: 3 },
				"?category=css",
				"edit"
			)
		).toEqual({
			position: 2,
			total: 4,
			previousHref: "/polls/1/edit?category=css",
			nextHref: "/polls/3/edit?category=css",
		});
	});

	it("leaves out the link a poll at the end of the list has no neighbour for", () => {
		expect(pollStepOf({ position: 1, total: 1 }, "", "detail")).toEqual({
			position: 1,
			total: 1,
		});
	});
});

describe("the reviewed filter", () => {
	const REVIEWED_AT = new Date(`${TEST_DATES.christmas}T09:00:00Z`);
	const EDITED_AT = new Date(`${TEST_DATES.christmasEve}T09:00:00Z`);
	const LATER_EDIT = new Date("2026-05-13T10:00:00Z");

	const reviewed = createMockPoll({
		id: 5,
		pollNumber: 5,
		updatedAt: EDITED_AT,
		reviewedAt: REVIEWED_AT,
	});
	const changed = createMockPoll({
		id: 6,
		pollNumber: 6,
		updatedAt: LATER_EDIT,
		reviewedAt: REVIEWED_AT,
	});
	const WITH_REVIEWED = [...POLLS, reviewed, changed];

	it("splits the polls into never reviewed, changed since review and up to date", () => {
		const idsReviewed = (state: ReviewedFilter) =>
			idsOf(
				visiblePollsOf(WITH_REVIEWED, { ...EMPTY_FILTER, reviewed: state })
			);

		expect(idsReviewed("never")).toEqual([1, 2, 3, 4]);
		expect(idsReviewed("changed")).toEqual([6]);
		expect(idsReviewed("current")).toEqual([5]);
	});

	it("counts the polls in each review state", () => {
		expect(pollListChoicesOf(WITH_REVIEWED, EMPTY_FILTER).reviewed).toEqual([
			{ value: ALL, label: "any", count: 6 },
			{ value: "never", label: "never reviewed", count: 4 },
			{ value: "changed", label: "changed since review", count: 1 },
			{ value: "current", label: "up to date", count: 1 },
		]);
	});

	it("names a set review filter as a chip", () => {
		const filter = {
			...EMPTY_FILTER,
			reviewed: "changed",
		} satisfies typeof EMPTY_FILTER;

		expect(
			activeFiltersOf(filter, pollListChoicesOf(WITH_REVIEWED, filter))
		).toEqual([{ key: "reviewed", label: "changed since review" }]);
	});

	it("reads the review filter from the URL and drops a state it does not know", () => {
		expect(pollListSearchOf({ reviewed: "changed" })).toEqual({
			reviewed: "changed",
		});
		expect(pollListSearchOf({ reviewed: "yes" })).toEqual({});
	});

	it("states each row's review state", () => {
		const rows = pollRowsOf([flex, reviewed, changed]);

		expect(rows.map((row) => row.review)).toEqual([
			"never",
			"current",
			"changed",
		]);
	});

	it("dates a reviewed row's review and last edit", () => {
		const [row] = pollRowsOf([changed]);

		expect(row?.reviewedOn).toBe("25 Dec 2025");
		expect(row?.updatedOn).toBe("13 May 2026");
	});

	it("dates only the last edit of a poll nobody reviewed", () => {
		const [row] = pollRowsOf([createMockPoll({ updatedAt: LATER_EDIT })]);

		expect(row?.reviewedOn).toBeUndefined();
		expect(row?.updatedOn).toBe("13 May 2026");
	});
});
