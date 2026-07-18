import type { Meta, StoryObj } from "@storybook/react";

import type { CommunityVoter } from "~/modules/run/api/community.handlers";

import { RunCommunityBoard } from "./RunCommunity.ui";

const meta: Meta<typeof RunCommunityBoard> = {
	component: RunCommunityBoard,
	title: "Run/RunCommunityBoard",
};
export default meta;

type Story = StoryObj<typeof RunCommunityBoard>;

const GYM_LEADERS: CommunityVoter[] = [
	{ id: "brock", displayName: "Brock Boulder" },
	{ id: "misty", displayName: "Misty Cascade" },
	{ id: "lt-surge", displayName: "Lt Surge" },
	{ id: "erika", displayName: "Erika Rainbow" },
	{ id: "sabrina", displayName: "Sabrina Marsh" },
];

const detail = (agreed: number, right: number) => ({
	yourPickLabels: ["Guild[”members”]"],
	correctLabels: ["Guild.members"],
	agreedPercent: agreed,
	gotItRightPercent: right,
	answeredCount: GYM_LEADERS.length,
	gotItRightVoters: GYM_LEADERS.slice(0, 3),
	pickedYoursVoters: GYM_LEADERS.slice(3),
});

export const FullGate: Story = {
	args: {
		totalPlayers: 8,
		topPercent: 18,
		polls: [
			{
				pollId: 1,
				index: 0,
				question: "What does Pluck<Guild> return?",
				outcome: "correct",
				detail: { ...detail(64, 64), yourPickLabels: ["Guild.members"] },
			},
			{
				pollId: 2,
				index: 1,
				question: "Which selector is fastest?",
				outcome: "correct",
				detail: { ...detail(41, 41), yourPickLabels: ["Guild.members"] },
			},
			{
				pollId: 3,
				index: 2,
				question: "What does Copilot guarantee?",
				outcome: "wrong",
				detail: detail(23, 77),
			},
			{
				pollId: 4,
				index: 3,
				question: "Skipped by lint",
				outcome: "missed",
				detail: null,
			},
			{
				pollId: 5,
				index: 4,
				question: "Multi-select CSS quirks",
				outcome: "partial",
				detail: detail(35, 52),
			},
		],
	},
};

export const FirstPlayerOfTheDay: Story = {
	args: {
		totalPlayers: 1,
		topPercent: 100,
		polls: [
			{
				pollId: 1,
				index: 0,
				question: "What does Pluck<Guild> return?",
				outcome: "correct",
				detail: {
					...detail(100, 100),
					gotItRightVoters: GYM_LEADERS.slice(0, 1),
					pickedYoursVoters: GYM_LEADERS.slice(0, 1),
					answeredCount: 1,
				},
			},
		],
	},
};

export const NothingPlayedYet: Story = {
	args: {
		totalPlayers: 0,
		topPercent: null,
		polls: [],
	},
};
