import type { Meta, StoryObj } from "@storybook/react";

import {
	APPROVED_POLL_REWARD,
	EMPTY_FILTER,
	PAGE_SIZE,
	pollListChoicesOf,
	pollRowsOf,
	visiblePollsOf,
	windowOf,
	type PollListFilter,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import {
	PollList,
	PollListError,
	PollListLoading,
	type PollListProps,
} from "~/modules/polls/authoring/presentation/PollList.ui";
import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import type { Poll, PollCreator } from "~/modules/polls/poll/domain/poll.model";
import { GYM_LEADERS } from "~/test/kanto";

const noop = () => {};

const CREATORS: readonly PollCreator[] = GYM_LEADERS.slice(0, 4).map(
	(leader, index) => ({
		id: `leader-${index}`,
		displayName: leader.name,
		amountOfPolls: 3,
		photoUrl: null,
		githubUsername: null,
	})
);

const QUESTIONS: readonly Partial<Poll>[] = [
	{
		question:
			"Which value of `position` removes an element from normal flow and anchors it to the nearest positioned ancestor?",
		categoryCode: "css",
	},
	{ question: "What does `flex: 1` expand to?", categoryCode: "css" },
	{
		question: "Which selectors have higher specificity than a single class?",
		categoryCode: "css",
		answerType: "multiple",
	},
	{
		question: "What is the computed width of this box?",
		categoryCode: "css",
		codeBlock: ".box { width: 200px; box-sizing: border-box; }",
	},
	{
		question: "Which unit is relative to the root element's font size?",
		categoryCode: "css",
	},
	{
		question:
			"Which properties can the browser animate on the compositor without triggering layout?",
		categoryCode: "css",
		answerType: "multiple",
		status: "draft",
	},
	{
		question:
			"In `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`, what does `auto-fill` do?",
		categoryCode: "css",
	},
	{
		question: "Which of these create a new stacking context?",
		categoryCode: "css",
		answerType: "multiple",
	},
	{
		question: "What does this log?",
		categoryCode: "js",
		codeBlock: "console.log(0.1 + 0.2 === 0.3)",
	},
	{
		question:
			"Which array method returns a new array rather than mutating in place?",
		categoryCode: "js",
		status: "archived",
	},
	{
		question: "What does `Promise.allSettled` resolve with?",
		categoryCode: "js",
	},
	{
		question: "When does `useEffect` with an empty dependency array run?",
		categoryCode: "react",
	},
];

const POLLS: readonly Poll[] = QUESTIONS.map((overrides, index) =>
	createMockPoll({
		id: index + 1,
		pollNumber: index + 1,
		createdBy: CREATORS[index % CREATORS.length]?.id,
		...overrides,
	})
);

const propsFor = (
	filter: PollListFilter,
	admin: boolean,
	polls: readonly Poll[] = POLLS
): PollListProps => {
	const creators = admin ? CREATORS : undefined;
	const page = windowOf(
		pollRowsOf(visiblePollsOf(polls, filter), creators),
		PAGE_SIZE
	);
	return {
		admin,
		total: polls.length,
		matching: page.total,
		shown: page.shown,
		rows: page.rows,
		filter,
		choices: pollListChoicesOf(polls, filter, creators),
		suggestHref: "#",
		reward: APPROVED_POLL_REWARD,
		onFilterChange: noop,
		onLoadMore: page.more ? noop : undefined,
	};
};

const meta: Meta<typeof PollList> = {
	component: PollList,
	title: "Polls/PollList",
	args: propsFor(EMPTY_FILTER, true),
};
export default meta;

type Story = StoryObj<typeof PollList>;

export const Admin: Story = {};

export const Own: Story = { args: propsFor(EMPTY_FILTER, false) };

export const Filtered: Story = {
	args: propsFor({ ...EMPTY_FILTER, category: "css", withCode: true }, true),
};

export const Empty: Story = {
	args: propsFor({ ...EMPTY_FILTER, search: "monads" }, true),
};

export const Loading: Story = { render: () => <PollListLoading /> };

export const Error: Story = {
	render: () => <PollListError message="the database is asleep" />,
};
