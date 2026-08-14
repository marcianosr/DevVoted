import type { Meta, StoryObj } from "@storybook/react";

import type {
	CommunityOptionResult,
	CommunityVoter,
} from "~/modules/run/community/application/community.service";

import { RunCommunityBoard } from "~/modules/run/community/presentation/RunCommunity.ui";

const meta: Meta<typeof RunCommunityBoard> = {
	component: RunCommunityBoard,
	title: "Run/RunCommunityBoard",
};
export default meta;

type Story = StoryObj<typeof RunCommunityBoard>;

const you: CommunityVoter = { id: "red", displayName: "Red", you: true };
const brock: CommunityVoter = {
	id: "brock",
	displayName: "Brock Boulder",
	you: false,
};
const misty: CommunityVoter = {
	id: "misty",
	displayName: "Misty Cascade",
	you: false,
};
const surge: CommunityVoter = {
	id: "lt-surge",
	displayName: "Lt Surge",
	you: false,
};
const erika: CommunityVoter = {
	id: "erika",
	displayName: "Erika Rainbow",
	you: false,
};

const option = (
	over: Partial<CommunityOptionResult> & Pick<CommunityOptionResult, "label">
): CommunityOptionResult => ({
	isRight: false,
	count: 0,
	percent: 0,
	yours: false,
	voters: [],
	...over,
});

export const FullGate: Story = {
	args: {
		totalPlayers: 5,
		topPercent: 18,
		standouts: [
			{ voter: you, title: "fastest answer", value: "9s" },
			{ voter: misty, title: "first to answer", value: "1m45" },
			{ voter: brock, title: "most CSS polls", value: "3" },
		],
		polls: [
			{
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
						option({
							label: "Nothing happens and none of the CSS is applied",
							isRight: true,
							count: 2,
							percent: 40,
							yours: true,
							voters: [you, brock],
						}),
						option({
							label: "All three tags and the class turn red",
							count: 2,
							percent: 40,
							voters: [misty, surge],
						}),
						option({
							label: "Only the <h3>, <h4> and <a> tags turn red",
							count: 1,
							percent: 20,
							voters: [erika],
						}),
						option({ label: "Only the .1a class gets color:red" }),
						option({ label: "The CSS breaks entirely" }),
					],
				},
			},
			{
				pollId: 2,
				index: 1,
				question: "Which are valid Banjo-Kazooie moves?",
				category: "ts",
				outcome: "partial",
				detail: {
					answerType: "multiple",
					answeredCount: 4,
					gotItRightCount: 1,
					youGotItRight: false,
					options: [
						option({
							label: "Talon Trot",
							isRight: true,
							count: 3,
							percent: 75,
							yours: true,
							voters: [you, brock, misty],
						}),
						option({
							label: "Beak Barge",
							isRight: true,
							count: 1,
							percent: 25,
							voters: [brock],
						}),
						option({
							label: "Falcon Punch",
							count: 2,
							percent: 50,
							voters: [surge, erika],
						}),
					],
				},
			},
			{
				pollId: 3,
				index: 2,
				question: "",
				category: null,
				outcome: "missed",
				detail: null,
			},
		],
	},
};

export const FirstPlayerOfTheDay: Story = {
	args: {
		totalPlayers: 1,
		topPercent: 100,
		standouts: [{ voter: you, title: "first to answer", value: "12s" }],
		polls: [
			{
				pollId: 1,
				index: 0,
				question: "What does Pluck<Guild> return?",
				category: "ts",
				outcome: "correct",
				detail: {
					answerType: "single",
					answeredCount: 1,
					gotItRightCount: 1,
					youGotItRight: true,
					options: [
						option({
							label: "Guild.members",
							isRight: true,
							count: 1,
							percent: 100,
							yours: true,
							voters: [you],
						}),
						option({ label: "Guild[0]" }),
						option({ label: "Guild.at(0)" }),
					],
				},
			},
		],
	},
};

/**
 * The row the split was built for: the right answer over the one you handed in,
 * with the seven you never considered folded away — and a clean sweep of the
 * day's standouts.
 */
export const MissedIt: Story = {
	args: {
		totalPlayers: 8,
		topPercent: 12,
		standouts: [
			{ voter: you, title: "fastest answer", value: "4s" },
			{ voter: you, title: "first to answer", value: "1m21" },
			{ voter: you, title: "most CSS polls", value: "3" },
		],
		polls: [
			{
				pollId: 1,
				index: 0,
				question:
					"A selector to match elements without children — which is correct?",
				category: "css",
				outcome: "wrong",
				detail: {
					answerType: "single",
					answeredCount: 8,
					gotItRightCount: 4,
					youGotItRight: false,
					options: [
						option({
							label: ":empty()",
							isRight: true,
							count: 4,
							percent: 50,
							voters: [brock, misty, surge, erika],
						}),
						option({
							label: ":clearfix()",
							count: 1,
							percent: 13,
							yours: true,
							voters: [you],
						}),
						option({
							label: ":blank()",
							count: 1,
							percent: 13,
							voters: [misty],
						}),
						option({
							label: ":has()",
							count: 2,
							percent: 25,
							voters: [brock, erika],
						}),
						option({ label: ":root()" }),
						option({ label: ":scope()" }),
						option({ label: ":is()" }),
						option({ label: ":where()" }),
						option({ label: ":not()" }),
					],
				},
			},
		],
	},
};

export const NothingPlayedYet: Story = {
	args: {
		totalPlayers: 0,
		topPercent: null,
		standouts: [],
		polls: [],
	},
};
